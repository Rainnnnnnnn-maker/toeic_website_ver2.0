"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import StudyClient from "@/components/features/study/StudyClient";
import type { Word } from "@/data/words";

type Props = {
  allWords: Word[];
};

export default function ReviewWrapper({ allWords }: Props) {
  const { favorites } = useFavorites();

  const favoriteWords = useMemo(() => {
    const wordsMap = new Map(allWords.map((w) => [w.slug, w]));
    return favorites
      .map((slug) => wordsMap.get(slug))
      .filter((w): w is Word => w !== undefined);
  }, [allWords, favorites]);

  if (favoriteWords.length === 0) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f9fafb_45%,#ffffff_100%)] sm:py-12 sm:px-6">
        <main className="w-full max-w-[600px] flex flex-col gap-8 items-center">
          <header className="flex flex-col gap-3 text-center w-full items-center relative">
            <Link href="/favorites" className="absolute right-0 -top-4 inline-flex items-center justify-center gap-2 px-[26px] py-[14px] min-h-[44px] bg-gradient-to-br from-[#726ece] to-[#1eabed] text-white rounded-full font-semibold text-[15px] tracking-[0.04em] no-underline transition-all duration-160 shadow-[0_12px_30px_rgba(15,23,42,0.28)] z-10 hover:-translate-y-px hover:scale-[1.02] hover:brightness-105 hover:shadow-[0_18px_40px_rgba(15,23,42,0.32)] active:translate-y-0 active:scale-99 active:shadow-[0_8px_20px_rgba(15,23,42,0.22)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(191,219,254,0.9),0_12px_30px_rgba(15,23,42,0.28)]">
              お気に入りへ戻る
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
              <Link href="/" className="inline-flex items-center justify-center gap-2 px-[26px] py-[14px] min-h-[44px] bg-gradient-to-br from-[#726ece] to-[#1eabed] text-white rounded-full font-semibold text-[15px] tracking-[0.04em] no-underline transition-all duration-160 shadow-[0_12px_30px_rgba(15,23,42,0.28)] hover:-translate-y-px hover:scale-[1.02] hover:brightness-105 hover:shadow-[0_18px_40px_rgba(15,23,42,0.32)] active:translate-y-0 active:scale-99 active:shadow-[0_8px_20px_rgba(15,23,42,0.22)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(191,219,254,0.9),0_12px_30px_rgba(15,23,42,0.28)]">
                単語を探しに行く
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
