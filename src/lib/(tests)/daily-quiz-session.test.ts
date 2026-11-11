import { describe, it, expect } from "vitest";
import type { DailyQuiz, DailyQuizQuestion } from "../daily-quiz";
import {
  EMPTY_QUIZ_SESSION,
  advanceQuestion,
  answerQuestion,
  getDayProgress,
  parseQuizSession,
  pruneDays,
  resetDay,
  resolveSelectedDateKey,
  selectDay,
  type QuizSessionState,
} from "../daily-quiz-session";

function question(dateKey: string, slug: string, correctOptionId: string): DailyQuizQuestion {
  return {
    id: `${dateKey}:${slug}`,
    slug,
    term: slug,
    level: "important",
    options: ["a", "b", "c", "d"].map((id) => ({ id, text: `${slug}-${id}` })),
    correctOptionId,
    example: null,
    distractorSource: "ai",
  };
}

function quiz(dateKey: string, generatedAt = "2026-11-10T22:05:00.000Z"): DailyQuiz {
  return {
    version: 1,
    dateKey,
    wordListVersion: "0a1b2c3d",
    generatedAt,
    questions: [question(dateKey, "alpha", "a"), question(dateKey, "beta", "c"), question(dateKey, "gamma", "d")],
  };
}

const today = quiz("2026-11-11");

describe("parseQuizSession", () => {
  it("returns the empty state for missing or malformed values", () => {
    expect(parseQuizSession(null)).toBe(EMPTY_QUIZ_SESSION);
    expect(parseQuizSession("not json")).toBe(EMPTY_QUIZ_SESSION);
    expect(parseQuizSession("[]")).toBe(EMPTY_QUIZ_SESSION);
    expect(parseQuizSession(JSON.stringify({ v: 2, days: {} }))).toBe(EMPTY_QUIZ_SESSION);
  });

  it("round-trips a saved state", () => {
    const state: QuizSessionState = {
      v: 1,
      selected: { dateKey: "2026-11-10", todayKey: "2026-11-11" },
      days: { "2026-11-11": { stamp: today.generatedAt, answers: ["a", "b"], position: 1 } },
    };
    expect(parseQuizSession(JSON.stringify(state))).toEqual(state);
  });

  it("drops malformed days and a malformed selection", () => {
    const parsed = parseQuizSession(
      JSON.stringify({
        v: 1,
        selected: { dateKey: 5 },
        days: {
          good: { stamp: "s", answers: ["a"], position: 0 },
          noStamp: { answers: [], position: 0 },
          badAnswers: { stamp: "s", answers: [1], position: 0 },
          badPosition: { stamp: "s", answers: [], position: -1 },
        },
      }),
    );
    expect(parsed.selected).toBeNull();
    expect(Object.keys(parsed.days)).toEqual(["good"]);
  });
});

describe("resolveSelectedDateKey", () => {
  const days = [
    { dateKey: "2026-11-11", quiz: today },
    { dateKey: "2026-11-10", quiz: quiz("2026-11-10") },
    { dateKey: "2026-11-09", quiz: null },
  ];

  it("opens today by default", () => {
    expect(resolveSelectedDateKey(EMPTY_QUIZ_SESSION, days, "2026-11-11")).toBe("2026-11-11");
  });

  it("keeps a day chosen earlier on the same day", () => {
    const state = selectDay(EMPTY_QUIZ_SESSION, "2026-11-10", "2026-11-11");
    expect(resolveSelectedDateKey(state, days, "2026-11-11")).toBe("2026-11-10");
  });

  it("ignores a choice made on a previous day or for a day without a quiz", () => {
    const stale = selectDay(EMPTY_QUIZ_SESSION, "2026-11-10", "2026-11-10");
    expect(resolveSelectedDateKey(stale, days, "2026-11-11")).toBe("2026-11-11");
    const missing = selectDay(EMPTY_QUIZ_SESSION, "2026-11-09", "2026-11-11");
    expect(resolveSelectedDateKey(missing, days, "2026-11-11")).toBe("2026-11-11");
  });

  it("falls back to the newest day that has a quiz, then to today", () => {
    const withoutToday = [{ dateKey: "2026-11-11", quiz: null }, days[1]];
    expect(resolveSelectedDateKey(EMPTY_QUIZ_SESSION, withoutToday, "2026-11-11")).toBe("2026-11-10");
    expect(resolveSelectedDateKey(EMPTY_QUIZ_SESSION, [{ dateKey: "2026-11-11", quiz: null }], "2026-11-11")).toBe("2026-11-11");
    expect(resolveSelectedDateKey(EMPTY_QUIZ_SESSION, [], "2026-11-11")).toBeNull();
  });
});

