import { describe, expect, it } from "vitest";
import type { WordDetails } from "@/types/word";
import {
  DEFAULT_SEMANTIC_MIN_SCORE,
  EMBEDDING_DIMENSION,
  buildEmbeddingText,
  filterSemanticSearchResults,
  normalizeSemanticQuery,
  normalizeVector,
  parseSemanticIndexVersion,
  parseSemanticSearchResults,
  resolveSemanticMinScore,
  semanticQueryCacheKey,
  toSemanticSearchResults,
} from "@/lib/semantic-search";

function makeDetail(overrides: Partial<WordDetails> = {}): WordDetails {
  return {
    word: "postpone",
    pronunciation: "/poʊstˈpoʊn/",
    meanings: [
      {
        partOfSpeech: "動詞",
        meaning: "延期する",
        detailedMeanings: [
          {
            number: 1,
            definition: "予定を後の日時に変更する",
            example: "The meeting was postponed until Friday.",
            exampleJapanese: "会議は金曜日に延期された。",
            context: "ビジネス会議",
            frequency: "高",
            synonyms: ["delay", "put off"],
          },
        ],
      },
    ],
    wordForms: [{ form: "postponed", type: "過去形" }],
    synonyms: ["delay", "defer"],
    nuance: "フォーマルな場面で使われる。",
    toeicExamples: [
      {
        english: "We decided to postpone the launch.",
        japanese: "私たちは発売の延期を決めた。",
      },
    ],
    englishDefinition: "to arrange for an event to take place at a later time",
    japaneseTranslation: "延期する",
    etymology: "post(後に) + pone(置く)",
    collocations: ["postpone a meeting"],
    ...overrides,
  };
}

describe("normalizeSemanticQuery", () => {
  it("trims, collapses whitespace, and lowercases", () => {
    expect(normalizeSemanticQuery("  Delay   the  Meeting ")).toBe("delay the meeting");
  });

  it("applies NFKC normalization (full-width to half-width)", () => {
    expect(normalizeSemanticQuery("ＴＯＥＩＣ　単語")).toBe("toeic 単語");
  });

  it("keeps Japanese text unchanged", () => {
    expect(normalizeSemanticQuery("延期する")).toBe("延期する");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeSemanticQuery("   ")).toBe("");
  });
});

describe("semanticQueryCacheKey", () => {
  it("is stable for the same query and index version", () => {
    expect(semanticQueryCacheKey("延期する", 3)).toBe(
      semanticQueryCacheKey("延期する", 3)
    );
  });

  it("differs for different queries and uses the versioned prefix", () => {
    const a = semanticQueryCacheKey("延期する", 3);
    const b = semanticQueryCacheKey("謝罪する", 3);
    expect(a).not.toBe(b);
    expect(a).toMatch(/^semsearch:v3:3:[0-9a-f]{16}$/);
  });

  it("differs when the vector index version changes", () => {
    expect(semanticQueryCacheKey("延期する", 3)).not.toBe(
      semanticQueryCacheKey("延期する", 4)
    );
  });
});

describe("parseSemanticIndexVersion", () => {
  it("accepts non-negative safe integers and their string representation", () => {
    expect(parseSemanticIndexVersion(12)).toBe(12);
    expect(parseSemanticIndexVersion("12")).toBe(12);
  });

  it("falls back to zero for invalid values", () => {
    expect(parseSemanticIndexVersion(-1)).toBe(0);
    expect(parseSemanticIndexVersion("1.5")).toBe(0);
    expect(parseSemanticIndexVersion("invalid")).toBe(0);
    expect(parseSemanticIndexVersion(null)).toBe(0);
  });
});

describe("semantic minimum score", () => {
  const results = [
    {
      slug: "postpone",
      term: "postpone",
      level: "important" as const,
      japaneseTranslation: "延期する",
      score: 0.91,
    },
    {
      slug: "advance",
      term: "advance",
      level: "medium" as const,
      japaneseTranslation: "前進させる",
      score: 0.81,
    },
  ];

  it("resolves a configured score and falls back for empty or invalid values", () => {
    expect(resolveSemanticMinScore("0.85")).toBe(0.85);
    expect(resolveSemanticMinScore(undefined)).toBe(DEFAULT_SEMANTIC_MIN_SCORE);
    expect(resolveSemanticMinScore("")).toBe(DEFAULT_SEMANTIC_MIN_SCORE);
    expect(resolveSemanticMinScore("1.1")).toBe(DEFAULT_SEMANTIC_MIN_SCORE);
  });

  it("filters low-score results while preserving relevance order", () => {
    expect(filterSemanticSearchResults(results, 0.82)).toEqual([results[0]]);
  });
});

