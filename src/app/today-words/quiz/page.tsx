import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import TodayQuizClient from "@/components/features/quiz/TodayQuizClient";
import { getRecentQuizzes } from "@/data/daily-quiz";
import { QUIZ_HISTORY_DAYS } from "@/lib/daily-quiz";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";

export const metadata: Metadata = {
  title: `今日の${TODAY_WORDS_COUNT}語クイズ`,
  description: `その日のおすすめ${TODAY_WORDS_COUNT}単語の意味を、4択クイズで確認できます。登録不要で、直近${QUIZ_HISTORY_DAYS}日分に挑戦できます。`,
  alternates: {
    canonical: "https://www.toeic-words.com/today-words/quiz",
  },
  // 誤答の選択肢は AI が毎日生成し、人による確認を経ていない。内容を確認できるまで検索結果には出さない
  robots: {
    index: false,
  },
};

export default async function TodayQuizPage() {
  const { todayKey, days } = await getRecentQuizzes();

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <main className="w-full max-w-2xl flex flex-col gap-5 relative">
        <header className="flex flex-col gap-3">
          <Link
            href="/today-words"
            prefetch={false}
            className="group inline-flex h-10 w-fit items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-[15px] font-semibold text-slate-600 no-underline shadow-xs transition-all duration-200 select-none hover:-translate-y-px hover:border-gray-300 hover:bg-gray-50 hover:text-slate-900 hover:shadow-md active:translate-y-0 active:shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            <ChevronLeft size={18} className="text-slate-400 transition-transform group-hover:-translate-x-0.5 group-hover:text-slate-600" aria-hidden />
            今日のおすすめ単語
          </Link>
          <div>
            <p className="text-xs tracking-[0.12em] uppercase text-slate-500">DAILY QUIZ</p>
            <h1 className="text-[22px] leading-[1.3] text-slate-900 font-bold sm:text-[26px]">
              今日の{TODAY_WORDS_COUNT}語クイズ
            </h1>
            <p className="mt-1 text-sm leading-[1.6] text-gray-500">
              今日おすすめの{TODAY_WORDS_COUNT}単語を、4択で確認しましょう。約2〜3分・登録不要です。
            </p>
          </div>
        </header>

        <TodayQuizClient todayKey={todayKey} days={days} />

        <section className="mt-6 text-sm leading-relaxed text-slate-700">
          <h2 className="mb-3 text-base font-semibold text-slate-900">クイズの仕組み</h2>
          <ul className="mb-3 list-inside list-disc space-y-1">
            <li>
              出題されるのは、その日の「今日おすすめの{TODAY_WORDS_COUNT}単語」と同じ単語です。毎朝7時ごろに新しいクイズへ切り替わります。
            </li>
            <li>直近{QUIZ_HISTORY_DAYS}日分のクイズに挑戦できます。日付のボタンで切り替えてください。</li>
            <li>回答の進み具合はこのブラウザにだけ保存され、ほかの端末には同期されません。</li>
            <li>不正解だった単語は、結果画面からまとめてお気に入りに追加できます。</li>
          </ul>
          <p className="text-xs text-slate-500">
            正解の訳と例文は各単語の解説ページと同じ内容で、誤答の選択肢はAIが生成しています。人による確認を経ていないため、気になる点があれば「詳しい解説を見る」から解説ページをご確認ください。
          </p>
        </section>
      </main>
    </div>
  );
}
