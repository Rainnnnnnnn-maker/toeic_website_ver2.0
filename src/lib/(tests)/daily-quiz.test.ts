import { describe, it, expect } from "vitest";
import type { Word } from "@/data/words";
import type { WordDetails } from "@/types/word";
import {
  AI_DISTRACTOR_CANDIDATES,
  buildDailyQuizQuestion,
  buildDistractorPrompt,
  buildFallbackDistractors,
  buildVerificationPrompt,
  filterAiDistractors,
  formatQuizDayLabel,
  listRecentDateKeys,
  parseDistractorResponse,
  parseStoredDailyQuiz,
  parseVerificationResponse,
  pickVerifiedDistractors,
  quizCacheKey,
  quizMatchesWords,
  summarizeQuizDay,
  type DailyQuiz,
} from "../daily-quiz";
import { toQuizSourceWord, type QuizSourceWord } from "../quiz-question-builder";

function source(
  term: string,
  translation: string,
  options: { partsOfSpeech?: string[]; synonyms?: string[]; level?: Word["level"] } = {},
): QuizSourceWord {
  const detail: WordDetails = {
    word: term,
    pronunciation: "",
    meanings: (options.partsOfSpeech ?? ["動詞"]).map((partOfSpeech) => ({
      partOfSpeech,
      meaning: "",
      detailedMeanings: [],
    })),
    wordForms: [],
    synonyms: options.synonyms ?? [],
    nuance: "",
    toeicExamples: [{ english: `Use ${term}.`, japanese: `${term}を使う。` }],
    englishDefinition: "",
    japaneseTranslation: translation,
  };
  const built = toQuizSourceWord({ slug: term.toLowerCase(), term, level: options.level ?? "important" }, detail);
  if (!built) throw new Error(`fixture has no translation: ${term}`);
  return built;
}

const purchase = source("purchase", "購入する、買う、仕入れる", { synonyms: ["buy"] });
const aisle = source("aisle", "通路", { partsOfSpeech: ["名詞"] });

function quizFixture(dateKey = "2026-11-11"): DailyQuiz {
  return {
    version: 1,
    dateKey,
    wordListVersion: "0a1b2c3d",
    generatedAt: "2026-11-10T22:05:03.000Z",
    questions: [
      buildDailyQuizQuestion(dateKey, purchase, ["売却する、手放す", "借りる、賃借する", "修理する、直す"], "ai"),
      buildDailyQuizQuestion(dateKey, aisle, ["島", "階段", "座席"], "fallback"),
    ],
  };
}

describe("quizCacheKey / listRecentDateKeys", () => {
  it("builds a versioned key", () => {
    expect(quizCacheKey("2026-11-11")).toBe("quiz:v1:2026-11-11");
  });

  it("lists days from today backwards across a month boundary", () => {
    expect(listRecentDateKeys("2026-11-02", 4)).toEqual(["2026-11-02", "2026-11-01", "2026-10-31", "2026-10-30"]);
  });

  it("returns an empty list for an invalid date or length", () => {
    expect(listRecentDateKeys("2026-02-31", 7)).toEqual([]);
    expect(listRecentDateKeys("2026-11-11", 0)).toEqual([]);
  });
});

describe("formatQuizDayLabel", () => {
  it("names today and yesterday and shows a date with the weekday otherwise", () => {
    expect(formatQuizDayLabel("2026-11-11", "2026-11-11")).toBe("今日");
    expect(formatQuizDayLabel("2026-11-10", "2026-11-11")).toBe("昨日");
    expect(formatQuizDayLabel("2026-11-08", "2026-11-11")).toBe("11/8（日）");
  });

  it("returns the raw value when the date key is invalid", () => {
    expect(formatQuizDayLabel("not-a-date", "2026-11-11")).toBe("not-a-date");
  });
});

describe("buildDistractorPrompt / parseDistractorResponse", () => {
  it("describes every target with its correct answer and term count", () => {
    const prompt = buildDistractorPrompt([purchase, aisle]);
    expect(prompt).toContain('"slug":"purchase"');
    expect(prompt).toContain('"correct":"購入する、買う"');
    expect(prompt).toContain('"termCount":2');
    expect(prompt).toContain('"allMeanings":"購入する、買う、仕入れる"');
    expect(prompt).toContain('"slug":"aisle"');
    expect(prompt).toContain(`${AI_DISTRACTOR_CANDIDATES}つ`);
    expect(prompt).not.toContain("undefined");
  });

  it("reads candidates per slug and tolerates text around the JSON", () => {
    const parsed = parseDistractorResponse('```json\n{"items":[{"slug":"aisle","distractors":["島","階段"]}]}\n```');
    expect(parsed.get("aisle")).toEqual(["島", "階段"]);
  });

  it("keeps the first entry when a slug is repeated", () => {
    const parsed = parseDistractorResponse('{"items":[{"slug":"a","distractors":["x"]},{"slug":"a","distractors":["y"]}]}');
    expect(parsed.get("a")).toEqual(["x"]);
  });

  it("returns an empty map for malformed responses", () => {
    expect(parseDistractorResponse("no json here").size).toBe(0);
    expect(parseDistractorResponse('{"items": "oops"}').size).toBe(0);
    expect(parseDistractorResponse('{"items":[').size).toBe(0);
  });
});

