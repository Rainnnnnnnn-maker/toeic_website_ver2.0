import { describe, it, expect } from "vitest";
import {
  parseWords,
  buildWordData,
  hashString,
  getTodayKey,
  getWordListVersion,
  parseTodayDateKey,
  parseWordListVersion,
  resolveTodayNavigationSelection,
  selectTodayWords,
  TODAY_WORDS_COUNT,
} from "../word-select";

describe("TODAY_WORDS_COUNT", () => {
  it("selects six recommended words per day", () => {
    expect(TODAY_WORDS_COUNT).toBe(6);
  });
});

describe("parseWords", () => {
  it("trims whitespace and lowercases the slug", () => {
    const words = parseWords("  Apple  \nBanana", "important");
    expect(words).toEqual([
      { slug: "apple", term: "Apple", level: "important" },
      { slug: "banana", term: "Banana", level: "important" },
    ]);
  });

  it("skips empty lines and handles CRLF", () => {
    const words = parseWords("apple\r\n\r\n   \r\nbanana", "high");
    expect(words.map((w) => w.slug)).toEqual(["apple", "banana"]);
  });

  it("deduplicates by slug, keeping the first occurrence", () => {
    const words = parseWords("Apple\napple\nAPPLE", "medium");
    expect(words).toHaveLength(1);
    expect(words[0].term).toBe("Apple");
  });
});

describe("buildWordData", () => {
  it("merges levels and dedupes allWords, keeping the first (important) occurrence", () => {
    const important = parseWords("apple", "important");
    const medium = parseWords("apple\nbanana", "medium");
    const high = parseWords("cherry", "high");

    const data = buildWordData(important, medium, high);

    expect(data.allWords.map((w) => w.slug)).toEqual(["apple", "banana", "cherry"]);
    // "apple" exists in both important and medium → important wins
    expect(data.allWords.find((w) => w.slug === "apple")?.level).toBe("important");
  });
});

describe("hashString", () => {
  it("is deterministic", () => {
    expect(hashString("respect")).toBe(hashString("respect"));
  });

  it("returns an unsigned 32-bit integer", () => {
    const h = hashString("anything");
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(h)).toBe(true);
  });

  it("differs for different inputs", () => {
    expect(hashString("a")).not.toBe(hashString("b"));
  });
});

describe("getTodayKey", () => {
  it("returns the same JST day for times before 7:00 JST", () => {
    // 2026-06-04 21:00 UTC = 2026-06-05 06:00 JST (before 7:00 → still 06-04 key)
    const key = getTodayKey(new Date("2026-06-04T21:00:00Z"));
    expect(key).toBe("2026-06-04");
  });

  it("rolls over to the next day at 7:00 JST", () => {
    // 2026-06-04 22:00 UTC = 2026-06-05 07:00 JST → rolls to 06-05
    const key = getTodayKey(new Date("2026-06-04T22:00:00Z"));
    expect(key).toBe("2026-06-05");
  });
});

describe("parseTodayDateKey", () => {
  it("accepts a well-formed YYYY-MM-DD key", () => {
    expect(parseTodayDateKey("2026-08-06")).toBe("2026-08-06");
  });

  it("accepts the output of getTodayKey", () => {
    const key = getTodayKey(new Date("2026-06-04T22:00:00Z"));
    expect(parseTodayDateKey(key)).toBe(key);
  });

  it("trims surrounding whitespace", () => {
    expect(parseTodayDateKey("  2026-08-06 ")).toBe("2026-08-06");
  });

  it("rejects empty, null and undefined values", () => {
    expect(parseTodayDateKey("")).toBeNull();
    expect(parseTodayDateKey(null)).toBeNull();
    expect(parseTodayDateKey(undefined)).toBeNull();
  });

  it("rejects the legacy comma-separated slug list so old links fall back", () => {
    expect(parseTodayDateKey("abandon,accommodate,acquire")).toBeNull();
  });

  it("rejects malformed shapes", () => {
    expect(parseTodayDateKey("2026-8-6")).toBeNull();
    expect(parseTodayDateKey("26-08-06")).toBeNull();
    expect(parseTodayDateKey("2026/08/06")).toBeNull();
    expect(parseTodayDateKey("2026-08-06T00:00:00Z")).toBeNull();
  });

  it("rejects calendar dates that do not exist", () => {
    expect(parseTodayDateKey("2026-02-31")).toBeNull();
    expect(parseTodayDateKey("2026-13-01")).toBeNull();
    expect(parseTodayDateKey("2026-00-10")).toBeNull();
  });

  it("keeps a valid leap day", () => {
    expect(parseTodayDateKey("2028-02-29")).toBe("2028-02-29");
    expect(parseTodayDateKey("2026-02-29")).toBeNull();
  });
});

