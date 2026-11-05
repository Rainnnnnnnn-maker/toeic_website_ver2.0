import { describe, expect, it } from "vitest";
import {
  EMPTY_SAVED_STUDY_WORDS,
  filterSavedStudyWords,
  parseSavedStudyWords,
  updateSavedStudyWord,
  type SavedStudyWords,
} from "../study-saved-words";

const state = (): SavedStudyWords => ({
  v: 1,
  forgottenSlugs: ["apple", "banana"],
  laterSlugs: ["cherry", "date"],
});

describe("parseSavedStudyWords", () => {
  it("restores both buckets without changing canonical slug casing or order", () => {
    const stored: SavedStudyWords = { v: 1, forgottenSlugs: ["CEO", "apple"], laterSlugs: ["date"] };
    expect(parseSavedStudyWords(JSON.stringify(stored))).toEqual({ status: "ready", words: stored });
  });

  it("treats an absent value as a ready, empty list", () => {
    const parsed = parseSavedStudyWords(null);
    expect(parsed.status).toBe("ready");
    expect(parsed.words).toBe(EMPTY_SAVED_STUDY_WORDS);
  });

  it.each([
    "",
    "{broken",
    "null",
    "[]",
    "1",
    JSON.stringify({ forgottenSlugs: [], laterSlugs: [] }),
    JSON.stringify({ v: 1, forgottenSlugs: [] }),
    JSON.stringify({ v: 1, forgottenSlugs: "apple", laterSlugs: [] }),
    JSON.stringify({ v: 1, forgottenSlugs: [], laterSlugs: { 0: "apple" } }),
  ])("marks malformed known data as recoverable, invalid data: %s", (raw) => {
    const parsed = parseSavedStudyWords(raw);
    expect(parsed.status).toBe("invalid");
    expect(parsed.words).toBe(EMPTY_SAVED_STUDY_WORDS);
  });

  it.each([-1, 0, 2, 3, "2", null, false])("protects an explicit unsupported version: %s", (v) => {
    const parsed = parseSavedStudyWords(JSON.stringify({
      v,
      forgottenSlugs: ["apple"],
      laterSlugs: ["banana"],
      futureMetadata: { revision: "preserve-me" },
    }));
    expect(parsed.status).toBe("unsupported-version");
    expect(parsed.words).toBe(EMPTY_SAVED_STUDY_WORDS);
  });

  it("recognizes an unsupported version before attempting to read a different schema", () => {
    const parsed = parseSavedStudyWords(JSON.stringify({
      v: 2,
      cards: [{ slug: "apple", category: "unknown" }],
    }));
    expect(parsed).toEqual({ status: "unsupported-version", words: EMPTY_SAVED_STUDY_WORDS });
  });

  it("distinguishes an empty future format from an editable empty list", () => {
    const ready = parseSavedStudyWords(JSON.stringify({ v: 1, forgottenSlugs: [], laterSlugs: [] }));
    const future = parseSavedStudyWords(JSON.stringify({ v: 2, forgottenSlugs: [], laterSlugs: [] }));
    expect(ready.status).toBe("ready");
    expect(future.status).toBe("unsupported-version");
    expect(ready.words).toBe(future.words);
  });

  it("deduplicates each bucket, drops blank values, and gives forgotten priority", () => {
    expect(parseSavedStudyWords(JSON.stringify({
      v: 1,
      forgottenSlugs: ["apple", "", "banana", "apple", "  "],
      laterSlugs: ["banana", "cherry", "cherry", "\t", "date"],
    }))).toEqual({
      status: "ready",
      words: { v: 1, forgottenSlugs: ["apple", "banana"], laterSlugs: ["cherry", "date"] },
    });
  });

  it("drops only the non-string entries and keeps the other saved words in both buckets", () => {
    const parsed = parseSavedStudyWords(JSON.stringify({
      v: 1,
      forgottenSlugs: ["apple", 7, "banana", null, { slug: "x" }],
      laterSlugs: ["cherry", ["date"], "date"],
    }));
    expect(parsed).toEqual({
      status: "ready",
      words: { v: 1, forgottenSlugs: ["apple", "banana"], laterSlugs: ["cherry", "date"] },
    });
    expect(updateSavedStudyWord(parsed.words, "fig", "forgotten")).toEqual({
      v: 1,
      forgottenSlugs: ["apple", "banana", "fig"],
      laterSlugs: ["cherry", "date"],
    });
  });

  it("keeps a known list editable when invalid elements leave both buckets empty", () => {
    const parsed = parseSavedStudyWords(JSON.stringify({
      v: 1,
      forgottenSlugs: [7],
      laterSlugs: [null],
    }));
    expect(parsed.status).toBe("ready");
    expect(parsed.words).toBe(EMPTY_SAVED_STUDY_WORDS);
  });

  it("returns the shared empty snapshot for valid but empty lists", () => {
    const parsed = parseSavedStudyWords(JSON.stringify({ v: 1, forgottenSlugs: [], laterSlugs: [] }));
    expect(parsed.status).toBe("ready");
    expect(parsed.words).toBe(EMPTY_SAVED_STUDY_WORDS);
  });
});