describe("filterAiDistractors", () => {
  it("accepts candidates that match the form and term count of the correct answer", () => {
    const result = filterAiDistractors(purchase, ["売却する、手放す", "借りる,賃借する", "修理する、直す。"]);
    expect(result).toEqual({ accepted: ["売却する、手放す", "借りる、賃借する", "修理する、直す"], rejected: [] });
  });

  it("joins a candidate returned as an array of terms", () => {
    expect(filterAiDistractors(purchase, [["売却する", "手放す"]]).accepted).toEqual(["売却する、手放す"]);
  });

  it("rejects candidates one by one and keeps the valid ones", () => {
    const result = filterAiDistractors(purchase, [
      "売却する", // 訳語の数が違う
      "売却する、sell", // 英字
      "売却（する）、手放す", // 括弧
      "売却、処分", // 動詞の形ではない
      "仕入れる、調達する", // 正解の原文にある訳語（選択肢には出ていない）と重なる
      "配達する、届ける",
      "配達する、送る", // 先に通った候補と重なる
      42,
    ]);
    expect(result.accepted).toEqual(["配達する、届ける"]);
    expect(result.rejected).toEqual([
      "term-count",
      "bad-format",
      "bad-format",
      "form",
      "overlaps-correct",
      "duplicate",
      "bad-format",
    ]);
  });

  it("rejects a candidate that is too long", () => {
    expect(filterAiDistractors(aisle, ["とても長い説明のような誤答の選択肢になってしまった文"]).rejected).toEqual(["bad-format"]);
  });

  it("returns nothing when the value is not an array", () => {
    expect(filterAiDistractors(aisle, undefined)).toEqual({ accepted: [], rejected: [] });
    expect(filterAiDistractors(aisle, "島")).toEqual({ accepted: [], rejected: [] });
  });

  it("ignores candidates beyond the read limit", () => {
    const many = ["島", "階段", "座席", "棚", "入口", "出口", "屋根", "窓", "床", "壁"];
    expect(filterAiDistractors(aisle, many).accepted).toHaveLength(8);
  });
});

describe("verification helpers", () => {
  it("lists the candidates to check for each word", () => {
    const prompt = buildVerificationPrompt([{ target: aisle, distractors: ["島", "廊下"] }]);
    expect(prompt).toContain('"slug":"aisle"');
    expect(prompt).toContain('"meanings":"通路"');
    expect(prompt).toContain('"candidates":["島","廊下"]');
  });

  it("parses invalid indexes and drops values that are not indexes", () => {
    const parsed = parseVerificationResponse('{"items":[{"slug":"aisle","invalid":[1,"2",-1,1.5]},{"slug":"corp","invalid":[]}]}');
    expect([...(parsed.get("aisle") ?? [])]).toEqual([1]);
    expect(parsed.get("corp")?.size).toBe(0);
    expect(parsed.has("purchase")).toBe(false);
  });

  it("returns an empty map for malformed responses", () => {
    expect(parseVerificationResponse("sorry").size).toBe(0);
    expect(parseVerificationResponse('{"items":[{"slug":"aisle"}]}').size).toBe(0);
  });

  it("takes the first three candidates that were not flagged", () => {
    const candidates = ["島", "廊下", "階段", "座席", "棚"];
    expect(pickVerifiedDistractors(candidates, new Set([1]))).toEqual(["島", "階段", "座席"]);
    expect(pickVerifiedDistractors(candidates, new Set([0, 1, 2]))).toBeNull();
  });
});

describe("buildFallbackDistractors", () => {
  const pool = [
    aisle,
    source("staircase", "階段", { partsOfSpeech: ["名詞"] }),
    source("invoice", "請求書", { partsOfSpeech: ["名詞"] }),
    source("furniture", "家具", { partsOfSpeech: ["名詞"] }),
    source("corridor", "廊下、通路", { partsOfSpeech: ["名詞"] }),
  ];

  it("uses translations of other words and skips overlapping meanings", () => {
    const distractors = buildFallbackDistractors(aisle, pool);
    expect(distractors).toHaveLength(3);
    expect([...(distractors ?? [])].sort()).toEqual(["家具", "請求書", "階段"].sort());
  });

  it("returns null when the pool cannot provide three distractors", () => {
    expect(buildFallbackDistractors(aisle, pool.slice(0, 3))).toBeNull();
  });
});

