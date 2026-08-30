import { describe, expect, it } from "vitest";
import { parseReviewProgressOutbox } from "@/lib/review-progress-outbox";

describe("parseReviewProgressOutbox", () => {
  it("正常なアウトボックスを復元する", () => {
    const raw = JSON.stringify({
      v: 1,
      records: [
        {
          slug: "apple",
          box: 2,
          reviewCount: 3,
          forgotCount: 1,
          lastReviewedAt: 1000,
          nextReviewAt: 2000,
        },
      ],
      streak: {
        lastStudyDateKey: "2026-08-29",
        currentStreak: 4,
        bestStreak: 7,
      },
    });

    expect(parseReviewProgressOutbox(raw)).toEqual({
      v: 1,
      records: [
        {
          slug: "apple",
          box: 2,
          reviewCount: 3,
          forgotCount: 1,
          lastReviewedAt: 1000,
          nextReviewAt: 2000,
        },
      ],
      streak: {
        lastStudyDateKey: "2026-08-29",
        currentStreak: 4,
        bestStreak: 7,
      },
    });
  });

  it("壊れた行だけを除外し、不正JSONは空として扱う", () => {
    expect(
      parseReviewProgressOutbox(
        JSON.stringify({
          v: 1,
          records: [
            { slug: "bad", box: 99 },
            {
              slug: "valid",
              box: 1,
              reviewCount: 1,
              forgotCount: 0,
              lastReviewedAt: null,
              nextReviewAt: null,
            },
          ],
          streak: { lastStudyDateKey: "invalid" },
        })
      )
    ).toEqual({
      v: 1,
      records: [
        {
          slug: "valid",
          box: 1,
          reviewCount: 1,
          forgotCount: 0,
          lastReviewedAt: null,
          nextReviewAt: null,
        },
      ],
      streak: null,
    });
    expect(parseReviewProgressOutbox("{")).toEqual({
      v: 1,
      records: [],
      streak: null,
    });
  });
});