describe("normalizeVector", () => {
  it("normalizes to unit length", () => {
    const result = normalizeVector([3, 4]);
    expect(result[0]).toBeCloseTo(0.6);
    expect(result[1]).toBeCloseTo(0.8);
    const norm = Math.hypot(...result);
    expect(norm).toBeCloseTo(1);
  });

  it("returns zero vector unchanged", () => {
    expect(normalizeVector([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it("exports a positive embedding dimension", () => {
    expect(EMBEDDING_DIMENSION).toBeGreaterThan(0);
  });
});

describe("buildEmbeddingText", () => {
  it("includes term, translation, definitions, synonyms, and examples", () => {
    const text = buildEmbeddingText("postpone", makeDetail());
    expect(text).toContain("単語: postpone");
    expect(text).toContain("日本語訳: 延期する");
    expect(text).toContain("品詞: 動詞 — 延期する");
    expect(text).toContain("定義: 予定を後の日時に変更する");
    expect(text).toContain("使用場面: ビジネス会議");
    expect(text).toContain("コロケーション: postpone a meeting");
    expect(text).toContain("例文: We decided to postpone the launch. / 私たちは発売の延期を決めた。");
  });

  it("dedupes synonyms across top-level and detailed meanings (case-insensitive)", () => {
    const text = buildEmbeddingText("postpone", makeDetail({ synonyms: ["Delay", "defer"] }));
    const synonymsLine = text.split("\n").find((line) => line.startsWith("類義語:"));
    expect(synonymsLine).toBe("類義語: Delay, defer, put off");
  });

  it("omits empty fields", () => {
    const text = buildEmbeddingText(
      "postpone",
      makeDetail({
        nuance: "",
        collocations: [],
        toeicExamples: [],
        englishDefinition: "  ",
      })
    );
    expect(text).not.toContain("ニュアンス:");
    expect(text).not.toContain("コロケーション:");
    expect(text).not.toContain("例文:");
    expect(text).not.toContain("英語定義:");
  });
});

describe("toSemanticSearchResults", () => {
  const validMetadata = {
    slug: "postpone",
    term: "postpone",
    level: "important",
    japaneseTranslation: "延期する",
  };

  it("maps valid matches", () => {
    const results = toSemanticSearchResults([
      { id: "postpone", score: 0.91, metadata: validMetadata },
    ]);
    expect(results).toEqual([
      {
        slug: "postpone",
        term: "postpone",
        level: "important",
        japaneseTranslation: "延期する",
        score: 0.91,
      },
    ]);
  });

  it("skips matches with missing or invalid metadata", () => {
    const results = toSemanticSearchResults([
      { id: "a", score: 0.9 },
      { id: "b", score: 0.8, metadata: { ...validMetadata, slug: "" } },
      { id: "c", score: 0.7, metadata: { ...validMetadata, level: "unknown" } },
      { id: "d", score: 0.6, metadata: validMetadata },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(0.6);
  });

  it("defaults japaneseTranslation to empty string when missing", () => {
    const { japaneseTranslation, ...withoutTranslation } = validMetadata;
    void japaneseTranslation;
    const results = toSemanticSearchResults([
      { id: "postpone", score: 0.5, metadata: withoutTranslation },
    ]);
    expect(results[0].japaneseTranslation).toBe("");
  });
});

describe("parseSemanticSearchResults", () => {
  const valid = [
    {
      slug: "postpone",
      term: "postpone",
      level: "important",
      japaneseTranslation: "延期する",
      score: 0.9,
    },
  ];

  it("parses an already-deserialized array", () => {
    expect(parseSemanticSearchResults(valid)).toEqual(valid);
  });

  it("parses a JSON string (Redis cache value)", () => {
    expect(parseSemanticSearchResults(JSON.stringify(valid))).toEqual(valid);
  });

  it("returns null for invalid JSON, non-arrays, and malformed items", () => {
    expect(parseSemanticSearchResults("not json")).toBeNull();
    expect(parseSemanticSearchResults({ results: valid })).toBeNull();
    expect(parseSemanticSearchResults([{ slug: "x" }])).toBeNull();
    expect(parseSemanticSearchResults([{ ...valid[0], level: "bogus" }])).toBeNull();
  });
});