describe("word-list version", () => {
  const words = parseWords("alpha\nbravo\ncharlie", "important");

  it("is stable for the same slug set regardless of order", () => {
    expect(getWordListVersion(words)).toBe(getWordListVersion([...words].reverse()));
  });

  it("changes when the slug set changes", () => {
    const changedWords = parseWords("alpha\nbravo\ncharlie\ndelta", "important");
    expect(getWordListVersion(changedWords)).not.toBe(getWordListVersion(words));
  });

  it("normalizes a valid version and rejects malformed values", () => {
    const version = getWordListVersion(words);
    expect(parseWordListVersion(`  ${version.toUpperCase()}  `)).toBe(version);
    expect(parseWordListVersion("1234")).toBeNull();
    expect(parseWordListVersion("not-a-version")).toBeNull();
    expect(parseWordListVersion(null)).toBeNull();
  });
});

describe("selectTodayWords", () => {
  const words = parseWords(
    ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"].join("\n"),
    "important"
  );

  it("returns an empty array for empty input or non-positive limit", () => {
    expect(selectTodayWords([], "2026-06-04", 5)).toEqual([]);
    expect(selectTodayWords(words, "2026-06-04", 0)).toEqual([]);
    expect(selectTodayWords(words, "2026-06-04", -1)).toEqual([]);
  });

  it("is deterministic for the same day key", () => {
    const a = selectTodayWords(words, "2026-06-04", 3);
    const b = selectTodayWords(words, "2026-06-04", 3);
    expect(a).toEqual(b);
  });

  it("does not mutate the input array", () => {
    const before = words.map((w) => w.slug);
    selectTodayWords(words, "2026-06-04", 3);
    expect(words.map((w) => w.slug)).toEqual(before);
  });

  it("caps the result at the available count", () => {
    expect(selectTodayWords(words, "2026-06-04", 100)).toHaveLength(words.length);
  });

  it("usually changes the selection across different days", () => {
    const day1 = selectTodayWords(words, "2026-06-04", 3).map((w) => w.slug);
    const day2 = selectTodayWords(words, "2026-07-15", 3).map((w) => w.slug);
    // Not a hard guarantee, but with this fixture the orderings differ.
    expect(day1).not.toEqual(day2);
  });
});

describe("resolveTodayNavigationSelection", () => {
  const words = parseWords(
    ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel"].join("\n"),
    "important"
  );
  const dateKey = "2026-08-07";
  const version = getWordListVersion(words);
  const selectedWords = selectTodayWords(words, dateKey, TODAY_WORDS_COUNT);

  it("restores the same selection when date, corpus version and current slug match", () => {
    const result = resolveTodayNavigationSelection(
      words,
      selectedWords[0].slug,
      dateKey,
      version
    );

    expect(result).toEqual({
      dateKey,
      wordListVersion: version,
      words: selectedWords,
    });
  });

  it("falls back when the word corpus changed after the link was generated", () => {
    const changedWords = [
      ...words,
      { slug: "india", term: "india", level: "important" as const },
    ];

    expect(
      resolveTodayNavigationSelection(
        changedWords,
        selectedWords[0].slug,
        dateKey,
        version
      )
    ).toBeNull();
  });

  it("falls back when the current word is not in the restored selection", () => {
    const unselectedWord = words.find(
      (word) => !selectedWords.some((selected) => selected.slug === word.slug)
    );
    expect(unselectedWord).toBeDefined();

    expect(
      resolveTodayNavigationSelection(words, unselectedWord!.slug, dateKey, version)
    ).toBeNull();
  });

  it("falls back when date or corpus version is missing or malformed", () => {
    expect(
      resolveTodayNavigationSelection(words, selectedWords[0].slug, dateKey, null)
    ).toBeNull();
    expect(
      resolveTodayNavigationSelection(words, selectedWords[0].slug, "invalid", version)
    ).toBeNull();
  });
});
