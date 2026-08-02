import { describe, expect, it } from "vitest";
import {
  GUIDE_ARTICLES,
  PUBLISHED_GUIDE_ARTICLE_COUNT,
  getAllGuideSlugs,
  getLatestGuideArticles,
  getPublishedGuideArticles,
} from "@/data/guide-articles";

const HELD_REVIEW_SLUG = "toeic-424-425-review-2026-05";

describe("guide article publication controls", () => {
  it("keeps the source-review article out of every public article list", () => {
    const publicSlugs = getAllGuideSlugs();

    expect(GUIDE_ARTICLES.some((article) => article.slug === HELD_REVIEW_SLUG)).toBe(true);
    expect(publicSlugs).not.toContain(HELD_REVIEW_SLUG);
    expect(getPublishedGuideArticles().map((article) => article.slug)).toEqual(publicSlugs);
    expect(getLatestGuideArticles().map((article) => article.slug)).not.toContain(
      HELD_REVIEW_SLUG,
    );
    expect(PUBLISHED_GUIDE_ARTICLE_COUNT).toBe(GUIDE_ARTICLES.length - 1);
  });

  it("uses unique slugs and only references articles that exist", () => {
    const slugs = GUIDE_ARTICLES.map((article) => article.slug);
    const knownSlugs = new Set(slugs);

    expect(new Set(slugs).size).toBe(slugs.length);
    for (const article of GUIDE_ARTICLES) {
      for (const relatedSlug of article.relatedSlugs ?? []) {
        expect(knownSlugs.has(relatedSlug), `${article.slug} -> ${relatedSlug}`).toBe(true);
      }
    }
  });

  it("uses secure URLs for every visible reference", () => {
    const sourceUrls = GUIDE_ARTICLES.flatMap((article) =>
      (article.sources ?? []).map((source) => source.url),
    );

    expect(sourceUrls.length).toBeGreaterThan(0);
    for (const url of sourceUrls) {
      expect(url).toMatch(/^https:\/\//);
    }
  });
});
