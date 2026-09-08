import type { Word } from "@/data/words";
import { resolveTodayNavigationSelection, TODAY_WORDS_COUNT } from "./word-select";

/** Carry the displayed order, independent of the date and cached corpus version. */
export function buildTodayNavigationQuery(words: readonly Pick<Word, "slug">[]): string {
  return new URLSearchParams({
    from: "today",
    picks: JSON.stringify(words.map((word) => word.slug)),
  }).toString();
}

/** Invalid or unavailable selections must never widen navigation to all words. */
export function resolveTodayNavigation(
  allWords: readonly Word[],
  currentSlug: string,
  params: URLSearchParams
): { words: Word[]; query: string } | null {
  const snapshot = params.get("picks");
  let words: Word[];
  if (snapshot !== null) {
    let slugs: unknown;
    try {
      slugs = JSON.parse(snapshot);
    } catch {
      return null;
    }
    if (
      !Array.isArray(slugs) || slugs.length === 0 || slugs.length > TODAY_WORDS_COUNT ||
      slugs.some((slug) => typeof slug !== "string" || !slug) ||
      new Set(slugs).size !== slugs.length || !slugs.includes(currentSlug)
    ) return null;

    const wordMap = new Map(allWords.map((word) => [word.slug, word]));
    words = [];
    for (const slug of slugs) {
      const word = wordMap.get(slug);
      if (!word) return null;
      words.push(word);
    }
  } else {
    // Retain valid date/version bookmarks; upgrade their next link to a snapshot.
    const selection = resolveTodayNavigationSelection(
      allWords, currentSlug, params.get("today"), params.get("v")
    );
    if (!selection) return null;
    words = selection.words;
  }
  return { words, query: buildTodayNavigationQuery(words) };
}
