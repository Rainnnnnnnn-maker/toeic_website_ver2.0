import type { ReviewQueue } from "@/lib/review-schedule";

export type StoredReviewSession = {
  v: 1;
  queue: ReviewQueue;
  dateKey: string;
  initialSlugs: string[];
  remainingSlugs: string[];
};

const QUEUES: readonly ReviewQueue[] = ["all", "due", "weak"];

function parseSlugArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return null;
  }
  return Array.from(new Set(value.filter((slug) => slug !== "")));
}

/** sessionStorage の固定キュー状態を検証する純関数。 */
export function parseStoredReviewSession(raw: string | null): StoredReviewSession | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as unknown;
    if (typeof value !== "object" || value === null) return null;
    const source = value as Record<string, unknown>;
    if (source.v !== 1 || !QUEUES.includes(source.queue as ReviewQueue)) {
      return null;
    }
    if (
      typeof source.dateKey !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(source.dateKey)
    ) {
      return null;
    }

    const initialSlugs = parseSlugArray(source.initialSlugs);
    const remainingSlugs = parseSlugArray(source.remainingSlugs);
    if (!initialSlugs || !remainingSlugs) return null;
    const initialSet = new Set(initialSlugs);
    if (!remainingSlugs.every((slug) => initialSet.has(slug))) return null;

    return {
      v: 1,
      queue: source.queue as ReviewQueue,
      dateKey: source.dateKey,
      initialSlugs,
      remainingSlugs,
    };
  } catch {
    return null;
  }
}

export function readStoredReviewSession(
  storageKey: string
): StoredReviewSession | null {
  try {
    return parseStoredReviewSession(sessionStorage.getItem(storageKey));
  } catch (error) {
    console.error("Failed to read fixed review session", error);
    return null;
  }
}

export function writeStoredReviewSession(
  storageKey: string,
  session: StoredReviewSession
): void {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save fixed review session", error);
  }
}

export function clearStoredReviewSession(storageKey: string): void {
  try {
    sessionStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear fixed review session", error);
  }
}
