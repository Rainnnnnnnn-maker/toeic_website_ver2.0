import { describe, it, expect } from "vitest";
import type { Word } from "@/data/words";
import {
  parsePersistedStudyState,
  uniqueStrings,
  addUnique,
  removeValue,
  escapeRegExp,
  buildWordMap,
  splitWordsByLevel,
  selectWordPool,
  pickRandomStudyWord,
  pickSequentialStudyWord,
  splitSentenceByTerm,
  getNavigationType,
  type WordLevelPools,
} from "../study-utils";

const word = (slug: string, level: Word["level"] = "important"): Word => ({
  slug,
  term: slug,
  level,
});

/** 固定の乱数列を順に返すスタブ（使い切ったら最後の値を返し続ける） */
const sequenceRandom = (values: number[]): (() => number) => {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
};

const makePools = (important: Word[], medium: Word[], high: Word[]): WordLevelPools => ({
  all: [...important, ...medium, ...high],
  important,
  medium,
  high,
});

describe("parsePersistedStudyState", () => {
  const valid = {
    v: 1,
    currentSlug: "apple",
    rememberedSlugs: ["banana"],
    forgottenSlugs: ["cherry"],
    laterSlugs: ["date"],
    consecutiveRememberCount: 3,
    updatedAt: 1700000000000,
  };

  it("parses a fully populated valid state", () => {
    expect(parsePersistedStudyState(JSON.stringify(valid))).toEqual(valid);
  });

  it("accepts a state without the optional fields", () => {
    const state = {
      v: 1,
      currentSlug: "apple",
      rememberedSlugs: [],
      forgottenSlugs: [],
      updatedAt: 1700000000000,
    };
    expect(parsePersistedStudyState(JSON.stringify(state))).toEqual(state);
  });

  it("returns null for invalid JSON", () => {
    expect(parsePersistedStudyState("{not json")).toBeNull();
  });

  it("returns null for non-object JSON", () => {
    expect(parsePersistedStudyState("42")).toBeNull();
    expect(parsePersistedStudyState("null")).toBeNull();
  });

  it("returns null for an unknown version", () => {
    expect(parsePersistedStudyState(JSON.stringify({ ...valid, v: 2 }))).toBeNull();
  });

  it("returns null when currentSlug is not a string", () => {
    expect(parsePersistedStudyState(JSON.stringify({ ...valid, currentSlug: 1 }))).toBeNull();
  });

  it("returns null when a slug array contains a non-string", () => {
    expect(parsePersistedStudyState(JSON.stringify({ ...valid, rememberedSlugs: ["a", 1] }))).toBeNull();
    expect(parsePersistedStudyState(JSON.stringify({ ...valid, forgottenSlugs: "a" }))).toBeNull();
    expect(parsePersistedStudyState(JSON.stringify({ ...valid, laterSlugs: [null] }))).toBeNull();
  });

  it("returns null when consecutiveRememberCount is not a number", () => {
    expect(parsePersistedStudyState(JSON.stringify({ ...valid, consecutiveRememberCount: "3" }))).toBeNull();
  });

  it("returns null when updatedAt is missing", () => {
    const rest: Record<string, unknown> = { ...valid };
    delete rest.updatedAt;
    expect(parsePersistedStudyState(JSON.stringify(rest))).toBeNull();
  });
});

