"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";
import { useMemo, useRef } from "react";
import type { Word } from "@/data/words";
import { useShareTarget } from "@/context/ShareTargetContext";
import { ChevronLeft } from "lucide-react";

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
  let prevWord: Word | null = currentIndex > 0 ? navigationList[currentIndex - 1] : null;
  let nextWord: Word | null =
    currentIndex >= 0 && currentIndex < navigationList.length - 1
      ? navigationList[currentIndex + 1]
      : null;

  const validNavRef = useRef<{ slug: string; prev: Word | null; next: Word | null }>({
    slug: currentSlug,
    prev: null,
    next: null,
  });

  if (currentIndex !== -1) {
    validNavRef.current = { slug: currentSlug, prev: prevWord, next: nextWord };
  } else if (validNavRef.current.slug === currentSlug) {
    // お気に入りから外された等で currentIndex が -1 になった場合、直前の有効な値を使用
    prevWord = validNavRef.current.prev;
    nextWord = validNavRef.current.next;
  } else {
    // slugが変わり、かつお気に入りに存在しない場合（直接URLアクセスなど）
    prevWord = null;
    nextWord = null;
    validNavRef.current = { slug: currentSlug, prev: null, next: null };
  }

  const entry = allWords.find((w) => w.slug === currentSlug);
  const term = entry?.term || currentSlug;

  const querySuffix = isFromFavorites ? "?from=favorites" : "";

  return (
    <>
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 whitespace-nowrap overflow-x-auto pb-1 -mb-1">
          {isFromFavorites ? (
            <Link 
              href="/favorites" 
              className="group inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-white border border-gray-200 rounded-full text-slate-600 text-[15px] font-semibold no-underline transition-all duration-200 shadow-sm select-none hover:bg-gray-50 hover:border-gray-300 hover:text-slate-900 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm"
            >
              <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-600" />
              お気に入り
            </Link>
          ) : (
            <Link 
              href="/" 
              className="group inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-white border border-gray-200 rounded-full text-slate-600 text-[15px] font-semibold no-underline transition-all duration-200 shadow-sm select-none hover:bg-gray-50 hover:border-gray-300 hover:text-slate-900 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm"
            >
              <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-600" />
              単語一覧
            </Link>
          )}
          <span className="text-slate-300 text-lg">/</span>
          <span className="text-slate-700 text-lg font-bold tracking-wide uppercase">{term}</span>
        </div>
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
