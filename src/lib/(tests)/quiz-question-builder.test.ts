import { describe, it, expect } from "vitest";
import type { Word } from "@/data/words";
import type { WordDetails } from "@/types/word";
import {
  MAX_OPTION_TERMS,
  QUIZ_OPTION_COUNT,
  buildQuizQuestion,
  classifyTranslationTerm,
  getOptionIssues,
  getTranslationIssues,
  hasIrregularForm,
  hasMeaningOverlap,
  isKatakanaTerm,
  listUpcomingDateKeys,
  normalizeTerm,
  parsePartsOfSpeech,
  pickDistractors,
  sharesRoot,
  splitDisplayTerms,
  splitTranslationTerms,
  stemOfTerm,
  toQuizSourceWord,
  type QuizSourceWord,
} from "../quiz-question-builder";

type DetailInput = {
  translation: string;
  /** 語義ごとの品詞表記。複数渡すと meanings が複数になる */
  partsOfSpeech?: string[];
  synonyms?: string[];
  detailedSynonyms?: string[];
  example?: { english: string; japanese: string } | null;
};

function detail(term: string, input: DetailInput): WordDetails {
  const example = input.example === undefined ? { english: `Use ${term}.`, japanese: `${term}を使う。` } : input.example;
  return {
    word: term,
    pronunciation: "",
    meanings: (input.partsOfSpeech ?? ["動詞"]).map((partOfSpeech) => ({
      partOfSpeech,
      meaning: "",
      detailedMeanings: [
        {
          number: 1,
          definition: "",
          example: "",
          exampleJapanese: "",
          context: "",
          frequency: "",
          synonyms: input.detailedSynonyms ?? [],
        },
      ],
    })),
    wordForms: [],
    synonyms: input.synonyms ?? [],
    nuance: "",
    toeicExamples: example ? [example] : [],
    englishDefinition: "",
    japaneseTranslation: input.translation,
  };
}

function source(term: string, input: DetailInput, level: Word["level"] = "important"): QuizSourceWord {
  const built = toQuizSourceWord({ slug: term.toLowerCase(), term, level }, detail(term, input));
  if (!built) throw new Error(`fixture has no translation: ${term}`);
  return built;
}

describe("splitDisplayTerms", () => {
  it("splits on Japanese and ASCII separators without rewriting the text", () => {
    expect(splitDisplayTerms("承認する、 賛成する，許可する")).toEqual(["承認する", "賛成する", "許可する"]);
    expect(splitDisplayTerms("縁石；抑制する")).toEqual(["縁石", "抑制する"]);
  });

  it("does not split inside parentheses", () => {
    expect(splitDisplayTerms("生産する、農産物（果物、野菜）")).toEqual(["生産する", "農産物（果物、野菜）"]);
  });

  it("returns an empty list for blank input", () => {
    expect(splitDisplayTerms("  ")).toEqual([]);
  });
});

describe("normalizeTerm / splitTranslationTerms", () => {
  it("removes parenthetical notes, wave dashes and whitespace", () => {
    expect(normalizeTerm("空中（の）")).toBe("空中");
    expect(normalizeTerm("～に 関して")).toBe("に関して");
  });

  it("splits comparison terms on middle dots too and drops duplicates", () => {
    expect(splitTranslationTerms("承認する、賛成する，承認する")).toEqual(["承認する", "賛成する"]);
    expect(splitTranslationTerms("給与計算・支払いシステム")).toEqual(["給与計算", "支払いシステム"]);
  });
});

describe("stemOfTerm", () => {
  it("strips verb and adjective endings", () => {
    expect(stemOfTerm("承認する")).toBe("承認");
    expect(stemOfTerm("集中的な")).toBe("集中");
    expect(stemOfTerm("経済の")).toBe("経済");
  });

  it("keeps at least two characters", () => {
    expect(stemOfTerm("主な")).toBe("主な");
  });
});

describe("isKatakanaTerm", () => {
  it("detects katakana loanwords with or without an ending", () => {
    expect(isKatakanaTerm("プレビュー")).toBe(true);
    expect(isKatakanaTerm("タイムリーな")).toBe(true);
  });

  it("returns false when the term has other characters", () => {
    expect(isKatakanaTerm("ノートパソコン用")).toBe(false);
    expect(isKatakanaTerm("試写")).toBe(false);
  });
});