describe("answerQuestion / advanceQuestion", () => {
  it("records an answer and keeps showing the same question until advanced", () => {
    const answered = answerQuestion(EMPTY_QUIZ_SESSION, today, "b");
    expect(getDayProgress(answered, today)).toEqual({ answers: ["b"], position: 0 });

    const advanced = advanceQuestion(answered, today);
    expect(getDayProgress(advanced, today)).toEqual({ answers: ["b"], position: 1 });
  });

  it("ignores a second answer to the same question", () => {
    const answered = answerQuestion(EMPTY_QUIZ_SESSION, today, "b");
    expect(answerQuestion(answered, today, "a")).toBe(answered);
  });

  it("ignores an option that does not exist", () => {
    expect(answerQuestion(EMPTY_QUIZ_SESSION, today, "z")).toBe(EMPTY_QUIZ_SESSION);
  });

  it("does not advance past an unanswered question", () => {
    expect(advanceQuestion(EMPTY_QUIZ_SESSION, today)).toBe(EMPTY_QUIZ_SESSION);
  });

  it("reaches the result position after the last question", () => {
    let state = EMPTY_QUIZ_SESSION;
    for (const optionId of ["a", "c", "d"]) {
      state = advanceQuestion(answerQuestion(state, today, optionId), today);
    }
    expect(getDayProgress(state, today)).toEqual({ answers: ["a", "c", "d"], position: 3 });
    expect(answerQuestion(state, today, "a")).toBe(state);
  });

  it("does not change the chosen day", () => {
    const selected = selectDay(EMPTY_QUIZ_SESSION, "2026-11-10", "2026-11-11");
    expect(answerQuestion(selected, today, "a").selected).toEqual(selected.selected);
  });
});

describe("getDayProgress", () => {
  const saved = (answers: string[], position: number, stamp = today.generatedAt): QuizSessionState => ({
    v: 1,
    selected: null,
    days: { [today.dateKey]: { stamp, answers, position } },
  });

  it("starts over when the quiz was regenerated", () => {
    expect(getDayProgress(saved(["a"], 1, "2026-11-01T00:00:00.000Z"), today)).toEqual({ answers: [], position: 0 });
  });

  it("starts over when saved answers do not fit the quiz", () => {
    expect(getDayProgress(saved(["z"], 0), today)).toEqual({ answers: [], position: 0 });
    expect(getDayProgress(saved(["a", "c", "d", "a"], 0), today)).toEqual({ answers: [], position: 0 });
  });

  it("never shows a question beyond the first unanswered one", () => {
    expect(getDayProgress(saved(["a"], 5), today)).toEqual({ answers: ["a"], position: 1 });
  });
});

describe("resetDay / selectDay / pruneDays", () => {
  it("clears the answers of one day only", () => {
    const yesterday = quiz("2026-11-10");
    const state = answerQuestion(answerQuestion(EMPTY_QUIZ_SESSION, today, "a"), yesterday, "b");
    const reset = resetDay(state, today);
    expect(getDayProgress(reset, today)).toEqual({ answers: [], position: 0 });
    expect(getDayProgress(reset, yesterday)).toEqual({ answers: ["b"], position: 0 });
  });

  it("returns the same state when the selection does not change", () => {
    const state = selectDay(EMPTY_QUIZ_SESSION, "2026-11-10", "2026-11-11");
    expect(selectDay(state, "2026-11-10", "2026-11-11")).toBe(state);
    expect(selectDay(state, "2026-11-10", "2026-11-12")).not.toBe(state);
  });

  it("drops days outside the playable window", () => {
    const state = answerQuestion(answerQuestion(EMPTY_QUIZ_SESSION, today, "a"), quiz("2026-11-01"), "b");
    expect(Object.keys(pruneDays(state, ["2026-11-11", "2026-11-10"]).days)).toEqual(["2026-11-11"]);
    expect(pruneDays(state, ["2026-11-11", "2026-11-01"])).toBe(state);
  });
});
