import { describe, expect, it } from "vitest";
import { getTodayKey } from "@/lib/word-select";
import {
  buildRecordMap,
  buildReviewProgressRow,
  buildStreakRow,
  countReviewedOnDay,
  countReviewedSince,
  createReviewRecord,
  EMPTY_STREAK,
  getDueSlugs,
  getLastWeekStart,
  getNextDueAt,
  getReviewDayStart,
  getWeakSlugs,
  gradeRecord,
  isDue,
  MAX_REVIEW_BOX,
  nextStreak,
  parseReviewProgressRow,
  parseReviewQueue,
  parseStreakRow,
  resolveDisplayStreak,
  REVIEW_INTERVAL_DAYS,
  shiftDateKey,
  summarizeReview,
  type ReviewRecord,
} from "@/lib/review-schedule";

const DAY_MS = 24 * 60 * 60 * 1000;

// JST 2026-08-27 12:00 = UTC 2026-08-27T03:00:00Z（日付キーは 2026-08-27）
const NOW = new Date("2026-08-27T03:00:00Z");
const TODAY_KEY = "2026-08-27";
const TODAY_START = Date.parse("2026-08-26T22:00:00Z"); // JST 8/27 7:00

function record(overrides: Partial<ReviewRecord> & { slug: string }): ReviewRecord {
  return { ...createReviewRecord(overrides.slug), ...overrides };
}

describe("getReviewDayStart", () => {
  it("日付キーの開始時刻は JST 7:00 になる", () => {
    expect(getReviewDayStart(TODAY_KEY)).toBe(TODAY_START);
  });

  it("getTodayKey と往復する", () => {
    expect(getTodayKey(new Date(getReviewDayStart(TODAY_KEY)))).toBe(TODAY_KEY);
  });

  it("開始時刻の 1ms 前は前日のキーになる", () => {
    expect(getTodayKey(new Date(getReviewDayStart(TODAY_KEY) - 1))).toBe(
      "2026-08-26"
    );
  });
});