describe("parsePartsOfSpeech", () => {
  it("normalizes combined, annotated and English labels", () => {
    expect(parsePartsOfSpeech("名詞/動詞")).toEqual(["noun", "verb"]);
    expect(parsePartsOfSpeech("動詞（過去形・過去分詞形）")).toEqual(["verb"]);
    expect(parsePartsOfSpeech("Noun")).toEqual(["noun"]);
  });

  it("does not mistake labels that contain another part of speech", () => {
    expect(parsePartsOfSpeech("形容動詞")).toEqual(["adjective"]);
    expect(parsePartsOfSpeech("副詞")).toEqual(["adverb"]);
    expect(parsePartsOfSpeech("adverb")).toEqual(["adverb"]);
    expect(parsePartsOfSpeech("代名詞")).toEqual(["other"]);
    expect(parsePartsOfSpeech("前置詞")).toEqual(["other"]);
  });
});

describe("classifyTranslationTerm", () => {
  it("follows a single part-of-speech label regardless of the ending", () => {
    expect(classifyTranslationTerm("隣接した", ["adjective"])).toBe("adjective");
    expect(classifyTranslationTerm("価値のある", ["adjective"])).toBe("adjective");
    expect(classifyTranslationTerm("独立して", ["adverb"])).toBe("adverb");
    expect(classifyTranslationTerm("支払い", ["noun"])).toBe("noun");
  });

  it("chooses among several labels by the ending", () => {
    expect(classifyTranslationTerm("返金する", ["noun", "verb"])).toBe("verb");
    expect(classifyTranslationTerm("払い戻す", ["noun", "verb"])).toBe("verb");
    expect(classifyTranslationTerm("縁石", ["noun", "verb"])).toBe("noun");
    expect(classifyTranslationTerm("客観的な", ["noun", "adjective"])).toBe("adjective");
    expect(classifyTranslationTerm("前方へ", ["adverb", "adjective", "verb"])).toBe("adverb");
    expect(classifyTranslationTerm("早く", ["adjective", "adverb"])).toBe("adverb");
  });

  it("does not treat a two-character noun ending in 的 as an adjective", () => {
    expect(classifyTranslationTerm("目的", ["noun", "adjective"])).toBe("noun");
    expect(classifyTranslationTerm("客観的", ["noun", "adjective"])).toBe("adjective");
  });

  it("falls back to the ending when no usable label exists", () => {
    expect(classifyTranslationTerm("に関して", ["other"])).toBe("adverb");
    expect(classifyTranslationTerm("承認する", [])).toBe("verb");
    expect(classifyTranslationTerm("支出", [])).toBe("noun");
  });
});

describe("toQuizSourceWord", () => {
  it("returns null when the translation is empty", () => {
    const word: Word = { slug: "blank", term: "blank", level: "medium" };
    expect(toQuizSourceWord(word, detail("blank", { translation: "  " }))).toBeNull();
  });

  it("collects synonyms from both levels in lower case", () => {
    const built = source("approve", {
      translation: "承認する、賛成する",
      synonyms: ["Authorize"],
      detailedSynonyms: ["endorse", "authorize"],
    });
    expect(built.synonyms).toEqual(["authorize", "endorse"]);
    expect(built.translationClass).toBe("verb");
    expect(built.stems).toEqual(["承認", "賛成"]);
  });

  it("limits the option text to the first terms without rewriting them", () => {
    const built = source("facility", { translation: "施設、設備、機能、能力", partsOfSpeech: ["名詞"] });
    expect(built.optionText).toBe("施設、設備");
    expect(built.optionTermCount).toBe(MAX_OPTION_TERMS);
    expect(built.translation).toBe("施設、設備、機能、能力");
    expect(built.terms).toEqual(["施設", "設備", "機能", "能力"]);
  });

  it("keeps only the terms that share the form of the first term", () => {
    const curb = source("curb", { translation: "縁石；抑制する", partsOfSpeech: ["名詞", "動詞"] });
    expect(curb.translationClass).toBe("noun");
    expect(curb.optionText).toBe("縁石");

    const express = source("express", { translation: "表現する、急行の、速達便", partsOfSpeech: ["動詞", "形容詞", "名詞"] });
    expect(express.optionText).toBe("表現する");
  });

  it("drops katakana loanwords when another term remains", () => {
    const preview = source("preview", { translation: "プレビュー、試写、下見", partsOfSpeech: ["名詞"] });
    expect(preview.optionText).toBe("試写、下見");

    const marathon = source("marathon", { translation: "マラソン", partsOfSpeech: ["名詞"] });
    expect(marathon.optionText).toBe("マラソン");
  });

  it("drops an example that has no text", () => {
    expect(source("ensure", { translation: "確実にする", example: null }).example).toBeNull();
  });
});

