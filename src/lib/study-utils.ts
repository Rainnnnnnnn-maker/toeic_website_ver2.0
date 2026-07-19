import type { Word } from "@/data/words";

/** sessionStorage に保存する学習状態（バージョン 1） */
export type PersistedStudyStateV1 = {
  v: 1;
  currentSlug: string;
  rememberedSlugs: string[];
  forgottenSlugs: string[];
  laterSlugs?: string[];
  consecutiveRememberCount?: number;
  updatedAt: number;
};

/** レベル別に分割した出題プール */
export type WordLevelPools = {
  all: Word[];
  important: Word[];
  medium: Word[];
  high: Word[];
};

/** 例文をハイライト対象/非対象に分割した断片 */
export type SentencePart = {
  text: string;
  isMatch: boolean;
};

/**
 * sessionStorage の生文字列を検証付きでパースする。
 * 形式が不正な場合は null を返す（例外は投げない）。
 */
export function parsePersistedStudyState(raw: string): PersistedStudyStateV1 | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    if (obj.v !== 1) return null;
    if (typeof obj.currentSlug !== "string") return null;
    if (!Array.isArray(obj.rememberedSlugs) || !obj.rememberedSlugs.every((s) => typeof s === "string")) {
      return null;
    }
    if (!Array.isArray(obj.forgottenSlugs) || !obj.forgottenSlugs.every((s) => typeof s === "string")) {
      return null;
    }
    if (obj.laterSlugs !== undefined && (!Array.isArray(obj.laterSlugs) || !obj.laterSlugs.every((s) => typeof s === "string"))) {
      return null;
    }
    if (obj.consecutiveRememberCount !== undefined && typeof obj.consecutiveRememberCount !== "number") return null;
    if (typeof obj.updatedAt !== "number") return null;
    return obj as PersistedStudyStateV1;
  } catch {
    return null;
  }
}

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function addUnique(values: string[], value: string): string[] {
  if (values.includes(value)) return values;
  return [...values, value];
}

export function removeValue(values: string[], value: string): string[] {
  return values.filter((v) => v !== value);
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** slug → Word の索引を作る */
export function buildWordMap(words: Word[]): Map<string, Word> {
  const map = new Map<string, Word>();
  for (const w of words) {
    map.set(w.slug, w);
  }
  return map;
}

/** 単語リストをレベル別の出題プールに分割する */
export function splitWordsByLevel(words: Word[]): WordLevelPools {
  return {
    all: words,
    important: words.filter((w) => w.level === "important"),
    medium: words.filter((w) => w.level === "medium"),
    high: words.filter((w) => w.level === "high"),
  };
}

/**
 * 連続正解回数による段階的な難易度調整で出題プールを選ぶ。
 * - 0〜4回: important 中心 (important 80%, medium 20%)
 * - 5〜9回: medium 中心 (important 20%, medium 60%, high 20%)
 * - 10回〜: high 中心 (important 10%, medium 30%, high 60%)
 * 該当レベルに単語が無い場合は存在するプールへフォールバックする。
 *
 * @param r 0 以上 1 未満の乱数（テストでは固定値を渡して分岐を検証できる）
 */
export function selectWordPool(consecutiveRememberCount: number, r: number, pools: WordLevelPools): Word[] {
  const { all, important, medium, high } = pools;

  if (consecutiveRememberCount < 5) {
    if (r < 0.8 && important.length > 0) return important;
    if (medium.length > 0) return medium;
    if (high.length > 0) return high;
  } else if (consecutiveRememberCount < 10) {
    if (r < 0.6 && medium.length > 0) return medium;
    if (r < 0.8 && important.length > 0) return important;
    if (high.length > 0) return high;
    if (medium.length > 0) return medium;
  } else {
    if (r < 0.6 && high.length > 0) return high;
    if (r < 0.9 && medium.length > 0) return medium;
    if (important.length > 0) return important;
    if (high.length > 0) return high;
  }

  return all;
}

/**
 * ランダム出題: 難易度調整済みプールから次の単語を選ぶ。
 * 現在の単語と同じものは最大 10 回まで再抽選する（単語が 2 語以上ある場合のみ）。
 * random は 1 試行につき 2 回呼ばれる（プール選択用・インデックス用）。
 */
export function pickRandomStudyWord(
  pools: WordLevelPools,
  currentSlug: string | null,
  consecutiveRememberCount: number,
  random: () => number = Math.random,
): Word | null {
  if (pools.all.length === 0) return null;

  let nextWord: Word;
  let safetyCounter = 0;

  do {
    const pool = selectWordPool(consecutiveRememberCount, random(), pools);
    nextWord = pool[Math.floor(random() * pool.length)];
    safetyCounter++;
  } while (
    pools.all.length > 1 &&
    currentSlug !== null &&
    nextWord.slug === currentSlug &&
    safetyCounter < 10
  );

  return nextWord;
}

/**
 * 順番出題: 現在の単語の次を返す（末尾の次は先頭へ戻る）。
 * currentSlug が null またはリストに無い場合は先頭を返す。
 */
export function pickSequentialStudyWord(words: Word[], currentSlug: string | null): Word | null {
  if (words.length === 0) return null;
  if (currentSlug === null) return words[0];
  const currentIndex = words.findIndex((w) => w.slug === currentSlug);
  return words[(currentIndex + 1) % words.length];
}

/**
 * 例文を対象単語（語頭一致 + 活用形 \w*）で分割し、各断片にハイライト対象かどうかを付与する。
 * 大文字小文字は区別しない。
 */
export function splitSentenceByTerm(sentence: string, term: string): SentencePart[] {
  const escaped = escapeRegExp(term);
  const parts = sentence.split(new RegExp(`(\\b${escaped}\\w*)`, "gi"));
  const matcher = new RegExp(`^${escaped}\\w*$`, "i");
  return parts.map((text) => ({ text, isMatch: matcher.test(text) }));
}

/**
 * Navigation Timing API から遷移種別（"reload" / "back_forward" など）を取得する。
 * ブラウザ以外の環境では undefined を返す。
 */
export function getNavigationType(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const entry = window.performance.getEntriesByType("navigation")[0];
  if (!entry) return undefined;
  if ("type" in entry) {
    return (entry as PerformanceNavigationTiming).type;
  }
  return undefined;
}
