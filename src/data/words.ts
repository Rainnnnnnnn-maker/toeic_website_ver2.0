import "server-only";
import { connection } from "next/server";
import { cacheTag, cacheLife } from "next/cache";
import { cache } from "react";
import {
  getTodayKey,
  getWordListVersion,
  selectTodayWords,
  TODAY_WORDS_COUNT,
  type WordData,
} from "@/lib/word-select";
import { loadWordData, resolveDefaultWordSource } from "@/lib/word-source";

export type Word = {
  slug: string;
  term: string;
  level: 'important' | 'medium' | 'high';
};

// Cached function to fetch and parse words
async function getWordsData(): Promise<WordData> {
  'use cache';
  cacheTag('word-list');
  // 単語リストの更新頻度は低いため "max"（revalidate 30日）で再書き込みを抑制し、
  // Vercel の ISR Writes を節約する。更新時は /api/revalidate/words でオンデマンドにパージする。
  cacheLife('max');

  // ローカル / Blob の分岐は src/lib/word-source.ts に集約している
  // （`scripts/embed-words.ts` からも同じコーパスを読めるようにするため）。
  return loadWordData(resolveDefaultWordSource());
}

// Memoize the data fetching within the same request lifecycle
const getWordsDataCached = cache(async () => {
  return await getWordsData();
});

export async function getAllWords(): Promise<Word[]> {
  const data = await getWordsDataCached();
  return data.allWords;
}

export async function getImportantWords(): Promise<Word[]> {
  const data = await getWordsDataCached();
  return data.important;
}

export async function getMediumWords(): Promise<Word[]> {
  const data = await getWordsDataCached();
  return data.medium;
}

export async function getHighWords(): Promise<Word[]> {
  const data = await getWordsDataCached();
  return data.high;
}

export async function getWordBySlug(slug: string): Promise<Word | undefined> {
  const data = await getWordsDataCached();
  return data.allWords.find(w => w.slug === slug);
}

export type TodayRecommendedSelection = {
  /**
   * 選定に使った日付キー（JST 7:00 切り替えの YYYY-MM-DD）。
   * 単語詳細への `?from=today&today=<dateKey>&v=<wordListVersion>` クエリで受け渡し、
   * クライアント側が同じコーパスから選定結果を再計算できるようにする。
   */
  dateKey: string;
  wordListVersion: string;
  words: Word[];
};

/**
 * 「今日おすすめ」の選定結果を、選定に使った日付キーとコーパス版ごと返す。
 * 両方を URL へ載せることで、クライアントが端末時計に依存せず
 * サーバーと同一のセットを復元できる（JST 7:00 の日付境界と 7:05 の Cron の
 * 5分間のずれを踏んでも食い違わない）。
 */
export async function getTodayRecommendedSelection(
  limit: number = TODAY_WORDS_COUNT
): Promise<TodayRecommendedSelection> {
  'use cache';
  cacheTag('today-recommended-words', 'word-list');
  // JST 7:05 の Vercel Cron で毎日明示的に再検証する。
  // 時間ベースの日次再検証を併用すると Cron と二重に stale 化するため、長期保持する。
  cacheLife('max');

  const data = await getWordsDataCached();
  const dateKey = getTodayKey();
  return {
    dateKey,
    wordListVersion: getWordListVersion(data.allWords),
    words: selectTodayWords(data.allWords, dateKey, limit),
  };
}

// キャッシュ境界は getTodayRecommendedSelection 側に持たせ、ここでは包み直すだけにする
// （'use cache' を二重に置くとキャッシュエントリが2つになるため）。
export async function getTodayRecommendedWords(limit: number = TODAY_WORDS_COUNT): Promise<Word[]> {
  const { words } = await getTodayRecommendedSelection(limit);
  return words;
}

export async function getRelatedWords(currentSlug: string, count: number = 5): Promise<Word[]> {
  await connection();
  const currentWord = await getWordBySlug(currentSlug);
  if (!currentWord) return [];

  const data = await getWordsDataCached();
  let candidates: Word[] = [];

  if (currentWord.level === 'important') candidates = data.important;
  else if (currentWord.level === 'medium') candidates = data.medium;
  else candidates = data.high;

  // Filter out current word
  candidates = candidates.filter(w => w.slug !== currentSlug);

  const len = candidates.length;
  if (len === 0) return [];

  const limit = Math.min(count, len);
  const result: Word[] = [];
  const taken = new Set<number>();

  while(result.length < limit) {
    const idx = Math.floor(Math.random() * len);
    
    if(!taken.has(idx)) {
       taken.add(idx);
       result.push(candidates[idx]);
    }
  }
  return result;
}