describe("getTranslationIssues", () => {
  it("reports nothing for a short uniform translation", () => {
    expect(getTranslationIssues(source("approve", { translation: "承認する、賛成する" }))).toEqual([]);
  });

  it("describes the raw translation, not the trimmed option text", () => {
    const many = source("duty", { translation: "義務、責任、職務、関税", partsOfSpeech: ["名詞"] });
    expect(getTranslationIssues(many)).toEqual(["many-terms"]);

    const mixed = source("curb", { translation: "縁石；抑制する", partsOfSpeech: ["名詞", "動詞"] });
    expect(getTranslationIssues(mixed)).toEqual(["mixed-form"]);

    const katakana = source("preview", { translation: "プレビュー、試写", partsOfSpeech: ["名詞"] });
    expect(getTranslationIssues(katakana)).toEqual(["katakana-term"]);

    const long = source("facilitate", { translation: "物事が円滑に進むように手助けをする、促進する" });
    expect(getTranslationIssues(long)).toContain("too-long");
  });
});

describe("hasIrregularForm", () => {
  it("accepts dictionary forms", () => {
    expect(hasIrregularForm("承認する", "verb")).toBe(false);
    expect(hasIrregularForm("持続可能な", "adjective")).toBe(false);
    expect(hasIrregularForm("注目すべき", "adjective")).toBe(false);
    expect(hasIrregularForm("支払い", "noun")).toBe(false);
    expect(hasIrregularForm("同時に", "adverb")).toBe(false);
  });

  it("flags forms that would stand out among the options", () => {
    expect(hasIrregularForm("占められている", "verb")).toBe(true);
    expect(hasIrregularForm("喜んで", "adjective")).toBe(true);
    expect(hasIrregularForm("最新式", "adjective")).toBe(true);
    expect(hasIrregularForm("新しい", "noun")).toBe(true);
  });
});

describe("getOptionIssues", () => {
  it("reports nothing for a clean option", () => {
    expect(getOptionIssues(source("approve", { translation: "承認する、賛成する" }))).toEqual([]);
  });

  it("flags what remains in the option text", () => {
    const placeholder = source("regarding", { translation: "～に関して、～について", partsOfSpeech: ["前置詞"] });
    expect(getOptionIssues(placeholder)).toEqual(["has-placeholder"]);

    const parentheses = source("bestow", { translation: "（敬意をもって）与える、授ける" });
    expect(getOptionIssues(parentheses)).toEqual(["has-parentheses"]);

    const katakana = source("marathon", { translation: "マラソン", partsOfSpeech: ["名詞"] });
    expect(getOptionIssues(katakana)).toEqual(["katakana-only"]);

    const irregular = source("occupied", { translation: "占められている、忙しい", partsOfSpeech: ["動詞", "形容詞"] });
    expect(getOptionIssues(irregular)).toEqual(["irregular-form"]);

    const long = source("prioritize", { translation: "優先順位をつけて順番に処理する、優先的に取り扱う" });
    expect(getOptionIssues(long)).toEqual(["too-long"]);
  });

  it("ignores issues that were trimmed away", () => {
    const trimmed = source("utensil", { translation: "道具、器具、用具（特に調理器具）", partsOfSpeech: ["名詞"] });
    expect(trimmed.optionText).toBe("道具、器具");
    expect(getOptionIssues(trimmed)).toEqual([]);
  });
});

