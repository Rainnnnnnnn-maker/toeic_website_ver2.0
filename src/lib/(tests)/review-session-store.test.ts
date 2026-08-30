import { describe, expect, it } from "vitest";
import { parseStoredReviewSession } from "@/lib/review-session-store";

describe("parseStoredReviewSession", () => {
  it("固定したキューと残りslugを復元する", () => {
    expect(
      parseStoredReviewSession(
        JSON.stringify({
          v: 1,
          queue: "due",
          dateKey: "2026-08-29",
          initialSlugs: ["a", "b", "c"],
          remainingSlugs: ["b", "c"],
        })
      )
    ).toEqual({
      v: 1,
      queue: "due",
      dateKey: "2026-08-29",
      initialSlugs: ["a", "b", "c"],
      remainingSlugs: ["b", "c"],
    });
  });

  it("初期集合にない残りslugや不正形式を拒否する", () => {
    expect(
      parseStoredReviewSession(
        JSON.stringify({
          v: 1,
          queue: "weak",
          dateKey: "2026-08-29",
          initialSlugs: ["a"],
          remainingSlugs: ["other"],
        })
      )
    ).toBeNull();
    expect(parseStoredReviewSession("{")).toBeNull();
  });
});
