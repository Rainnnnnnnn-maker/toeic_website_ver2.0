import { getTodayKey } from "@/lib/word-select";

/**
 * お気に入り単語の復習スケジュール（Leitner ボックス方式）の純粋ロジック。
 *
 * - 副作用なし・`server-only` なし。クライアント（マイページ / 復習モード）と
 *   Vitest の両方から import されるため、"use client" も付けないこと。
 * - 「いつ復習すべきか」の判断はすべてこのモジュールに閉じ込める。
 *   Supabase の行 <-> ドメイン型の変換もここに置き、UI 側では素の行を扱わない。
 */

export type ReviewGrade = "remembered" | "forgot" | "later";

export type ReviewRecord = {
  slug: string;
  /** 0 = 未着手, 1..5 = Leitner のボックス */
  box: number;
  reviewCount: number;
  forgotCount: number;
  /** epoch ms。未採点なら null */
  lastReviewedAt: number | null;
  /** epoch ms。null は「いつでも復習対象」を意味する */
  nextReviewAt: number | null;
};

export type StreakState = {
  /** JST 基準の日付キー（YYYY-MM-DD）。未学習なら null */
  lastStudyDateKey: string | null;
  currentStreak: number;
  bestStreak: number;
};

/** box 1..5 に対応する復習間隔（日）。box 0 は未着手で常に復習対象。 */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

export const MAX_REVIEW_BOX = REVIEW_INTERVAL_DAYS.length;

/** 1 回の復習セッションで出題する上限。期限切れが溜まっても萎えないようにする。 */
export const REVIEW_SESSION_LIMIT = 10;

/** マイページの「苦手単語」に表示する件数。 */
export const WEAK_WORDS_LIMIT = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * getTodayKey() は JST 7:00 を境界とする日付キーを返す（「今日の6単語」と同じ区切り）。
 * targetTime = now + 9h - 7h の UTC 日付なので、日付キーの開始時刻は逆算できる。
 * アプリ内で「今日」の定義を二重に持たないため、この境界をそのまま復習にも使う。
 */
export function getReviewDayStart(dateKey: string): number {
  return Date.parse(`${dateKey}T00:00:00Z`) - 2 * 60 * 60 * 1000;
}

/** 日付キーを days 日ずらす（JST の日境界は常に 24 時間間隔なので単純加算でよい）。 */
export function shiftDateKey(dateKey: string, days: number): string {
  return getTodayKey(new Date(getReviewDayStart(dateKey) + days * DAY_MS));
}

/** 復習セッションの出題対象。`/review?queue=` で指定される。 */
export type ReviewQueue = "all" | "due" | "weak";

const REVIEW_QUEUES: readonly ReviewQueue[] = ["all", "due", "weak"];

/** URL の queue パラメータを検証する。未知の値・未指定は "all"（従来どおり全件）。 */
export function parseReviewQueue(raw: string | null | undefined): ReviewQueue {
  return REVIEW_QUEUES.includes(raw as ReviewQueue) ? (raw as ReviewQueue) : "all";
}

export function createReviewRecord(slug: string): ReviewRecord {
  return {
    slug,
    box: 0,
    reviewCount: 0,
    forgotCount: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  };
}

/**
 * 採点を 1 件反映した新しいレコードを返す。
 *
 * 次回予定は「その日の開始時刻 + 間隔日数」に丸める。
 * now + N日 にすると、毎晩同じ時間に学習する人が数時間足りずに 1 日ずれ続けるため。
 */