describe("array helpers", () => {
  it("uniqueStrings deduplicates while preserving order", () => {
    expect(uniqueStrings(["a", "b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
  });

  it("addUnique appends a new value", () => {
    expect(addUnique(["a"], "b")).toEqual(["a", "b"]);
  });

  it("addUnique returns the same array when the value already exists", () => {
    const values = ["a", "b"];
    expect(addUnique(values, "a")).toBe(values);
  });

  it("removeValue removes all occurrences", () => {
    expect(removeValue(["a", "b", "a"], "a")).toEqual(["b"]);
  });
});

describe("escapeRegExp", () => {
  it("escapes regex metacharacters so they match literally", () => {
    const pattern = new RegExp(`^${escapeRegExp("a.b+(c)")}$`);
    expect(pattern.test("a.b+(c)")).toBe(true);
    expect(pattern.test("aXb+(c)")).toBe(false);
  });
});

describe("buildWordMap", () => {
  it("indexes words by slug", () => {
    const a = word("apple");
    const b = word("banana");
    const map = buildWordMap([a, b]);
    expect(map.get("apple")).toBe(a);
    expect(map.get("banana")).toBe(b);
    expect(map.size).toBe(2);
  });
});

describe("splitWordsByLevel", () => {
  it("partitions words into level pools and keeps the full list", () => {
    const words = [word("a", "important"), word("b", "medium"), word("c", "high"), word("d", "medium")];
    const pools = splitWordsByLevel(words);
    expect(pools.all).toEqual(words);
    expect(pools.important.map((w) => w.slug)).toEqual(["a"]);
    expect(pools.medium.map((w) => w.slug)).toEqual(["b", "d"]);
    expect(pools.high.map((w) => w.slug)).toEqual(["c"]);
  });
});

describe("selectWordPool", () => {
  const important = [word("imp", "important")];
  const medium = [word("med", "medium")];
  const high = [word("hig", "high")];
  const pools = makePools(important, medium, high);

  it("tier 0-4: picks important at r < 0.8, medium otherwise", () => {
    expect(selectWordPool(0, 0.79, pools)).toBe(important);
    expect(selectWordPool(4, 0.8, pools)).toBe(medium);
  });

  it("tier 0-4: falls back to medium then high when pools are empty", () => {
    expect(selectWordPool(0, 0.1, makePools([], medium, high))).toBe(medium);
    expect(selectWordPool(0, 0.1, makePools([], [], high))).toBe(high);
  });

  it("tier 5-9: picks medium at r < 0.6, important at r < 0.8, high otherwise", () => {
    expect(selectWordPool(5, 0.59, pools)).toBe(medium);
    expect(selectWordPool(7, 0.79, pools)).toBe(important);
    expect(selectWordPool(9, 0.8, pools)).toBe(high);
  });

  it("tier 5-9: falls back to medium when high is empty", () => {
    expect(selectWordPool(5, 0.9, makePools(important, medium, []))).toBe(medium);
  });

  it("tier 10+: picks high at r < 0.6, medium at r < 0.9, important otherwise", () => {
    expect(selectWordPool(10, 0.59, pools)).toBe(high);
    expect(selectWordPool(15, 0.89, pools)).toBe(medium);
    expect(selectWordPool(10, 0.9, pools)).toBe(important);
  });

  it("tier 10+: falls back to high when important is empty", () => {
    expect(selectWordPool(10, 0.95, makePools([], medium, high))).toBe(high);
    expect(selectWordPool(10, 0.95, makePools([], [], high))).toBe(high);
  });

  it("returns the full list when every level pool is empty", () => {
    const all = [word("x")];
    expect(selectWordPool(0, 0.1, { all, important: [], medium: [], high: [] })).toBe(all);
  });
});

describe("pickRandomStudyWord", () => {
  it("returns null for an empty word list", () => {
    expect(pickRandomStudyWord(makePools([], [], []), null, 0)).toBeNull();
  });

  it("returns the only word even when it matches the current slug", () => {
    const only = word("solo");
    const result = pickRandomStudyWord(makePools([only], [], []), "solo", 0, sequenceRandom([0]));
    expect(result).toBe(only);
  });

  it("re-draws when the picked word matches the current slug", () => {
    const a = word("a");
    const b = word("b");
    // 1回目: r=0.1 → important プール, index 0 → a（現在の単語と同じ）
    // 2回目: r=0.1 → important プール, index 0.9*2=1 → b
    const result = pickRandomStudyWord(makePools([a, b], [], []), "a", 0, sequenceRandom([0.1, 0, 0.1, 0.9]));
    expect(result).toBe(b);
  });

  it("gives up after 10 attempts and returns the duplicate", () => {
    const a = word("a");
    const b = word("b");
    let calls = 0;
    const alwaysFirst = () => {
      calls++;
      return 0;
    };
    const result = pickRandomStudyWord(makePools([a, b], [], []), "a", 0, alwaysFirst);
    expect(result).toBe(a);
    expect(calls).toBe(20); // 10 試行 × 2 回
  });

  it("respects the difficulty tier of the consecutive count", () => {
    const imp = word("imp", "important");
    const hig = word("hig", "high");
    const pools = makePools([imp], [], [hig]);
    expect(pickRandomStudyWord(pools, null, 10, sequenceRandom([0.5, 0]))).toBe(hig);
    expect(pickRandomStudyWord(pools, null, 0, sequenceRandom([0.5, 0]))).toBe(imp);
  });
});

describe("pickSequentialStudyWord", () => {
  const words = [word("a"), word("b"), word("c")];

  it("returns null for an empty list", () => {
    expect(pickSequentialStudyWord([], null)).toBeNull();
  });

  it("returns the first word when there is no current word", () => {
    expect(pickSequentialStudyWord(words, null)).toBe(words[0]);
  });

  it("returns the next word", () => {
    expect(pickSequentialStudyWord(words, "a")).toBe(words[1]);
  });

  it("wraps around from the last word to the first", () => {
    expect(pickSequentialStudyWord(words, "c")).toBe(words[0]);
  });

  it("returns the first word when the current slug is unknown", () => {
    expect(pickSequentialStudyWord(words, "zzz")).toBe(words[0]);
  });
});

describe("splitSentenceByTerm", () => {
  const matched = (parts: ReturnType<typeof splitSentenceByTerm>) =>
    parts.filter((p) => p.isMatch).map((p) => p.text);

  it("highlights the exact term", () => {
    const parts = splitSentenceByTerm("I respect you.", "respect");
    expect(matched(parts)).toEqual(["respect"]);
    expect(parts.map((p) => p.text).join("")).toBe("I respect you.");
  });

  it("highlights inflected forms (suffixes)", () => {
    expect(matched(splitSentenceByTerm("She respects him.", "respect"))).toEqual(["respects"]);
  });

  it("is case-insensitive", () => {
    expect(matched(splitSentenceByTerm("Respect is earned.", "respect"))).toEqual(["Respect"]);
  });

  it("does not match inside another word (word boundary)", () => {
    expect(matched(splitSentenceByTerm("This is important.", "port"))).toEqual([]);
  });

  it("handles terms containing regex metacharacters", () => {
    expect(matched(splitSentenceByTerm("Please check-in early.", "check-in"))).toEqual(["check-in"]);
  });

  it("highlights multiple occurrences", () => {
    expect(matched(splitSentenceByTerm("respect begets respect", "respect"))).toEqual(["respect", "respect"]);
  });
});

describe("getNavigationType", () => {
  it("returns undefined outside the browser", () => {
    expect(getNavigationType()).toBeUndefined();
  });
});
