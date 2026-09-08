import { describe, expect, it } from "vitest";
import { buildTodayNavigationQuery, resolveTodayNavigation } from "../today-navigation";
import { getWordListVersion, parseWords, selectTodayWords } from "../word-select";

describe("today navigation snapshot", () => {
  const picks = parseWords("initiate\nproactively\nrefrigerator\nrespectively\nloan\nmarginal", "important");
  const allWords = [...parseWords("informative\ninitiative", "important"), ...picks];
  const params = new URLSearchParams(buildTodayNavigationQuery(picks));

  it("keeps the displayed order through every next and previous link after corpus changes", () => {
    const updated = [...allWords].reverse().concat(parseWords("new-entry", "medium"));
    let query = params;
    for (const index of [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0]) {
      const result = resolveTodayNavigation(updated, picks[index].slug, query)!;
      expect(result.words).toEqual(picks);
      expect(result.words[index - 1]?.slug).toBe(picks[index - 1]?.slug);
      expect(result.words[index + 1]?.slug).toBe(picks[index + 1]?.slug);
      query = new URLSearchParams(result.query);
    }
  });

  it("ignores mismatching legacy date/version when the displayed snapshot is available", () => {
    const query = new URLSearchParams(params);
    query.set("today", "2026-09-08");
    query.set("v", "40b3cb94");
    expect(resolveTodayNavigation(allWords, "initiate", query)?.words).toEqual(picks);
  });

  it.each(["", "not-json", "null", "{}", '[]', '[1]', '[""]', '["initiate","initiate"]', '["unknown","initiate"]', JSON.stringify([...picks.map(w => w.slug), "initiative"])])(
    "rejects invalid snapshots without falling back to the full list: %s", (value) => {
      expect(resolveTodayNavigation(allWords, "initiate", new URLSearchParams({ picks: value }))).toBeNull();
    }
  );

  it("rejects a current word outside the snapshot and a removed target", () => {
    expect(resolveTodayNavigation(allWords, "initiative", params)).toBeNull();
    expect(resolveTodayNavigation(allWords.filter(w => w.slug !== "loan"), "initiate", params)).toBeNull();
  });

  it("supports selections smaller than the configured count and encodes slug punctuation", () => {
    const words = parseWords("follow up\ncost/benefit\ncomma,word", "medium");
    const query = new URLSearchParams(buildTodayNavigationQuery(words));
    expect(resolveTodayNavigation(words, words[0].slug, query)?.words).toEqual(words);
  });

  it("upgrades valid legacy links and rejects mismatched or missing legacy context", () => {
    const today = "2026-09-08";
    const words = selectTodayWords(allWords, today, 6);
    const query = new URLSearchParams({ today, v: getWordListVersion(allWords) });
    const result = resolveTodayNavigation(allWords, words[0].slug, query)!;
    expect(result.words).toEqual(words);
    expect(new URLSearchParams(result.query).has("picks")).toBe(true);
    query.set("v", "00000000");
    expect(resolveTodayNavigation(allWords, words[0].slug, query)).toBeNull();
    expect(resolveTodayNavigation(allWords, words[0].slug, new URLSearchParams())).toBeNull();
  });
});
