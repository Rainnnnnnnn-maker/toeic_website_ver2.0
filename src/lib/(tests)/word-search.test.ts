import { describe, it, expect } from "vitest";
import { filterWordsByTermQuery, filterWordsByTermPrefix, normalizeTermQuery } from "../word-search";

const words = (...terms: string[]) => terms.map((term) => ({ slug: term, term }));
const terms = (list: { term: string }[]) => list.map((w) => w.term);

describe("normalizeTermQuery", () => {
  it("converts full-width letters and spaces, trims, and lowercases", () => {
    expect(normalizeTermQuery("　ＡＣＣ　")).toBe("acc");
  });

  it("collapses internal whitespace", () => {
    expect(normalizeTermQuery("part   time")).toBe("part time");
  });
});

describe("filterWordsByTermPrefix", () => {
  it("returns every word in the original order for a blank query", () => {
    const input = words("accounting", "ability", "accept");
    expect(terms(filterWordsByTermPrefix(input, ""))).toEqual(["accounting", "ability", "accept"]);
    expect(terms(filterWordsByTermPrefix(input, "　 "))).toEqual(["accounting", "ability", "accept"]);
  });

  it("matches prefixes case-insensitively and keeps the original order", () => {
    const input = words("accounting", "ability", "accept");
    expect(terms(filterWordsByTermPrefix(input, "AC"))).toEqual(["accounting", "accept"]);
  });

  it("matches full-width input typed with an IME", () => {
    expect(terms(filterWordsByTermPrefix(words("ability", "accept"), "ａｃｃ"))).toEqual(["accept"]);
  });

  it("does not match a substring that is not at the start", () => {
    expect(filterWordsByTermPrefix(words("account", "discount"), "count")).toEqual([]);
  });

  it("moves an exact match ahead of longer prefix matches", () => {
    const input = words("accountant", "accountable", "account");
    expect(terms(filterWordsByTermPrefix(input, "account"))).toEqual([
      "account",
      "accountant",
      "accountable",
    ]);
  });

  it("matches hyphenated terms by their leading characters", () => {
    expect(terms(filterWordsByTermPrefix(words("walk-in", "walkway"), "walk-"))).toEqual(["walk-in"]);
  });

  it("returns a new array without mutating the input", () => {
    const input = words("accept", "ability");
    const result = filterWordsByTermPrefix(input, "");
    expect(result).not.toBe(input);
    expect(terms(input)).toEqual(["accept", "ability"]);
  });
});


describe("filterWordsByTermQuery", () => {
  it.each([
    ["　ＡＣＣ　", ["accountant", "account", "accept"]],
    ["ＡＣＣＯＵＮＴ", ["account", "accountant"]],
    ["＊ＯＵＮＴ", ["account", "discount"]],
    ["Ａ＊Ｔ", ["accountant", "account", "accept"]],
    ["a**t", ["accountant", "account", "accept"]],
    ["*", ["accountant", "account", "accept", "discount"]],
    ["　 ", ["accountant", "account", "accept", "discount"]],
    ["count", []],
    ["zz*", []],
  ])("matches %s using shared normalization and ordering", (query, expected) => {
    const input = words("accountant", "account", "accept", "discount");
    const original = [...input];
    expect(terms(filterWordsByTermQuery(input, query))).toEqual(expected);
    expect(input).toEqual(original);
  });

  it("treats regex metacharacters literally", () => {
    const input = words("a.b", "axb", "a+b", "a[b", "a(b", "a?b");
    for (const term of terms(input)) {
      expect(terms(filterWordsByTermQuery(input, term + "*"))).toEqual([term]);
    }
  });

  it("normalizes the corpus as well as the query", () => {
    expect(terms(filterWordsByTermQuery(words("ＰＡＲＴ　　ＴＩＭＥ"), "part* time")))
      .toEqual(["ＰＡＲＴ　　ＴＩＭＥ"]);
  });
});
