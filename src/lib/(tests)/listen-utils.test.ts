import { describe, it, expect } from "vitest";
import { pickExample } from "../listen-utils";
import type { WordDetails } from "@/types/word";

function base(): WordDetails {
  return {
    word: "respect",
    pronunciation: "",
    meanings: [],
    wordForms: [],
    synonyms: [],
    nuance: "",
    toeicExamples: [],
    englishDefinition: "",
    japaneseTranslation: "",
  };
}

describe("pickExample", () => {
  it("prefers the first toeicExample", () => {
    const detail = {
      ...base(),
      toeicExamples: [
        { english: "We respect the rules.", japanese: "私たちは規則を守る。" },
        { english: "second", japanese: "二番目" },
      ],
    };
    expect(pickExample(detail)).toEqual({
      en: "We respect the rules.",
      ja: "私たちは規則を守る。",
    });
  });

  it("falls back to the first detailedMeaning example", () => {
    const detail: WordDetails = {
      ...base(),
      meanings: [
        {
          partOfSpeech: "動詞",
          meaning: "尊敬する",
          detailedMeanings: [
            {
              number: 1,
              definition: "",
              example: "Students respect teachers.",
              exampleJapanese: "生徒は教師を尊敬する。",
              context: "",
              frequency: "",
              synonyms: [],
            },
          ],
        },
      ],
    };
    expect(pickExample(detail)).toEqual({
      en: "Students respect teachers.",
      ja: "生徒は教師を尊敬する。",
    });
  });

  it("returns empty strings when no example is available", () => {
    expect(pickExample(base())).toEqual({ en: "", ja: "" });
  });
});
