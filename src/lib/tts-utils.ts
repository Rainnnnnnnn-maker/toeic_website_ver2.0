import { createHash } from "crypto";
import type { WordDetails } from "@/types/word";

/**
 * TTS の入力検証・キャッシュキー生成の純粋ロジック。
 * `server-only` や Redis/Google TTS に依存しないため単体テスト可能。
 * `src/app/api/tts/route.ts` から利用される。
 */

/** 連続空白を 1 つに畳み、前後を trim する。 */
export function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** 英数字とハイフンのみ残し、最大 64 文字に切り詰める（キー破壊防止）。 */
export function sanitizeSlug(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 64);
}

/**
 * TTS キャッシュキーを生成する。
 * - 単一英単語: `tts:en:word:<slug>`
 * - それ以外: `tts:<lang>:<wordSlugTag|_>:<sha256先頭12桁>`
 */
export function ttsCacheKey(text: string, language: string, wordSlug?: string): string {
  const trimmed = text.trim();
  const isSingleWord = !/\s/.test(trimmed);

  if (isSingleWord && language === "en") {
    const normalized = sanitizeSlug(trimmed);
    if (normalized) return `tts:en:word:${normalized}`;
  }

  const hash = createHash("sha256").update(trimmed).digest("hex").slice(0, 12);
  const tag = wordSlug ? sanitizeSlug(wordSlug) : "";
  return `tts:${language}:${tag || "_"}:${hash}`;
}

/**
 * Origin/Referer ヘッダの host が、リクエストの host と厳密に一致するか判定する。
 * `header.includes(host)` のような部分一致は
 * `https://www.example.com.attacker.com` のような文字列を誤って許可してしまうため、
 * URL としてパースした host 同士で厳密比較する。パース不能な場合は false。
 */
export function isSameHost(
  header: string | null | undefined,
  host: string | null | undefined
): boolean {
  if (!header || !host) return false;
  try {
    return new URL(header).host === host;
  } catch {
    return false;
  }
}

/**
 * 指定テキストが、単語詳細内の既知の例文（toeicExamples もしくは
 * meanings[].detailedMeanings[].example）と空白正規化後に一致するか判定する。
 */
export function matchesExample(
  detail: WordDetails,
  text: string,
  language: "en" | "ja"
): boolean {
  const target = normalizeText(text);

  for (const ex of detail.toeicExamples ?? []) {
    if (language === "en" && normalizeText(ex.english) === target) return true;
    if (language === "ja" && normalizeText(ex.japanese) === target) return true;
  }

  for (const meaning of detail.meanings ?? []) {
    for (const dm of meaning.detailedMeanings ?? []) {
      if (language === "en" && normalizeText(dm.example) === target) return true;
      if (language === "ja" && normalizeText(dm.exampleJapanese) === target) return true;
    }
  }

  return false;
}
