import type { ReviewRecord, StreakState } from "@/lib/review-schedule";

/**
 * Supabase への復習進捗書き込みが完了するまで保持するユーザー別アウトボックス。
 *
 * localStorage はあくまで再送用で、マイページに表示する正本は Supabase のまま。
 * 書き込みが拒否された環境でも同じタブ内では再送できるよう、メモリにも退避する。
 */

const OUTBOX_KEY_PREFIX = "toeic-review-outbox-v1:";

export type ReviewProgressOutbox = {
  v: 1;
  records: ReviewRecord[];
  streak: StreakState | null;
};

const EMPTY_OUTBOX: ReviewProgressOutbox = {
  v: 1,
  records: [],
  streak: null,
};

const volatileOutboxes = new Map<string, ReviewProgressOutbox>();

function storageKey(userId: string): string {
  return `${OUTBOX_KEY_PREFIX}${userId}`;
}

function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function parseRecord(value: unknown): ReviewRecord | null {
  if (typeof value !== "object" || value === null) return null;
  const source = value as Record<string, unknown>;

  if (typeof source.slug !== "string" || source.slug === "") return null;
  if (
    typeof source.box !== "number" ||
    !Number.isInteger(source.box) ||
    source.box < 0 ||
    source.box > 5
  ) {
    return null;
  }
  if (
    typeof source.reviewCount !== "number" ||
    !Number.isInteger(source.reviewCount) ||
    source.reviewCount < 0 ||
    typeof source.forgotCount !== "number" ||
    !Number.isInteger(source.forgotCount) ||
    source.forgotCount < 0
  ) {
    return null;
  }
  if (
    !isNullableFiniteNumber(source.lastReviewedAt) ||
    !isNullableFiniteNumber(source.nextReviewAt)
  ) {
    return null;
  }

  return {
    slug: source.slug,
    box: source.box,
    reviewCount: source.reviewCount,
    forgotCount: source.forgotCount,
    lastReviewedAt: source.lastReviewedAt,
    nextReviewAt: source.nextReviewAt,
  };
}

function parseStreak(value: unknown): StreakState | null {
  if (typeof value !== "object" || value === null) return null;
  const source = value as Record<string, unknown>;
  const dateKey = source.lastStudyDateKey;
  if (
    dateKey !== null &&
    (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey))
  ) {
    return null;
  }
  if (
    typeof source.currentStreak !== "number" ||
    !Number.isInteger(source.currentStreak) ||
    source.currentStreak < 0 ||
    typeof source.bestStreak !== "number" ||
    !Number.isInteger(source.bestStreak) ||
    source.bestStreak < 0
  ) {
    return null;
  }

  return {
    lastStudyDateKey: dateKey,
    currentStreak: source.currentStreak,
    bestStreak: source.bestStreak,
  };
}

/** localStorage の生文字列を検証する純関数。 */
export function parseReviewProgressOutbox(
  raw: string | null | undefined
): ReviewProgressOutbox {
  if (!raw) return EMPTY_OUTBOX;

  try {
    const value = JSON.parse(raw) as unknown;
    if (typeof value !== "object" || value === null) return EMPTY_OUTBOX;
    const source = value as Record<string, unknown>;
    if (source.v !== 1 || !Array.isArray(source.records)) return EMPTY_OUTBOX;

    const records = source.records
      .map(parseRecord)
      .filter((record): record is ReviewRecord => record !== null);
    const streak = source.streak === null ? null : parseStreak(source.streak);

    return { v: 1, records, streak };
  } catch {
    return EMPTY_OUTBOX;
  }
}

function cloneOutbox(outbox: ReviewProgressOutbox): ReviewProgressOutbox {
  return {
    v: 1,
    records: outbox.records.map((record) => ({ ...record })),
    streak: outbox.streak ? { ...outbox.streak } : null,
  };
}

export function readReviewProgressOutbox(userId: string): ReviewProgressOutbox {
  const volatile = volatileOutboxes.get(userId);
  if (volatile) return cloneOutbox(volatile);

  try {
    return parseReviewProgressOutbox(localStorage.getItem(storageKey(userId)));
  } catch (error) {
    console.error("Failed to read review progress outbox", error);
    return cloneOutbox(EMPTY_OUTBOX);
  }
}

function writeReviewProgressOutbox(
  userId: string,
  outbox: ReviewProgressOutbox
): void {
  const next = cloneOutbox(outbox);
  const isEmpty = next.records.length === 0 && next.streak === null;

  try {
    if (isEmpty) localStorage.removeItem(storageKey(userId));
    else localStorage.setItem(storageKey(userId), JSON.stringify(next));
    volatileOutboxes.delete(userId);
  } catch (error) {
    console.error("Failed to save review progress outbox", error);
    if (isEmpty) volatileOutboxes.delete(userId);
    else volatileOutboxes.set(userId, next);
  }
}

export function enqueueReviewRecord(userId: string, record: ReviewRecord): void {
  const outbox = readReviewProgressOutbox(userId);
  const records = outbox.records.filter((item) => item.slug !== record.slug);
  records.push({ ...record });
  writeReviewProgressOutbox(userId, { ...outbox, records });
}

export function enqueueReviewStreak(userId: string, streak: StreakState): void {
  const outbox = readReviewProgressOutbox(userId);
  writeReviewProgressOutbox(userId, { ...outbox, streak: { ...streak } });
}

function sameRecord(a: ReviewRecord, b: ReviewRecord): boolean {
  return (
    a.slug === b.slug &&
    a.box === b.box &&
    a.reviewCount === b.reviewCount &&
    a.forgotCount === b.forgotCount &&
    a.lastReviewedAt === b.lastReviewedAt &&
    a.nextReviewAt === b.nextReviewAt
  );
}

function sameStreak(a: StreakState, b: StreakState): boolean {
  return (
    a.lastStudyDateKey === b.lastStudyDateKey &&
    a.currentStreak === b.currentStreak &&
    a.bestStreak === b.bestStreak
  );
}

/** 送信した内容がまだ最新のときだけ削除する（後続採点との競合を防ぐ）。 */
export function acknowledgeReviewRecord(
  userId: string,
  sent: ReviewRecord
): void {
  const outbox = readReviewProgressOutbox(userId);
  const current = outbox.records.find((record) => record.slug === sent.slug);
  if (!current || !sameRecord(current, sent)) return;

  writeReviewProgressOutbox(userId, {
    ...outbox,
    records: outbox.records.filter((record) => record.slug !== sent.slug),
  });
}

export function acknowledgeReviewStreak(
  userId: string,
  sent: StreakState
): void {
  const outbox = readReviewProgressOutbox(userId);
  if (!outbox.streak || !sameStreak(outbox.streak, sent)) return;
  writeReviewProgressOutbox(userId, { ...outbox, streak: null });
}

export function hasPendingReviewProgress(userId: string): boolean {
  const outbox = readReviewProgressOutbox(userId);
  return outbox.records.length > 0 || outbox.streak !== null;
}