describe("updateSavedStudyWord", () => {
  it("accumulates new forgotten and deferred words without losing earlier words", () => {
    const forgotten = updateSavedStudyWord(EMPTY_SAVED_STUDY_WORDS, "apple", "forgotten");
    const deferred = updateSavedStudyWord(forgotten, "banana", "later");
    expect(updateSavedStudyWord(deferred, "cherry", "forgotten")).toEqual({
      v: 1, forgottenSlugs: ["apple", "cherry"], laterSlugs: ["banana"],
    });
    expect(EMPTY_SAVED_STUDY_WORDS).toEqual({ v: 1, forgottenSlugs: [], laterSlugs: [] });
  });

  it("moves a word from deferred to forgotten and preserves the other words", () => {
    expect(updateSavedStudyWord(state(), "cherry", "forgotten")).toEqual({
      v: 1, forgottenSlugs: ["apple", "banana", "cherry"], laterSlugs: ["date"],
    });
  });

  it("moves a word from forgotten to deferred", () => {
    expect(updateSavedStudyWord(state(), "banana", "later")).toEqual({
      v: 1, forgottenSlugs: ["apple"], laterSlugs: ["cherry", "date", "banana"],
    });
  });

  it("removes a remembered word from either bucket", () => {
    expect(updateSavedStudyWord(state(), "apple", null)).toEqual({
      v: 1, forgottenSlugs: ["banana"], laterSlugs: ["cherry", "date"],
    });
    expect(updateSavedStudyWord(state(), "cherry", null)).toEqual({
      v: 1, forgottenSlugs: ["apple", "banana"], laterSlugs: ["date"],
    });
  });

  it("keeps insertion order and the same snapshot when the classification does not change", () => {
    const saved = state();
    expect(updateSavedStudyWord(saved, "apple", "forgotten")).toBe(saved);
    expect(updateSavedStudyWord(saved, "cherry", "later")).toBe(saved);
    expect(updateSavedStudyWord(saved, "unknown", null)).toBe(saved);
    expect(updateSavedStudyWord(saved, "  ", "forgotten")).toBe(saved);
  });

  it("returns the shared empty snapshot when the final saved word is removed", () => {
    expect(updateSavedStudyWord({ v: 1, forgottenSlugs: ["apple"], laterSlugs: [] }, "apple", null))
      .toBe(EMPTY_SAVED_STUDY_WORDS);
  });

  it("never mutates the supplied state or its arrays", () => {
    const saved = state();
    const before = structuredClone(saved);
    updateSavedStudyWord(saved, "apple", "later");
    updateSavedStudyWord(saved, "cherry", null);
    expect(saved).toEqual(before);
  });
});

describe("filterSavedStudyWords", () => {
  it("excludes removed corpus words from both buckets while retaining order", () => {
    const saved = state();
    const known = new Set(["banana", "date", "unseen"]);
    expect(filterSavedStudyWords(saved, known)).toEqual({
      v: 1, forgottenSlugs: ["banana"], laterSlugs: ["date"],
    });
    expect(saved).toEqual(state());
    expect([...known]).toEqual(["banana", "date", "unseen"]);
  });

  it("keeps the snapshot when every saved word still exists", () => {
    const saved = state();
    expect(filterSavedStudyWords(saved, new Set(["apple", "banana", "cherry", "date"]))).toBe(saved);
  });

  it("returns the shared empty snapshot when none of the saved words exist", () => {
    expect(filterSavedStudyWords(state(), new Set())).toBe(EMPTY_SAVED_STUDY_WORDS);
  });
});
