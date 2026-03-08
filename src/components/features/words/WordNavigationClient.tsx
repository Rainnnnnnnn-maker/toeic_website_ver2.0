"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";
import { useMemo } from "react";
import type { Word } from "@/data/words";
import { useShareTarget } from "@/context/ShareTargetContext";

export default function WordNavigationClient({
  allWords,
  currentSlug,
}: {
  allWords: Word[];
  currentSlug: string;
}) {
  const searchParams = useSearchParams();
  const isFromFavorites = searchParams.get("from") === "favorites";
  const { favorites } = useFavorites();
  const { setShareTarget } = useShareTarget();

  const navigationList = useMemo(() => {
    if (isFromFavorites) {
      const wordMap = new Map(allWords.map((w) => [w.slug, w]));
      // お気に入り一覧と同じ順序（最新が先頭）にする
      return [...favorites]
        .reverse()
        .map((slug) => wordMap.get(slug))
        .filter((w): w is Word => w !== undefined);
    }
    return allWords;
  }, [allWords, favorites, isFromFavorites]);

  const currentIndex = navigationList.findIndex((w) => w.slug === currentSlug);
  const prevWord = currentIndex > 0 ? navigationList[currentIndex - 1] : null;
  const nextWord =
    currentIndex >= 0 && currentIndex < navigationList.length - 1
      ? navigationList[currentIndex + 1]
      : null;

  const entry = allWords.find((w) => w.slug === currentSlug);
  const term = entry?.term || currentSlug;

  const querySuffix = isFromFavorites ? "?from=favorites" : "";

  return (
    <>
      <header>
        <p className="inline-flex items-center gap-1.5 text-lg tracking-[0.12em] uppercase text-gray-500 mb-2 whitespace-nowrap">
          {isFromFavorites ? (
            <Link href="/favorites" className="text-indigo-600 no-underline text-2xl font-semibold">
              お気に入り
            </Link>
          ) : (
            <Link href="/" className="text-indigo-600 no-underline text-2xl font-semibold">
              単語一覧
            </Link>
          )}
          <span className="mx-0.5">/</span>
          <span className="text-gray-700">{term}</span>
        </p>
        <div className="flex justify-between gap-4 items-end">
          <h2 className="text-xl leading-[1.4] text-slate-900 tracking-[0.02em]">AI単語解説</h2>
          <div
            id="word-nav-share-container"
            className="flex items-center"
            ref={setShareTarget}
          />
        </div>
      </header>

      <nav className="flex justify-between items-center -mt-2 pb-0 -mb-2" aria-label="単語ナビゲーション">
        {prevWord ? (
          <Link
            href={`/words/${prevWord.slug}${querySuffix}`}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-full text-gray-600 text-[13px] font-medium no-underline transition-all duration-200 shadow-sm select-none hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            <span aria-hidden="true">←</span> 前単語
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-full text-gray-600 text-[13px] font-medium no-underline transition-all duration-200 shadow-sm select-none invisible pointer-events-none">
            <span aria-hidden="true">←</span> 前単語
          </span>
        )}

        {nextWord ? (
          <Link
            href={`/words/${nextWord.slug}${querySuffix}`}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-full text-gray-600 text-[13px] font-medium no-underline transition-all duration-200 shadow-sm select-none hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            次単語 <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-200 rounded-full text-gray-600 text-[13px] font-medium no-underline transition-all duration-200 shadow-sm select-none invisible pointer-events-none">
            次単語 <span aria-hidden="true">→</span>
          </span>
        )}
      </nav>
    </>
  );
}