export function gradeRecord(
  record: ReviewRecord,
  grade: ReviewGrade,
  now: Date = new Date()
): ReviewRecord {
  const nowMs = now.getTime();
  const todayStart = getReviewDayStart(getTodayKey(now));

  if (grade === "later") {
    // 判断保留。ボックスは動かさず、翌日まで出題を見送る。
    return {
      ...record,
      lastReviewedAt: nowMs,
      nextReviewAt: todayStart + DAY_MS,
    };
  }

  const box =
    grade === "remembered" ? Math.min(record.box + 1, MAX_REVIEW_BOX) : 1;
  const intervalDays = REVIEW_INTERVAL_DAYS[box - 1];

  return {
    slug: record.slug,
    box,
    reviewCount: record.reviewCount + 1,
    forgotCount: record.forgotCount + (grade === "forgot" ? 1 : 0),
    lastReviewedAt: nowMs,
    nextReviewAt: todayStart + intervalDays * DAY_MS,
  };
}

/** 連続学習日数を更新する。同じ日に何度学習しても 1 日としてしか数えない。 */
export function nextStreak(streak: StreakState, todayKey: string): StreakState {
  if (streak.lastStudyDateKey === todayKey) return streak;

  const currentStreak =
    streak.lastStudyDateKey === shiftDateKey(todayKey, -1)
      ? streak.currentStreak + 1
      : 1;

  return {
    lastStudyDateKey: todayKey,
    currentStreak,
    bestStreak: Math.max(streak.bestStreak, currentStreak),
  };
}

/** 表示用に、最終学習日が「今日でも昨日でもない」場合は連続日数を 0 として扱う。 */
export function resolveDisplayStreak(
  streak: StreakState,
  todayKey: string
): number {
  if (streak.lastStudyDateKey === null) return 0;
  if (streak.lastStudyDateKey === todayKey) return streak.currentStreak;
  if (streak.lastStudyDateKey === shiftDateKey(todayKey, -1)) {
    return streak.currentStreak;
  }
  return 0;
}

export function isDue(record: ReviewRecord | undefined, nowMs: number): boolean {
  if (!record) return true;
  if (record.nextReviewAt === null) return true;
  return record.nextReviewAt <= nowMs;
}

/**
 * 復習対象の slug を優先度順で返す。
 *
 * 1. 期限が来た既習語（期限が古い順 = 忘れかけている順）
 * 2. 未着手のお気に入り（登録が古い順。favoriteSlugs の並びをそのまま使う）
 *
 * 未着手を後ろに置くのは、お気に入りが多いユーザーで既習語の復習期限が
 * 埋もれ続けるのを防ぐため。
 */
export function getDueSlugs(
  favoriteSlugs: readonly string[],
  records: ReadonlyMap<string, ReviewRecord>,
  now: Date = new Date()
): string[] {
  const nowMs = now.getTime();

  return favoriteSlugs
    .map((slug, index) => ({ slug, index, record: records.get(slug) }))
    .filter((entry) => isDue(entry.record, nowMs))
    .sort((a, b) => {
      const aDue = a.record?.nextReviewAt ?? Number.POSITIVE_INFINITY;
      const bDue = b.record?.nextReviewAt ?? Number.POSITIVE_INFINITY;
      if (aDue !== bDue) return aDue - bDue;
      return a.index - b.index;
    })
    .map((entry) => entry.slug);
}

/** 次に復習期限が来る時刻（epoch ms）。すべて期限内なら最も早い予定を返す。 */
export function getNextDueAt(
  favoriteSlugs: readonly string[],
  records: ReadonlyMap<string, ReviewRecord>,
  now: Date = new Date()
): number | null {
  const nowMs = now.getTime();
  let next: number | null = null;

  for (const slug of favoriteSlugs) {
    const record = records.get(slug);
    if (!record || record.nextReviewAt === null) continue;
    if (record.nextReviewAt <= nowMs) continue;
    if (next === null || record.nextReviewAt < next) next = record.nextReviewAt;
  }

  return next;
}

export type ReviewSummary = {
  total: number;
  due: number;
  untouched: number;
  /** box 1-2: 復習中 */
  learning: number;
  /** box 3-4: 定着間近 */
  familiar: number;
  /** box 5: 定着済み */
  mastered: number;
};

export type RetentionLevel = "untouched" | "learning" | "familiar" | "mastered";

