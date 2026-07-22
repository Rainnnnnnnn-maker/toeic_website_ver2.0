"use client";

import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import StudyClient from "@/components/features/study/StudyClient";
import type { Word } from "@/data/words";
import { ChevronLeft } from "lucide-react";

type Props = {
  allWords: Word[];
};

export default function ReviewWrapper({ allWords }: Props) {
  const { favorites } = useFavorites();

  const favoriteWords = (() => {
    const wordsMap = new Map(allWords.map((w) => [w.slug, w]));
    return favorites
      .map((slug) => wordsMap.get(slug))
      .filter((w): w is Word => w !== undefined);
  })();

  if (favoriteWords.length === 0) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6">
        <main className="w-full max-w-[600px] flex flex-col gap-8 items-center">
          <header className="flex flex-col gap-3 text-center w-full items-center relative">
            <Link 
              href="/favorites" 
              prefetch={false}
              className="group absolute right-0 -top-4 inline-flex items-center justify-center gap-1.5 h-10 px-5 bg-white border border-gray-200 rounded-full text-slate-600 text-[15px] font-semibold no-underline transition-all duration-200 shadow-sm select-none z-10 hover:bg-gray-50 hover:border-gray-300 hover:text-slate-900 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm"
            >
              <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-600" />
              お気に入り
            </Link>
            <h1 className="text-[28px] leading-[1.3] text-slate-900 font-bold mt-12 sm:text-[32px]">復習モード</h1>
          </header>
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium mb-3">
              お気に入りの単語はまだありません
            </p>
            <p className="text-sm leading-[1.6]">
              単語詳細ページの星マーク（☆）をクリックして、
              <br />
              お気に入りに登録してから復習モードをご利用ください。
            </p>
            <div className="mt-8">
              <Link href="/" prefetch={false} className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg font-bold text-sm tracking-wide no-underline transition-all duration-200 hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
                <span className="inline-flex items-center">単語を探す</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <StudyClient 
      words={favoriteWords} 
      storageKey="toeic-review-state-v1" 
      pageTitle="復習モード"
      backLink="/favorites"
      backLinkText="お気に入りへ戻る"
      order="sequential"
    />
  );
}
