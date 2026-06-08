import { describe, it, expect } from "vitest";
import { normalizeText, sanitizeSlug, ttsCacheKey, matchesExample, isSameHost } from "../tts-utils";
import type { WordDetails } from "@/types/word";

describe("normalizeText", () => {
  it("collapses runs of whitespace and trims", () => {
    expect(normalizeText("  hello   world\n\t!  ")).toBe("hello world !");
  });
});

describe("sanitizeSlug", () => {
  it("keeps only lowercase alphanumerics and hyphens", () => {
    expect(sanitizeSlug("  Hello_World! 123-x  ")).toBe("helloworld123-x");
  });

  it("truncates to 64 characters", () => {
    expect(sanitizeSlug("a".repeat(100))).toHaveLength(64);
  });
});

describe("ttsCacheKey", () => {
  it("uses the word key shape for a single English word", () => {
    expect(ttsCacheKey("Respect", "en")).toBe("tts:en:word:respect");
  });

  it("does not use the word shape for Japanese single words", () => {
    const key = ttsCacheKey("こんにちは", "ja", "respect");
    expect(key.startsWith("tts:ja:respect:")).toBe(true);
  });

  it("hashes multi-word English text under the wordSlug tag", () => {
    const key = ttsCacheKey("They respect each other.", "en", "respect");
    expect(key).toMatch(/^tts:en:respect:[0-9a-f]{12}$/);
  });

  it("falls back to '_' when no wordSlug is given for sentences", () => {
    const key = ttsCacheKey("two words", "en");
    expect(key).toMatch(/^tts:en:_:[0-9a-f]{12}$/);
  });

  it("is deterministic for identical inputs", () => {
    const a = ttsCacheKey("They respect each other.", "en", "respect");
    const b = ttsCacheKey("They respect each other.", "en", "respect");
    expect(a).toBe(b);
  });
});

describe("matchesExample", () => {
  const detail = {
    word: "respect",
    pronunciation: "",
    meanings: [
      {
        partOfSpeech: "動詞",
        meaning: "尊敬する",
        detailedMeanings: [
          {
            number: 1,
            definition: "",
            example: "Students respect their teacher.",
            exampleJapanese: "生徒は先生を尊敬する。",
            context: "",
            frequency: "",
            synonyms: [],
          },
        ],
      },
    ],
    wordForms: [],
    synonyms: [],
    nuance: "",
    toeicExamples: [{ english: "We respect the deadline.", japanese: "私たちは締め切りを守る。" }],
    englishDefinition: "",
    japaneseTranslation: "",
  } as WordDetails;

  it("matches a toeicExample after whitespace normalization", () => {
    expect(matchesExample(detail, "  We   respect the deadline.  ", "en")).toBe(true);
    expect(matchesExample(detail, "私たちは締め切りを守る。", "ja")).toBe(true);
  });

  it("matches a detailedMeaning example", () => {
    expect(matchesExample(detail, "Students respect their teacher.", "en")).toBe(true);
    expect(matchesExample(detail, "生徒は先生を尊敬する。", "ja")).toBe(true);
  });

  it("rejects unknown text", () => {
    expect(matchesExample(detail, "Some random sentence.", "en")).toBe(false);
  });

  it("rejects when language does not match the field", () => {
    // English text checked against the Japanese side should not match
    expect(matchesExample(detail, "We respect the deadline.", "ja")).toBe(false);
  });
});

describe("isSameHost", () => {
  it("accepts an origin whose host strictly equals the request host", () => {
    expect(isSameHost("https://toeic-words.com", "toeic-words.com")).toBe(true);
  });

  it("matches host including port", () => {
    expect(isSameHost("http://localhost:3000", "localhost:3000")).toBe(true);
  });

  it("rejects a suffix-style spoofed host", () => {
    expect(isSameHost("https://toeic-words.com.attacker.com", "toeic-words.com")).toBe(false);
  });

  it("rejects a prefix-style spoofed host", () => {
    expect(isSameHost("https://attacker.com/toeic-words.com", "toeic-words.com")).toBe(false);
  });

  it("returns false for unparseable headers or missing values", () => {
    expect(isSameHost("not a url", "toeic-words.com")).toBe(false);
    expect(isSameHost(null, "toeic-words.com")).toBe(false);
    expect(isSameHost("https://toeic-words.com", null)).toBe(false);
    expect(isSameHost(undefined, undefined)).toBe(false);
  });
});
