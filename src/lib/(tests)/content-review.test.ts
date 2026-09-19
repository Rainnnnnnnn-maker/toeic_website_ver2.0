import { describe, expect, it } from "vitest";
import { contentFingerprint, hasCurrentHumanReview, type ContentReview } from "../content-review";
import { GUIDE_ARTICLES, getGuideArticleBySlug, getPublishedGuideArticles } from "@/data/guide-articles";

describe("content review", () => {
  const content = { text: "original", examples: ["one", "two"] };
  const review: ContentReview = { fingerprint: contentFingerprint(content), reviewer: "Editor", reviewedAt: "2026-09-18", method: "human" };
  it("retains approval across object key order but invalidates changed text and example order", () => {
    expect(hasCurrentHumanReview({ examples: content.examples, text: content.text }, review)).toBe(true);
    expect(hasCurrentHumanReview({ ...content, text: "regenerated" }, review)).toBe(false);
    expect(hasCurrentHumanReview({ ...content, examples: ["two", "one"] }, review)).toBe(false);
  });
  it("never equates AI checks or an anonymous review with human approval", () => {
    expect(hasCurrentHumanReview(content, { ...review, method: "ai-assisted" })).toBe(false);
    expect(hasCurrentHumanReview(content, { ...review, reviewer: " " })).toBe(false);
    expect(hasCurrentHumanReview(content)).toBe(false);
  });
});

describe("guide publication boundary", () => {
  it("does not resolve drafts through the public lookup", () => {
    const drafts = GUIDE_ARTICLES.filter(article => article.status === "draft");
    expect(drafts.length).toBeGreaterThan(0);
    for (const draft of drafts) {
      expect(getGuideArticleBySlug(draft.slug)).toBeUndefined();
      expect(getPublishedGuideArticles().some(a => a.slug === draft.slug)).toBe(false);
    }
    expect(getGuideArticleBySlug("missing")).toBeUndefined();
  });
});
