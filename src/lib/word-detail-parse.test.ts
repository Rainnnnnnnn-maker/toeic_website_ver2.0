import { describe, it, expect } from "vitest";
import { parseJsonFromText, normalizePayload } from "./word-detail-parse";
import type { RawWordPayload } from "@/types/word";

describe("parseJsonFromText", () => {
  it("parses a plain JSON object", () => {
    const out = parseJsonFromText('{"word":"respect"}');
    expect(out.word).toBe("respect");
  });

  it("strips ```json code fences", () => {
    const out = parseJsonFromText('```json\n{"word":"respect"}\n```');
    expect(out.word).toBe("respect");
  });

  it("strips bare ``` fences", () => {
    const out = parseJsonFromText('```\n{"word":"respect"}\n```');
    expect(out.word).toBe("respect");
  });

  it("extracts the object when surrounded by prose", () => {
    const out = parseJsonFromText('Here you go: {"word":"respect"} hope it helps');
    expect(out.word).toBe("respect");
  });

  it("throws when there is no JSON object", () => {
    expect(() => parseJsonFromText("no json here")).toThrow(/did not include a JSON object/);
  });

  it("throws on truncated output (missing closing brace)", () => {
    expect(() => parseJsonFromText('{"word":"respect"')).toThrow(/truncated/);
  });

  it("throws a descriptive error on invalid JSON", () => {
    expect(() => parseJsonFromText('{"word": respect}')).toThrow(/Invalid JSON from Gemini/);
  });
});

describe("normalizePayload", () => {
  it("fills missing fields with defaults", () => {
    const out = normalizePayload("respect", {} as RawWordPayload);
    expect(out).toMatchObject({
      word: "respect",
      pronunciation: "",
      meanings: [],
      wordForms: [],
      synonyms: [],
      nuance: "",
      toeicExamples: [],
      englishDefinition: "",
      japaneseTranslation: "",
      etymology: "",
      collocations: [],
    });
  });

  it("caps array lengths (wordForms<=5, synonyms<=5, toeicExamples<=5, collocations<=3)", () => {
    const payload = {
      wordForms: Array.from({ length: 8 }, (_, i) => ({ form: `f${i}`, type: "t" })),
      synonyms: Array.from({ length: 8 }, (_, i) => `s${i}`),
      toeicExamples: Array.from({ length: 8 }, (_, i) => ({ english: `e${i}`, japanese: `j${i}` })),
      collocations: Array.from({ length: 8 }, (_, i) => `c${i}`),
    } as unknown as RawWordPayload;

    const out = normalizePayload("respect", payload);
    expect(out.wordForms).toHaveLength(5);
    expect(out.synonyms).toHaveLength(5);
    expect(out.toeicExamples).toHaveLength(5);
    expect(out.collocations).toHaveLength(3);
  });

  it("defaults a non-numeric detailedMeaning number to 0", () => {
    const payload = {
      meanings: [
        {
          partOfSpeech: "動詞",
          meaning: "尊敬する",
          detailedMeanings: [{ definition: "d" } as unknown as never],
        },
      ],
    } as unknown as RawWordPayload;

    const out = normalizePayload("respect", payload);
    expect(out.meanings[0].detailedMeanings[0].number).toBe(0);
    expect(out.meanings[0].detailedMeanings[0].definition).toBe("d");
    expect(out.meanings[0].detailedMeanings[0].synonyms).toEqual([]);
  });
});