describe("buildDailyQuizQuestion", () => {
  const distractors = ["売却する、手放す", "借りる、賃借する", "修理する、直す"];

  it("builds four options with exactly one correct answer", () => {
    const question = buildDailyQuizQuestion("2026-11-11", purchase, distractors, "ai");
    expect(question.id).toBe("2026-11-11:purchase");
    expect(question.options.map((option) => option.id)).toEqual(["a", "b", "c", "d"]);
    expect(new Set(question.options.map((option) => option.text)).size).toBe(4);
    const correct = question.options.find((option) => option.id === question.correctOptionId);
    expect(correct?.text).toBe("購入する、買う");
    expect(question.example).toEqual({ en: "Use purchase.", ja: "purchaseを使う。" });
    expect(question.distractorSource).toBe("ai");
  });

  it("is deterministic for the same day and reorders on another day", () => {
    const first = buildDailyQuizQuestion("2026-11-11", purchase, distractors, "ai");
    const again = buildDailyQuizQuestion("2026-11-11", purchase, [...distractors].reverse(), "ai");
    expect(again.options).toEqual(first.options);

    const orders = new Set(
      ["2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15", "2026-11-16"].map(
        (dateKey) => buildDailyQuizQuestion(dateKey, purchase, distractors, "ai").correctOptionId,
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("parseStoredDailyQuiz", () => {
  it("round-trips a stored quiz from an object or a JSON string", () => {
    const quiz = quizFixture();
    expect(parseStoredDailyQuiz(quiz)).toEqual(quiz);
    expect(parseStoredDailyQuiz(JSON.stringify(quiz))).toEqual(quiz);
  });

  it("drops unknown fields", () => {
    const quiz = quizFixture();
    const parsed = parseStoredDailyQuiz({ ...quiz, extra: "x", questions: quiz.questions.map((q) => ({ ...q, sourceSlug: "y" })) });
    expect(parsed).toEqual(quiz);
  });

  it("rejects values with the wrong shape", () => {
    const quiz = quizFixture();
    const [first] = quiz.questions;
    expect(parseStoredDailyQuiz(null)).toBeNull();
    expect(parseStoredDailyQuiz("not json")).toBeNull();
    expect(parseStoredDailyQuiz({ ...quiz, version: 2 })).toBeNull();
    expect(parseStoredDailyQuiz({ ...quiz, dateKey: "2026-02-31" })).toBeNull();
    expect(parseStoredDailyQuiz({ ...quiz, questions: [] })).toBeNull();
    expect(parseStoredDailyQuiz({ ...quiz, questions: Array.from({ length: 7 }, () => first) })).toBeNull();
    expect(parseStoredDailyQuiz({ ...quiz, questions: [first, first] })).toBeNull();
    expect(parseStoredDailyQuiz({ ...quiz, questions: [{ ...first, correctOptionId: "z" }] })).toBeNull();
    expect(parseStoredDailyQuiz({ ...quiz, questions: [{ ...first, options: first.options.slice(0, 3) }] })).toBeNull();
    expect(
      parseStoredDailyQuiz({ ...quiz, questions: [{ ...first, options: first.options.map((o) => ({ ...o, id: "a" })) }] }),
    ).toBeNull();
    expect(
      parseStoredDailyQuiz({ ...quiz, questions: [{ ...first, options: first.options.map((o) => ({ ...o, text: "あ".repeat(401) })) }] }),
    ).toBeNull();
    expect(parseStoredDailyQuiz({ ...quiz, questions: [{ ...first, level: "expert" }] })).toBeNull();
    expect(parseStoredDailyQuiz({ ...quiz, questions: [{ ...first, distractorSource: "human" }] })).toBeNull();
  });

  it("accepts a question without an example", () => {
    const quiz = quizFixture();
    const withoutExample = { ...quiz, questions: [{ ...quiz.questions[0], example: null }] };
    expect(parseStoredDailyQuiz(withoutExample)?.questions[0].example).toBeNull();
  });
});

describe("quizMatchesWords", () => {
  const quiz = quizFixture();

  it("accepts the same words in the same order, even when some words have no question", () => {
    expect(quizMatchesWords(quiz, [{ slug: "purchase" }, { slug: "aisle" }])).toBe(true);
    expect(quizMatchesWords(quiz, [{ slug: "purchase" }, { slug: "duty" }, { slug: "aisle" }])).toBe(true);
  });

  it("rejects a quiz built from other words or another order", () => {
    expect(quizMatchesWords(quiz, [{ slug: "purchase" }, { slug: "duty" }])).toBe(false);
    expect(quizMatchesWords(quiz, [{ slug: "aisle" }, { slug: "purchase" }])).toBe(false);
  });
});

describe("summarizeQuizDay", () => {
  const quiz = quizFixture();
  const [first, second] = quiz.questions;
  const wrongId = (question: typeof first) => question.options.find((option) => option.id !== question.correctOptionId)?.id ?? "";

  it("counts correct answers and lists wrong words in order", () => {
    expect(summarizeQuizDay(quiz, [wrongId(first), second.correctOptionId])).toEqual({
      total: 2,
      answered: 2,
      correctCount: 1,
      completed: true,
      wrongSlugs: ["purchase"],
    });
  });

  it("reports an unfinished day", () => {
    expect(summarizeQuizDay(quiz, [first.correctOptionId])).toMatchObject({ answered: 1, correctCount: 1, completed: false });
    expect(summarizeQuizDay(quiz, [])).toMatchObject({ answered: 0, completed: false, wrongSlugs: [] });
  });
});
