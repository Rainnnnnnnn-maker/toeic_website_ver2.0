import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllWords } from "@/data/words";
import TodayRecommendedWordsClient from "@/components/features/words/TodayRecommendedWordsClient";

export const metadata: Metadata = {
  title: "今日おすすめの5単語",
  description: "毎日更新されるおすすめ5単語で、TOEIC学習を短時間で始めましょう。",
  alternates: {
    canonical: "https://www.toeic-words.com/today-words",
  },
};

export default async function TodayWordsPage() {
  const allWords = await getAllWords();

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f9fafb_45%,#ffffff_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <main className="w-full max-w-[960px] flex flex-col gap-5 relative">
        <header className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex flex-col gap-3 sm:max-w-[65%]">
            <p className="text-xs tracking-[0.12em] uppercase text-slate-500">TODAY&apos;S PICKS</p>
            <h1 className="text-[22px] leading-[1.3] text-slate-900 font-bold sm:text-[26px] lg:text-[28px]">今日おすすめの5単語</h1>
            <p className="text-sm leading-[1.6] text-gray-500">
              毎日同じ5語を固定表示。まずはここから短時間で学習を始めましょう。
            </p>
          </div>
          <div className="flex gap-4 items-center mt-2 flex-wrap justify-end sm:justify-start">
            <Link href="/study" className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg font-bold text-sm tracking-wide no-underline transition-all duration-200 hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
              学習モードへ
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] bg-slate-50 text-slate-700 border-2 border-slate-700 rounded-lg font-bold text-sm tracking-wide no-underline transition-all duration-200 hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500">
              TOPへ戻る
            </Link>
          </div>
        </header>

        <Suspense fallback={<section className="bg-white/90 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse h-[220px]" />}>
          <TodayRecommendedWordsClient words={allWords} variant="full" />
        </Suspense>
      </main>
    </div>
  );
}