describe("hasMeaningOverlap", () => {
  it("treats a shared stem as the same meaning", () => {
    const approve = source("approve", { translation: "承認する、賛成する" });
    const authorize = source("authorize", { translation: "許可する、認可する、承認する" });
    expect(hasMeaningOverlap(approve, authorize)).toBe(true);
  });

  it("treats one stem containing another as overlapping", () => {
    const confirm = source("confirm", { translation: "確認する" });
    const reconfirm = source("reconfirm", { translation: "再確認する" });
    expect(hasMeaningOverlap(confirm, reconfirm)).toBe(true);
  });

  it("returns false for unrelated translations", () => {
    const approve = source("approve", { translation: "承認する" });
    const postpone = source("postpone", { translation: "延期する" });
    expect(hasMeaningOverlap(approve, postpone)).toBe(false);
  });
});

describe("sharesRoot", () => {
  it("detects derived forms", () => {
    expect(sharesRoot("employ", "employment")).toBe(true);
    expect(sharesRoot("Economic", "economical")).toBe(true);
  });

  it("ignores short or unrelated prefixes", () => {
    expect(sharesRoot("accept", "access")).toBe(false);
    expect(sharesRoot("order", "ordinary")).toBe(false);
  });
});

describe("pickDistractors", () => {
  const target = source("approve", { translation: "承認する、賛成する", synonyms: ["endorse", "agree"] });
  const pool = [
    target,
    source("postpone", { translation: "延期する、先送りする" }),
    source("cancel", { translation: "取り消す、中止する" }),
    source("report", { translation: "報告する、伝える" }),
    source("deliver", { translation: "配達する、届ける" }),
    source("authorize", { translation: "許可する、認可する、承認する" }),
    source("endorse", { translation: "支持する、是認する" }),
    source("consent", { translation: "同意する、応じる", synonyms: ["agree"] }),
    source("approval", { translation: "許諾、認可", partsOfSpeech: ["名詞"] }),
    source("approver", { translation: "決裁する、裁定する" }),
    source("rely", { translation: "〜に頼る、依存する" }),
  ];

  it("picks three distractors of the same form and never the target", () => {
    const { distractors } = pickDistractors(target, pool);
    expect(distractors).toHaveLength(QUIZ_OPTION_COUNT - 1);
    expect(distractors.every((d) => d.translationClass === "verb")).toBe(true);
    expect(distractors.map((d) => d.slug)).not.toContain("approve");
  });

  it("excludes synonyms, derived forms, overlapping meanings and unsuitable formats", () => {
    const { distractors, excluded, sameFormCandidates } = pickDistractors(target, pool);
    const slugs = distractors.map((d) => d.slug);
    for (const excludedSlug of ["authorize", "endorse", "consent", "approval", "approver", "rely"]) {
      expect(slugs).not.toContain(excludedSlug);
    }
    expect(excluded).toEqual({
      "different-form": 1,
      "unsuitable-format": 1,
      "listed-synonym": 1,
      "shared-synonym": 1,
      "shared-root": 1,
      "meaning-overlap": 1,
      "overlaps-other-option": 0,
    });
    expect(sameFormCandidates).toBe(9);
  });

  it("detects an overlap with a term that is not shown in the option", () => {
    const authorize = pool.find((word) => word.slug === "authorize");
    expect(authorize?.optionText).toBe("許可する、認可する");
    expect(pickDistractors(target, pool).distractors).not.toContain(authorize);
  });

  it("is deterministic and independent of pool order", () => {
    const first = pickDistractors(target, pool).distractors.map((d) => d.slug);
    const second = pickDistractors(target, [...pool].reverse()).distractors.map((d) => d.slug);
    expect(second).toEqual(first);
  });

  it("prefers candidates with the same number of shown terms and the same level", () => {
    const candidates = [
      target,
      source("alpha", { translation: "延期する" }),
      source("beta", { translation: "報告する" }),
      source("gamma", { translation: "配達する" }),
      source("delta", { translation: "取り消す、中止する" }, "high"),
      source("epsilon", { translation: "届ける、渡す" }),
      source("zeta", { translation: "集める、収集する" }),
      source("eta", { translation: "減らす、削減する" }),
    ];
    const slugs = pickDistractors(target, candidates).distractors.map((d) => d.slug);
    expect([...slugs].sort()).toEqual(["epsilon", "eta", "zeta"]);
  });

  it("does not pick two distractors that mean the same thing", () => {
    const candidates = [
      target,
      source("postpone", { translation: "延期する、先送りする" }),
      source("defer", { translation: "延期する、見送る" }),
      source("cancel", { translation: "取り消す、中止する" }),
      source("report", { translation: "報告する、伝える" }),
    ];
    const { distractors, excluded } = pickDistractors(target, candidates);
    const slugs = distractors.map((d) => d.slug);
    expect(slugs.includes("postpone") && slugs.includes("defer")).toBe(false);
    expect(excluded["overlaps-other-option"]).toBe(1);
  });

  it("returns fewer distractors when the pool is too small", () => {
    const small = [target, source("cancel", { translation: "取り消す、中止する" })];
    expect(pickDistractors(target, small).distractors).toHaveLength(1);
  });
});