describe("shiftDateKey", () => {
  it("前後の日付キーを返す", () => {
    expect(shiftDateKey(TODAY_KEY, -1)).toBe("2026-08-26");
    expect(shiftDateKey(TODAY_KEY, 1)).toBe("2026-08-28");
    expect(shiftDateKey(TODAY_KEY, 7)).toBe("2026-09-03");
  });

  it("月をまたぐ", () => {
    expect(shiftDateKey("2026-09-01", -1)).toBe("2026-08-31");
    expect(shiftDateKey("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("gradeRecord", () => {
  it("覚えている: box が 1 つ上がり、翌日の 7:00 が次回予定になる", () => {
    const graded = gradeRecord(createReviewRecord("apple"), "remembered", NOW);

    expect(graded.box).toBe(1);
    expect(graded.reviewCount).toBe(1);
    expect(graded.forgotCount).toBe(0);
    expect(graded.lastReviewedAt).toBe(NOW.getTime());
    expect(graded.nextReviewAt).toBe(TODAY_START + DAY_MS);
  });

  it("覚えている: box ごとの間隔が REVIEW_INTERVAL_DAYS に従う", () => {
    REVIEW_INTERVAL_DAYS.forEach((days, index) => {
      const graded = gradeRecord(
        record({ slug: "apple", box: index }),
        "remembered",
        NOW
      );
      expect(graded.box).toBe(index + 1);
      expect(graded.nextReviewAt).toBe(TODAY_START + days * DAY_MS);
    });
  });

  it("覚えている: box は上限を超えない", () => {
    const graded = gradeRecord(
      record({ slug: "apple", box: MAX_REVIEW_BOX }),
      "remembered",
      NOW
    );
    expect(graded.box).toBe(MAX_REVIEW_BOX);
    expect(graded.nextReviewAt).toBe(TODAY_START + 30 * DAY_MS);
  });

  it("覚えていない: box が 1 に戻り、forgotCount が増える", () => {
    const graded = gradeRecord(
      record({ slug: "apple", box: 4, reviewCount: 9, forgotCount: 2 }),
      "forgot",
      NOW
    );

    expect(graded.box).toBe(1);
    expect(graded.reviewCount).toBe(10);
    expect(graded.forgotCount).toBe(3);
    expect(graded.nextReviewAt).toBe(TODAY_START + DAY_MS);
  });

  it("あとで: box と回数は変えず、翌日まで見送る", () => {
    const graded = gradeRecord(
      record({ slug: "apple", box: 3, reviewCount: 5, forgotCount: 1 }),
      "later",
      NOW
    );

    expect(graded.box).toBe(3);
    expect(graded.reviewCount).toBe(5);
    expect(graded.forgotCount).toBe(1);
    expect(graded.lastReviewedAt).toBe(NOW.getTime());
    expect(graded.nextReviewAt).toBe(TODAY_START + DAY_MS);
  });

  it("同じ日のうちは何時に採点しても次回予定が同じ", () => {
    const morning = gradeRecord(
      createReviewRecord("apple"),
      "remembered",
      new Date("2026-08-26T23:00:00Z") // JST 8/27 8:00
    );
    const night = gradeRecord(
      createReviewRecord("apple"),
      "remembered",
      new Date("2026-08-27T13:00:00Z") // JST 8/27 22:00
    );

    expect(morning.nextReviewAt).toBe(night.nextReviewAt);
  });
});

describe("nextStreak", () => {
  it("前日に学習していれば連続日数が増える", () => {
    const result = nextStreak(
      { lastStudyDateKey: "2026-08-26", currentStreak: 3, bestStreak: 5 },
      TODAY_KEY
    );
    expect(result).toEqual({
      lastStudyDateKey: TODAY_KEY,
      currentStreak: 4,
      bestStreak: 5,
    });
  });

  it("同じ日の 2 回目は変化しない", () => {
    const streak = {
      lastStudyDateKey: TODAY_KEY,
      currentStreak: 4,
      bestStreak: 5,
    };
    expect(nextStreak(streak, TODAY_KEY)).toBe(streak);
  });

  it("2 日以上空いたら 1 にリセットされる", () => {
    const result = nextStreak(
      { lastStudyDateKey: "2026-08-24", currentStreak: 9, bestStreak: 9 },
      TODAY_KEY
    );
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(9);
  });

  it("初回学習は 1 日目として記録される", () => {
    const result = nextStreak(EMPTY_STREAK, TODAY_KEY);
    expect(result).toEqual({
      lastStudyDateKey: TODAY_KEY,
      currentStreak: 1,
      bestStreak: 1,
    });
  });

  it("自己ベストを更新する", () => {
    const result = nextStreak(
      { lastStudyDateKey: "2026-08-26", currentStreak: 5, bestStreak: 5 },
      TODAY_KEY
    );
    expect(result.bestStreak).toBe(6);
  });
});

describe("resolveDisplayStreak", () => {
  it("今日・昨日の学習は連続日数をそのまま表示する", () => {
    expect(
      resolveDisplayStreak(
        { lastStudyDateKey: TODAY_KEY, currentStreak: 3, bestStreak: 3 },
        TODAY_KEY
      )
    ).toBe(3);
    expect(
      resolveDisplayStreak(
        { lastStudyDateKey: "2026-08-26", currentStreak: 3, bestStreak: 3 },
        TODAY_KEY
      )
    ).toBe(3);
  });

  it("2 日以上空いたら 0 として表示する", () => {
    expect(
      resolveDisplayStreak(
        { lastStudyDateKey: "2026-08-25", currentStreak: 3, bestStreak: 3 },
        TODAY_KEY
      )
    ).toBe(0);
  });

  it("未学習は 0", () => {
    expect(resolveDisplayStreak(EMPTY_STREAK, TODAY_KEY)).toBe(0);
  });
});

describe("isDue / getDueSlugs", () => {
  it("レコードが無い単語は復習対象", () => {
    expect(isDue(undefined, NOW.getTime())).toBe(true);
  });

  it("期限ちょうどは復習対象、1ms 先はまだ対象外", () => {
    expect(
      isDue(record({ slug: "a", box: 1, nextReviewAt: NOW.getTime() }), NOW.getTime())
    ).toBe(true);
    expect(
      isDue(
        record({ slug: "a", box: 1, nextReviewAt: NOW.getTime() + 1 }),
        NOW.getTime()
      )
    ).toBe(false);
  });

  it("期限切れの既習語を先に、未着手をその後に返す", () => {
    const records = buildRecordMap([
      record({ slug: "banana", box: 2, nextReviewAt: NOW.getTime() - DAY_MS }),
      record({ slug: "cherry", box: 1, nextReviewAt: NOW.getTime() - 3 * DAY_MS }),
      record({ slug: "durian", box: 3, nextReviewAt: NOW.getTime() + DAY_MS }),
    ]);

    expect(
      getDueSlugs(["apple", "banana", "cherry", "durian", "elder"], records, NOW)
    ).toEqual(["cherry", "banana", "apple", "elder"]);
  });

  it("未着手はお気に入り登録順（配列順）を保つ", () => {
    expect(getDueSlugs(["c", "a", "b"], new Map(), NOW)).toEqual(["c", "a", "b"]);
  });

  it("お気に入りから外れた単語のレコードは無視される", () => {
    const records = buildRecordMap([
      record({ slug: "removed", box: 1, nextReviewAt: NOW.getTime() - DAY_MS }),
    ]);
    expect(getDueSlugs(["apple"], records, NOW)).toEqual(["apple"]);
  });
});

describe("getNextDueAt", () => {
  it("未来の予定のうち最も早いものを返す", () => {
    const records = buildRecordMap([
      record({ slug: "a", box: 1, nextReviewAt: NOW.getTime() + 3 * DAY_MS }),
      record({ slug: "b", box: 2, nextReviewAt: NOW.getTime() + DAY_MS }),
    ]);
    expect(getNextDueAt(["a", "b"], records, NOW)).toBe(NOW.getTime() + DAY_MS);
  });

  it("期限切れしかなければ null", () => {
    const records = buildRecordMap([
      record({ slug: "a", box: 1, nextReviewAt: NOW.getTime() - DAY_MS }),
    ]);
    expect(getNextDueAt(["a"], records, NOW)).toBeNull();
  });

  it("お気に入りが空なら null", () => {
    expect(getNextDueAt([], new Map(), NOW)).toBeNull();
  });
});

describe("summarizeReview", () => {
  it("ボックスごとに分類する", () => {
    const records = buildRecordMap([
      record({ slug: "b1", box: 1, nextReviewAt: NOW.getTime() + DAY_MS }),
      record({ slug: "b2", box: 2, nextReviewAt: NOW.getTime() - DAY_MS }),
      record({ slug: "b3", box: 3, nextReviewAt: NOW.getTime() + DAY_MS }),
      record({ slug: "b4", box: 4, nextReviewAt: NOW.getTime() + DAY_MS }),
      record({ slug: "b5", box: 5, nextReviewAt: NOW.getTime() + DAY_MS }),
    ]);

    expect(
      summarizeReview(["new1", "b1", "b2", "b3", "b4", "b5"], records, NOW)
    ).toEqual({
      total: 6,
      due: 2, // new1（未着手）と b2（期限切れ）
      untouched: 1,
      learning: 2,
      familiar: 2,
      mastered: 1,
    });
  });

  it("お気に入りが空なら全て 0", () => {
    expect(summarizeReview([], new Map(), NOW)).toEqual({
      total: 0,
      due: 0,
      untouched: 0,
      learning: 0,
      familiar: 0,
      mastered: 0,
    });
  });
});

describe("getWeakSlugs", () => {
  it("間違えた回数が多い順に返す", () => {
    const records = buildRecordMap([
      record({ slug: "a", forgotCount: 1 }),
      record({ slug: "b", forgotCount: 5 }),
      record({ slug: "c", forgotCount: 0 }),
      record({ slug: "d", forgotCount: 3 }),
    ]);

    expect(getWeakSlugs(["a", "b", "c", "d"], records)).toEqual(["b", "d", "a"]);
  });

  it("同数ならお気に入り登録順", () => {
    const records = buildRecordMap([
      record({ slug: "a", forgotCount: 2 }),
      record({ slug: "b", forgotCount: 2 }),
    ]);
    expect(getWeakSlugs(["b", "a"], records)).toEqual(["b", "a"]);
  });

  it("limit で件数を絞る", () => {
    const records = buildRecordMap([
      record({ slug: "a", forgotCount: 3 }),
      record({ slug: "b", forgotCount: 2 }),
    ]);
    expect(getWeakSlugs(["a", "b"], records, 1)).toEqual(["a"]);
  });
});

describe("countReviewedSince / countReviewedOnDay", () => {
  it("指定時刻以降に復習した単語を数える", () => {
    const records = buildRecordMap([
      record({ slug: "a", lastReviewedAt: NOW.getTime() - DAY_MS }),
      record({ slug: "b", lastReviewedAt: NOW.getTime() - 10 * DAY_MS }),
      record({ slug: "c" }),
    ]);

    expect(
      countReviewedSince(["a", "b", "c"], records, getLastWeekStart(NOW))
    ).toBe(1);
  });

  it("その日（JST 7:00 区切り）に採点した単語を数える", () => {
    const records = buildRecordMap([
      record({ slug: "a", lastReviewedAt: TODAY_START }),
      record({ slug: "b", lastReviewedAt: TODAY_START - 1 }),
      record({ slug: "c", lastReviewedAt: TODAY_START + DAY_MS - 1 }),
      record({ slug: "d", lastReviewedAt: TODAY_START + DAY_MS }),
    ]);

    expect(countReviewedOnDay(["a", "b", "c", "d"], records, TODAY_KEY)).toBe(2);
  });
});

describe("parseReviewQueue", () => {
  it("既知のキューをそのまま返す", () => {
    expect(parseReviewQueue("due")).toBe("due");
    expect(parseReviewQueue("weak")).toBe("weak");
    expect(parseReviewQueue("all")).toBe("all");
  });

  it("未指定・未知の値は all にフォールバックする", () => {
    expect(parseReviewQueue(null)).toBe("all");
    expect(parseReviewQueue(undefined)).toBe("all");
    expect(parseReviewQueue("")).toBe("all");
    expect(parseReviewQueue("DUE")).toBe("all");
    expect(parseReviewQueue("__proto__")).toBe("all");
  });
});

describe("parseReviewProgressRow", () => {
  it("正常な行を変換する", () => {
    expect(
      parseReviewProgressRow({
        word_slug: "apple",
        box: 3,
        review_count: 4,
        forgot_count: 1,
        last_reviewed_at: "2026-08-27T03:00:00Z",
        next_review_at: "2026-09-03T00:00:00Z",
      })
    ).toEqual({
      slug: "apple",
      box: 3,
      reviewCount: 4,
      forgotCount: 1,
      lastReviewedAt: Date.parse("2026-08-27T03:00:00Z"),
      nextReviewAt: Date.parse("2026-09-03T00:00:00Z"),
    });
  });

  it("slug が無い・空・型違いの行は null", () => {
    expect(parseReviewProgressRow(null)).toBeNull();
    expect(parseReviewProgressRow("apple")).toBeNull();
    expect(parseReviewProgressRow({})).toBeNull();
    expect(parseReviewProgressRow({ word_slug: "" })).toBeNull();
    expect(parseReviewProgressRow({ word_slug: 42 })).toBeNull();
  });

  it("box は 0..MAX に丸められる", () => {
    expect(parseReviewProgressRow({ word_slug: "a", box: 99 })?.box).toBe(
      MAX_REVIEW_BOX
    );
    expect(parseReviewProgressRow({ word_slug: "a", box: -3 })?.box).toBe(0);
    expect(parseReviewProgressRow({ word_slug: "a", box: "3" })?.box).toBe(0);
  });

  it("不正な日時は null になる", () => {
    const parsed = parseReviewProgressRow({
      word_slug: "a",
      last_reviewed_at: "not a date",
      next_review_at: null,
    });
    expect(parsed?.lastReviewedAt).toBeNull();
    expect(parsed?.nextReviewAt).toBeNull();
  });

  it("負の回数は 0 に丸められる", () => {
    const parsed = parseReviewProgressRow({
      word_slug: "a",
      review_count: -5,
      forgot_count: 2.7,
    });
    expect(parsed?.reviewCount).toBe(0);
    expect(parsed?.forgotCount).toBe(2);
  });
});

describe("buildReviewProgressRow", () => {
  it("ReviewRecord を Supabase の行に戻せる", () => {
    const graded = gradeRecord(createReviewRecord("apple"), "remembered", NOW);
    const row = buildReviewProgressRow("user-1", graded);

    expect(row).toEqual({
      user_id: "user-1",
      word_slug: "apple",
      box: 1,
      review_count: 1,
      forgot_count: 0,
      last_reviewed_at: NOW.toISOString(),
      next_review_at: new Date(TODAY_START + DAY_MS).toISOString(),
    });
    expect(parseReviewProgressRow(row)).toEqual(graded);
  });
});

describe("parseStreakRow / buildStreakRow", () => {
  it("正常な行を変換する", () => {
    expect(
      parseStreakRow({
        last_study_date: "2026-08-27",
        current_streak: 4,
        best_streak: 9,
      })
    ).toEqual({
      lastStudyDateKey: "2026-08-27",
      currentStreak: 4,
      bestStreak: 9,
    });
  });

  it("行が無い・壊れている場合は初期値", () => {
    expect(parseStreakRow(null)).toEqual(EMPTY_STREAK);
    expect(parseStreakRow(undefined)).toEqual(EMPTY_STREAK);
    expect(parseStreakRow({ last_study_date: "yesterday" })).toEqual(EMPTY_STREAK);
  });

  it("タイムスタンプ形式でも日付部分を取り出す", () => {
    expect(
      parseStreakRow({ last_study_date: "2026-08-27T00:00:00Z" })
        .lastStudyDateKey
    ).toBe("2026-08-27");
  });

  it("StreakState を行に戻せる", () => {
    const streak = nextStreak(EMPTY_STREAK, TODAY_KEY);
    expect(buildStreakRow("user-1", streak)).toEqual({
      user_id: "user-1",
      last_study_date: TODAY_KEY,
      current_streak: 1,
      best_streak: 1,
    });
  });
});
