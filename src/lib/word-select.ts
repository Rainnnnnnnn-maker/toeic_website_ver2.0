import type { Word } from "@/data/words";

/**
 * 単語選定・パースの純粋ロジック。
 * `server-only` や Next.js のキャッシュ API に依存しないため、単体テスト可能。
 * `src/data/words.ts` から利用される。
 */

export type WordLevel = Word["level"];

export type WordData = {
  important: Word[];
  medium: Word[];
  high: Word[];
  allWords: Word[];
};

/** 「今日おすすめ」として選定・表示する単語数。選定ロジックと表示/ナビUIで共有する。 */
export const TODAY_WORDS_COUNT = 6;

/** 1行1単語のテキストをパースする。前後空白を除去し、slug(小文字)で重複排除する。 */
export function parseWords(text: string, level: WordLevel): Word[] {
  const seen = new Set<string>();
  const lines = text.split(/\r?\n/);
  const words: Word[] = [];

  for (const raw of lines) {
    const term = raw.trim();
    if (!term) continue;
    const slug = term.toLowerCase();
    if (seen.has(slug)) continue;
    seen.add(slug);
    words.push({ slug, term, level });
  }
  return words;
}

/** レベル別配列から、slug で重複排除した allWords を含む WordData を構築する。 */
export function buildWordData(important: Word[], medium: Word[], high: Word[]): WordData {
  const allWordsMap = new Map<string, Word>();
  [...important, ...medium, ...high].forEach((w) => {
    if (!allWordsMap.has(w.slug)) {
      allWordsMap.set(w.slug, w);
    }
  });
  const allWords = Array.from(allWordsMap.values());

  return { important, medium, high, allWords };
}

/** FNV-1a 32bit ハッシュ。決定論的な日替わり選定に使用。 */
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * 「今日」の日付キー(YYYY-MM-DD)を返す。
 * JST(UTC+9)に補正したうえで 7 時間引くことで、日付が JST 7:00 に切り替わる。
 * @param now テスト用に注入可能（デフォルトは現在時刻）
 */
export function getTodayKey(now: Date = new Date()): string {
  const jstTime = now.getTime() + 9 * 60 * 60 * 1000;
  const targetTime = jstTime - 7 * 60 * 60 * 1000;
  return new Date(targetTime).toISOString().slice(0, 10);
}

/**
 * 日付キーに基づき単語を決定論的に並べ替え、先頭 limit 件を返す。
 * 同一ハッシュ時は slug の辞書順で安定化する。
 */
export function selectTodayWords(words: Word[], todayKey: string, limit: number): Word[] {
  if (words.length === 0 || limit <= 0) return [];

  const ordered = [...words].sort((a, b) => {
    const aHash = hashString(`${todayKey}:${a.slug}`);
    const bHash = hashString(`${todayKey}:${b.slug}`);
    if (aHash === bHash) return a.slug.localeCompare(b.slug);
    return aHash - bHash;
  });

  return ordered.slice(0, Math.min(limit, ordered.length));
}
