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

const TODAY_DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WORD_LIST_VERSION_PATTERN = /^[0-9a-f]{8}$/;

/**
 * 単語詳細への `?from=today&today=<日付キー>` クエリを検証する。
 *
 * 「今日おすすめ」からの前後ナビは、6語の slug を URL に並べる代わりに
 * 選定に使われた日付キーだけを受け取り、`selectTodayWords` で再計算する
 * （日次キャッシュタグを SSG 済みの単語詳細ページへ伝播させないため）。
 * 値はハッシュ入力になるだけで結果は必ず全単語リストの部分集合になるが、
 * 旧形式（slug のカンマ区切り）や壊れた値をそのまま選定へ流さないよう形式を固定する。
 *
 * @returns 妥当な `YYYY-MM-DD`、不正なら null（呼び出し側は全単語ナビへフォールバックする）
 */
export function parseTodayDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!TODAY_DATE_KEY_PATTERN.test(trimmed)) return null;

  // 2026-02-31 のような存在しない日付を弾く（往復して一致するかで判定）
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.toISOString().slice(0, 10) !== trimmed) return null;

  return trimmed;
}

/**
 * 今日おすすめの選定元コーパスを識別する短い版文字列を返す。
 * 選定は slug の集合だけに依存するため、語順・term・level は fingerprint に含めない。
 */
export function getWordListVersion(words: readonly Pick<Word, "slug">[]): string {
  const fingerprintSource = words
    .map((word) => word.slug)
    .sort()
    .map((slug) => `${slug.length}:${slug}`)
    .join("|");

  return hashString(fingerprintSource).toString(16).padStart(8, "0");
}

/** URL の `v` クエリから8桁のコーパス版を検証・正規化する。 */
export function parseWordListVersion(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return WORD_LIST_VERSION_PATTERN.test(normalized) ? normalized : null;
}

/**
 * 日付キーに基づき単語を決定論的に並べ替え、先頭 limit 件を返す。
 * 同一ハッシュ時は slug の辞書順で安定化する。
 */
export function selectTodayWords(words: readonly Word[], todayKey: string, limit: number): Word[] {
  if (words.length === 0 || limit <= 0) return [];

  const ordered = [...words].sort((a, b) => {
    const aHash = hashString(`${todayKey}:${a.slug}`);
    const bHash = hashString(`${todayKey}:${b.slug}`);
    if (aHash === bHash) return a.slug.localeCompare(b.slug);
    return aHash - bHash;
  });

  return ordered.slice(0, Math.min(limit, ordered.length));
}

export type TodayNavigationSelection = {
  dateKey: string;
  wordListVersion: string;
  words: Word[];
};

/**
 * URL の日付・コーパス版から、詳細ページ用の「今日おすすめ」ナビを安全に復元する。
 * コーパスが更新済み、または現在語が復元した6語に含まれない場合は null を返し、
 * 呼び出し側を全単語ナビへフォールバックさせる。
 */
export function resolveTodayNavigationSelection(
  words: readonly Word[],
  currentSlug: string,
  dateKeyValue: string | null | undefined,
  wordListVersionValue: string | null | undefined,
  limit: number = TODAY_WORDS_COUNT
): TodayNavigationSelection | null {
  const dateKey = parseTodayDateKey(dateKeyValue);
  const requestedWordListVersion = parseWordListVersion(wordListVersionValue);
  if (!dateKey || !requestedWordListVersion) return null;

  const currentWordListVersion = getWordListVersion(words);
  if (requestedWordListVersion !== currentWordListVersion) return null;

  const selectedWords = selectTodayWords(words, dateKey, limit);
  if (!selectedWords.some((word) => word.slug === currentSlug)) return null;

  return {
    dateKey,
    wordListVersion: currentWordListVersion,
    words: selectedWords,
  };
}
