import { getTodayRecommendedWords } from "@/data/words";
import TodayWordsListenClient from "@/components/features/today-words/TodayWordsListenClient";
import { Suspense } from "react";

export const metadata = {
  title: "今日の単語 聞き流し | TOEIC Words",
  description: "今日の単語5つの英語と例文を自動再生で聞き流し学習ができます。",
};

export default async function TodayWordsListenPage() {
  const todayWords = await getTodayRecommendedWords(5);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-pulse w-full max-w-xl h-[400px] bg-white rounded-xl border border-slate-200" /></div>}>
        <TodayWordsListenClient words={todayWords} />
      </Suspense>
    </div>
  );
}