/** 集計と単語一覧で共用する定着度の分類。 */
export function getRetentionLevel(record: ReviewRecord | undefined): RetentionLevel {
  const box = record?.box ?? 0;
  if (box === 0) return "untouched";
  if (box <= 2) return "learning";
  if (box <= 4) return "familiar";
  return "mastered";
}

export function summarizeReview(
  favoriteSlugs: readonly string[],
  records: ReadonlyMap<string, ReviewRecord>,
  now: Date = new Date()
): ReviewSummary {
  const nowMs = now.getTime();
  const summary: ReviewSummary = {
    total: favoriteSlugs.length,
    due: 0,
    untouched: 0,
    learning: 0,
    familiar: 0,
    mastered: 0,
  };

  for (const slug of favoriteSlugs) {
    const record = records.get(slug);
    if (isDue(record, nowMs)) summary.due += 1;

    summary[getRetentionLevel(record)] += 1;
  }

  return summary;
}

/** 間違えた回数が多い順に slug を返す（お気に入りに残っているものだけ）。 */
export function getWeakSlugs(
  favoriteSlugs: readonly string[],
  records: ReadonlyMap<string, ReviewRecord>,
  limit: number = WEAK_WORDS_LIMIT
): string[] {
  return favoriteSlugs
    .map((slug, index) => ({ slug, index, record: records.get(slug) }))
    .filter((entry) => (entry.record?.forgotCount ?? 0) > 0)
    .sort((a, b) => {
      const diff =
        (b.record?.forgotCount ?? 0) - (a.record?.forgotCount ?? 0);
      if (diff !== 0) return diff;
      return a.index - b.index;
    })
    .slice(0, limit)
    .map((entry) => entry.slug);
}

/** 指定時刻以降に復習した単語数（最終復習日ベースの近似値）。 */
export function countReviewedSince(
  favoriteSlugs: readonly string[],
  records: ReadonlyMap<string, ReviewRecord>,
  sinceMs: number
): number {
  let count = 0;
  for (const slug of favoriteSlugs) {
    const lastReviewedAt = records.get(slug)?.lastReviewedAt;
    if (lastReviewedAt !== null && lastReviewedAt !== undefined && lastReviewedAt >= sinceMs) {
      count += 1;
    }
  }
  return count;
}

/** その日（JST 7:00 区切り）に採点した単語数。 */
export function countReviewedOnDay(
  favoriteSlugs: readonly string[],
  records: ReadonlyMap<string, ReviewRecord>,
  dateKey: string
): number {
  const start = getReviewDayStart(dateKey);
  const end = start + DAY_MS;
  let count = 0;

  for (const slug of favoriteSlugs) {
    const lastReviewedAt = records.get(slug)?.lastReviewedAt;
    if (lastReviewedAt === null || lastReviewedAt === undefined) continue;
    if (lastReviewedAt >= start && lastReviewedAt < end) count += 1;
  }

  return count;
}

/** 直近 7 日間の開始時刻（epoch ms）。「今週復習した単語数」の集計に使う。 */
export function getLastWeekStart(now: Date = new Date()): number {
  return getReviewDayStart(getTodayKey(now)) - 6 * DAY_MS;
}

// ---------------------------------------------------------------------------
// Supabase の行 <-> ドメイン型
// ---------------------------------------------------------------------------

export type ReviewProgressRow = {
  user_id: string;
  word_slug: string;
  box: number;
  review_count: number;
  forgot_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
};

export type StreakRow = {
  user_id: string;
  last_study_date: string | null;
  current_streak: number;
  best_streak: number;
};

