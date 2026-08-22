import { describe, expect, it } from "vitest";
import type { WordDetails } from "@/types/word";
import {
  shouldCollapseExamples,
  shouldCollapseItems,
  shouldCollapseMeaningDetails,
  shouldCollapseText,
} from "@/lib/word-detail-disclosure";

function meaning(
  details: WordDetails["meanings"][number]["detailedMeanings"],
): WordDetails["meanings"][number] {
  return {
    partOfSpeech: "動詞",
    meaning: "延期する",
    detailedMeanings: details,
  };
}

function detail(number: number, definition = "予定を後日に変更する") {
  return {
    number,
    definition,
    example: "We postponed the meeting.",
    exampleJapanese: "会議を延期しました。",
    context: "会議",
    frequency: "高",
    synonyms: [],
  };
}

describe("word-detail disclosure rules", () => {
  it("keeps short text open and collapses long text", () => {
    expect(shouldCollapseText("短い補足です。")).toBe(false);
    expect(shouldCollapseText("短".repeat(96))).toBe(false);
    expect(shouldCollapseText("長".repeat(97))).toBe(true);
  });

  it("collapses tag lists only when count or total text is large", () => {
    expect(shouldCollapseItems(["a", "b", "c", "d"])).toBe(false);
    expect(shouldCollapseItems(["a", "b", "c", "d", "e"])).toBe(true);
    expect(shouldCollapseItems(["a".repeat(97)])).toBe(true);
  });

  it("collapses three examples or unusually long examples", () => {
    const short = { english: "A short example.", japanese: "短い例文。" };
    expect(shouldCollapseExamples([short, short])).toBe(false);
    expect(shouldCollapseExamples([short, short, short])).toBe(true);
    expect(
      shouldCollapseExamples([{ english: "x".repeat(281), japanese: "" }]),
    ).toBe(true);
  });

  it("keeps one concise meaning open and collapses dense meaning details", () => {
    expect(shouldCollapseMeaningDetails([meaning([detail(1)])])).toBe(false);
    expect(shouldCollapseMeaningDetails([meaning([detail(1), detail(2)])])).toBe(true);
    expect(
      shouldCollapseMeaningDetails([meaning([detail(1, "長".repeat(281))])]),
    ).toBe(true);
  });
});