describe("buildQuizQuestion", () => {
  const target = source("approve", { translation: "承認する、賛成する、認める" });
  const pool = [
    target,
    source("postpone", { translation: "延期する、先送りする" }),
    source("cancel", { translation: "取り消す、中止する" }),
    source("report", { translation: "報告する、伝える" }),
  ];

  it("builds four unique options with exactly one correct answer", () => {
    const { question } = buildQuizQuestion(target, pool);
    expect(question).not.toBeNull();
    const options = question?.options ?? [];
    expect(options.map((o) => o.id)).toEqual(["a", "b", "c", "d"]);
    expect(new Set(options.map((o) => o.text)).size).toBe(QUIZ_OPTION_COUNT);
    const correct = options.filter((o) => o.id === question?.correctOptionId);
    expect(correct).toHaveLength(1);
    expect(correct[0].text).toBe("承認する、賛成する");
    expect(correct[0].sourceSlug).toBe("approve");
  });

  it("uses the existing example as the explanation", () => {
    const { question } = buildQuizQuestion(target, pool);
    expect(question?.id).toBe("meaning-approve-001");
    expect(question?.explanation).toBe("Use approve. = approveを使う。");
    expect(question?.flags).toEqual([]);
  });

  it("returns null when there are not enough distractors", () => {
    const { question, pick } = buildQuizQuestion(target, pool.slice(0, 3));
    expect(question).toBeNull();
    expect(pick.distractors).toHaveLength(2);
  });

  it("does not always put the correct answer in the same position", () => {
    const verbs = ["承認", "延期", "中止", "報告", "配達", "収集", "削減", "検討", "提案", "交換", "保管", "移動"].map(
      (stem, index) => source(`word${index}`, { translation: `${stem}する` }),
    );
    const positions = new Set(
      verbs.map((verb) => buildQuizQuestion(verb, verbs).question?.correctOptionId),
    );
    expect(positions.size).toBeGreaterThan(1);
  });

  it("flags a correct answer that stands out and a missing example", () => {
    const longTarget = source("itemize", { translation: "項目別に列挙する、詳細に書き出す", example: null });
    const shortPool = [
      longTarget,
      source("alpha", { translation: "延期する、見送る" }),
      source("beta", { translation: "報告する、伝える" }),
      source("gamma", { translation: "配達する、届ける" }),
    ];
    const { question } = buildQuizQuestion(longTarget, shortPool);
    expect(question?.flags).toEqual(["correct-longest", "no-example"]);
  });

  it("flags a correct answer whose own text has an issue", () => {
    const placeholder = source("regarding", { translation: "～に関して", partsOfSpeech: ["副詞"] });
    const adverbs = [
      placeholder,
      source("recently", { translation: "最近", partsOfSpeech: ["副詞"] }),
      source("generally", { translation: "一般に", partsOfSpeech: ["副詞"] }),
      source("nearly", { translation: "ほぼ", partsOfSpeech: ["副詞"] }),
    ];
    expect(buildQuizQuestion(placeholder, adverbs).question?.flags).toContain("correct:has-placeholder");
  });
});

describe("listUpcomingDateKeys", () => {
  it("lists consecutive date keys across a month boundary", () => {
    expect(listUpcomingDateKeys("2026-11-29", 3)).toEqual(["2026-11-29", "2026-11-30", "2026-12-01"]);
  });

  it("returns an empty list for an invalid start or length", () => {
    expect(listUpcomingDateKeys("2026-02-31", 3)).toEqual([]);
    expect(listUpcomingDateKeys("2026-11-11", 0)).toEqual([]);
  });
});