function toTimestamp(value: unknown): number | null {
  if (typeof value !== "string" || value === "") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function toIsoOrNull(value: number | null): string | null {
  return value === null ? null : new Date(value).toISOString();
}

/** Supabase の 1 行を ReviewRecord に変換する。壊れた行は null（＝未着手扱い）。 */
export function parseReviewProgressRow(row: unknown): ReviewRecord | null {
  if (typeof row !== "object" || row === null) return null;
  const source = row as Record<string, unknown>;

  const slug = source.word_slug;
  if (typeof slug !== "string" || slug === "") return null;

  const rawBox = source.box;
  const box =
    typeof rawBox === "number" && Number.isFinite(rawBox)
      ? Math.min(Math.max(Math.floor(rawBox), 0), MAX_REVIEW_BOX)
      : 0;

  return {
    slug,
    box,
    reviewCount: toCount(source.review_count),
    forgotCount: toCount(source.forgot_count),
    lastReviewedAt: toTimestamp(source.last_reviewed_at),
    nextReviewAt: toTimestamp(source.next_review_at),
  };
}

export function buildReviewProgressRow(
  userId: string,
  record: ReviewRecord
): ReviewProgressRow {
  return {
    user_id: userId,
    word_slug: record.slug,
    box: record.box,
    review_count: record.reviewCount,
    forgot_count: record.forgotCount,
    last_reviewed_at: toIsoOrNull(record.lastReviewedAt),
    next_review_at: toIsoOrNull(record.nextReviewAt),
  };
}

export const EMPTY_STREAK: StreakState = {
  lastStudyDateKey: null,
  currentStreak: 0,
  bestStreak: 0,
};

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** learning_streaks の行を StreakState に変換する。行が無い/壊れている場合は初期値。 */
export function parseStreakRow(row: unknown): StreakState {
  if (typeof row !== "object" || row === null) return EMPTY_STREAK;
  const source = row as Record<string, unknown>;

  const rawDate = source.last_study_date;
  // Postgres の date 型は "YYYY-MM-DD" で返るが、タイムスタンプ形式でも先頭 10 文字を使う
  const dateKey =
    typeof rawDate === "string" && DATE_KEY_PATTERN.test(rawDate.slice(0, 10))
      ? rawDate.slice(0, 10)
      : null;

  return {
    lastStudyDateKey: dateKey,
    currentStreak: toCount(source.current_streak),
    bestStreak: toCount(source.best_streak),
  };
}

export function buildStreakRow(userId: string, streak: StreakState): StreakRow {
  return {
    user_id: userId,
    last_study_date: streak.lastStudyDateKey,
    current_streak: streak.currentStreak,
    best_streak: streak.bestStreak,
  };
}

/** 取得した行の配列を slug 引きの Map にする。 */
export function buildRecordMap(
  records: readonly ReviewRecord[]
): Map<string, ReviewRecord> {
  return new Map(records.map((record) => [record.slug, record]));
}

/**
 * Supabase の値と未送信アウトボックスの値を統合する。
 * 最終採点日時が新しい方を優先し、同時刻なら回数が進んでいる方を採用する。
 */
export function mergePendingReviewRecord(
  server: ReviewRecord | undefined,
  pending: ReviewRecord
): ReviewRecord {
  if (!server) return pending;

  const serverTime = server.lastReviewedAt ?? Number.NEGATIVE_INFINITY;
  const pendingTime = pending.lastReviewedAt ?? Number.NEGATIVE_INFINITY;
  if (pendingTime > serverTime) return pending;
  if (serverTime > pendingTime) return server;

  if (pending.reviewCount > server.reviewCount) return pending;
  if (server.reviewCount > pending.reviewCount) return server;
  if (pending.forgotCount > server.forgotCount) return pending;
  return server;
}

/** 連続日数は新しい学習日を優先し、自己ベストは両方の最大値を残す。 */
export function mergePendingStreak(
  server: StreakState,
  pending: StreakState
): StreakState {
  const serverDate = server.lastStudyDateKey ?? "";
  const pendingDate = pending.lastStudyDateKey ?? "";
  const latest = pendingDate > serverDate ? pending : server;

  return {
    lastStudyDateKey: latest.lastStudyDateKey,
    currentStreak:
      pendingDate === serverDate
        ? Math.max(server.currentStreak, pending.currentStreak)
        : latest.currentStreak,
    bestStreak: Math.max(server.bestStreak, pending.bestStreak),
  };
}
