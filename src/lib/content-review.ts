import { createHash } from "node:crypto";

/** Server/CLI pure helper. Never import into client components. */
export function contentFingerprint(content: unknown): string {
  function canonical(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonical);
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
    }
    return value;
  }
  return createHash("sha256").update(JSON.stringify(canonical(content)) ?? "null").digest("hex");
}

export type ContentReview = {
  fingerprint: string;
  reviewer: string;
  reviewedAt: string;
  method: "ai-assisted" | "human";
};

/** Changed content or AI-only reviews must never inherit human approval. */
export function hasCurrentHumanReview(content: unknown, review?: ContentReview): boolean {
  return Boolean(review && review.method === "human" && review.reviewer.trim() && /^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt) && review.fingerprint === contentFingerprint(content));
}
