import fs from "node:fs";
import path from "node:path";
import { list } from "@vercel/blob";
import {
  parseWords,
  buildWordData,
  type WordData,
  type WordLevel,
} from "@/lib/word-select";
import type { Word } from "@/data/words";
import { HTTP_TIMEOUT_MS, fetchWithRetry } from "@/lib/http-retry";

/**
 * 単語リストの取得元（ローカルファイル / Vercel Blob）を担う共有ローダー。
 * `server-only` や Next.js のキャッシュ API に依存しないため、
 * `src/data/words.ts`（サーバー）と `scripts/embed-words.ts`（CLI）の双方から
 * 同じコーパスを読める。取得元の分岐はこのモジュールだけに置くこと。
 *
 * Blob SDK と node:fs を含むため、クライアントコンポーネントから import しないこと。
 */

export type WordSource = "local" | "blob";

/** 環境に応じた既定の取得元。開発時のみローカルの `__words__/*.txt` を使う。 */
export function resolveDefaultWordSource(): WordSource {
  return process.env.NODE_ENV === "development" ? "local" : "blob";
}

/** 直接 URL（BLOB_URL_*）が3つ揃っているか。揃っていれば Blob の list 呼び出しを省略できる。 */
export function hasDirectBlobUrls(): boolean {
  return Boolean(
    process.env.BLOB_URL_IMPORTANT &&
      process.env.BLOB_URL_MEDIUM &&
      process.env.BLOB_URL_HIGH
  );
}

export function loadWordDataFromLocalFiles(): WordData {
  const loadWords = (filename: string, level: WordLevel): Word[] => {
    const filePath = path.join(process.cwd(), "__words__", filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`Local word file not found: ${filePath}`);
      return [];
    }
    const text = fs.readFileSync(filePath, "utf-8");
    return parseWords(text, level);
  };

  const important = loadWords("word.txt", "important");
  const medium = loadWords("word_mid.txt", "medium");
  const high = loadWords("word_high.txt", "high");

  return buildWordData(important, medium, high);
}

export async function loadWordDataFromBlob(): Promise<WordData> {
  // Check for direct URLs in environment variables to avoid List operations
  if (hasDirectBlobUrls()) {
    // 失敗時に [] を返すと "use cache"（max）で空リストが最大30日固定されるため throw する。
    // throw ならキャッシュされず、バックグラウンド再検証の失敗時は直前の正常キャッシュが使われ続ける。
    // GET は冪等なので再送して安全。ビルド時は全単語ページの生成がこの取得に依存するため、
    // 一時的なネットワーク断で 2,700 ページ超の生成が丸ごと落ちないようリトライする。
    const loadWordsDirect = async (url: string, level: WordLevel): Promise<Word[]> => {
      const text = await fetchWithRetry<string>(url, {
        timeoutMs: HTTP_TIMEOUT_MS.blob,
        label: `word list blob (${level})`,
        consume: (response) => response.text(),
      });
      return parseWords(text, level);
    };

    const [important, medium, high] = await Promise.all([
      loadWordsDirect(process.env.BLOB_URL_IMPORTANT!, "important"),
      loadWordsDirect(process.env.BLOB_URL_MEDIUM!, "medium"),
      loadWordsDirect(process.env.BLOB_URL_HIGH!, "high"),
    ]);

    return buildWordData(important, medium, high);
  }

  // @vercel/blob は TimeoutError を network error として再送し得るため、
  // reason なしの abort() で AbortError を発生させ、SDK の retry を即時終了させる。
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS.blob);
  let blobs: Awaited<ReturnType<typeof list>>["blobs"];
  try {
    ({ blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      abortSignal: controller.signal,
    }));
  } finally {
    clearTimeout(timeout);
  }

  const loadWords = async (filename: string, level: WordLevel): Promise<Word[]> => {
    // Find blob ending with filename (to handle potential folders or prefixes)
    const blob = blobs.find((b) => b.pathname.endsWith(filename));
    if (!blob) {
      // 空リストのまま長期キャッシュされるのを防ぐため、欠損は例外として扱う
      throw new Error(`Blob not found for: ${filename}`);
    }

    const text = await fetchWithRetry<string>(blob.url, {
      timeoutMs: HTTP_TIMEOUT_MS.blob,
      label: `word list blob (${filename})`,
      consume: (response) => response.text(),
    });
    return parseWords(text, level);
  };

  const [important, medium, high] = await Promise.all([
    loadWords("words-file/word.txt", "important"),
    loadWords("words-file/word_mid.txt", "medium"),
    loadWords("words-file/word_high.txt", "high"),
  ]);

  return buildWordData(important, medium, high);
}

/** 指定された取得元から単語リストを読み込む。 */
export async function loadWordData(source: WordSource): Promise<WordData> {
  return source === "local" ? loadWordDataFromLocalFiles() : loadWordDataFromBlob();
}
