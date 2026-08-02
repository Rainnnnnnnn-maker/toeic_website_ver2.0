import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getTodayRecommendedWords } from "@/data/words";
import TodayRecommendedWordsClient from "@/components/features/words/TodayRecommendedWordsClient";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";

export const metadata: Metadata = {
  title: `今日おすすめの${TODAY_WORDS_COUNT}単語`,
  description: `毎日更新されるおすすめ${TODAY_WORDS_COUNT}単語で、TOEIC学習を短時間で始めましょう。`,
  alternates: {
    canonical: "https://www.toeic-words.com/today-words",
  },
};

export default async function TodayWordsPage() {
  const todayWords = await getTodayRecommendedWords();

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <main className="w-full max-w-[960px] flex flex-col gap-5 relative">
        <header className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex flex-col gap-3 sm:max-w-[65%]">
            <p className="text-xs tracking-[0.12em] uppercase text-slate-500">TODAY&apos;S PICKS</p>
            <h1 className="text-[22px] leading-[1.3] text-slate-900 font-bold sm:text-[26px] lg:text-[28px]">
              今日おすすめの{TODAY_WORDS_COUNT}単語
            </h1>
            <p className="text-sm leading-[1.6] text-gray-500">
              毎日同じ{TODAY_WORDS_COUNT}語を固定表示。まずはここから短時間で学習を始めましょう。
            </p>
          </div>
          <div className="flex gap-4 items-center justify-center flex-wrap">
            <Link href="/study" prefetch={false} className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg font-bold text-sm tracking-wide no-underline transition-all duration-200 hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
              <span className="inline-flex items-center">学習モードへ</span>
            </Link>
            <Link href="/" prefetch={false} className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] bg-slate-50 text-slate-700 border-2 border-slate-700 rounded-lg font-bold text-sm tracking-wide no-underline transition-all duration-200 hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500">
              <span className="inline-flex items-center">TOPへ戻る</span>
            </Link>
          </div>
        </header>

        <Suspense fallback={<section className="bg-white/90 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse h-[220px]" />}>
          <TodayRecommendedWordsClient words={todayWords} variant="full" />
        </Suspense>

        <section className="mt-10 text-sm leading-relaxed text-slate-700">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            「今日のおすすめ {TODAY_WORDS_COUNT} 単語」の使い方と仕組み
          </h2>
          <p className="mb-3">
            「今日のおすすめ {TODAY_WORDS_COUNT} 単語」は、当サイトに収録された 1,300 語以上の TOEIC 重要単語の中から、その日 1 日固定で {TODAY_WORDS_COUNT} 単語を選出して表示する機能です。同じ日にアクセスすれば必ず同じ {TODAY_WORDS_COUNT} 語が表示されるため、「今日はこの {TODAY_WORDS_COUNT} 語を覚える」という日次の目標を立てやすくなります。
          </p>
          <h3 className="mt-4 mb-2 text-sm font-semibold text-slate-800">
            選出ロジック
          </h3>
          <p className="mb-3">
            UTC 日付キーと単語スラッグのハッシュをもとに、サーバー側で {TODAY_WORDS_COUNT} 語を決定論的に選出しています（Cache Component 化）。これにより、トップページ・本ページ・聞き流しモードのいずれからアクセスしても、同じ {TODAY_WORDS_COUNT} 単語が表示されます。
          </p>
          <h3 className="mt-4 mb-2 text-sm font-semibold text-slate-800">
            おすすめの活用方法
          </h3>
          <ul className="mb-3 list-inside list-disc space-y-1">
            <li>
              <strong>朝のスキマ時間</strong>：通勤・通学中に {TODAY_WORDS_COUNT} 単語の意味と例文を確認
            </li>
            <li>
              <strong>昼休み</strong>：聞き流しモードで「単語 → 英文例 → 日本語訳」の順に音声を聴く
            </li>
            <li>
              <strong>夜の復習</strong>：覚えにくかった単語を「お気に入り」に追加し、後日復習モードで再確認
            </li>
            <li>
              <strong>翌日</strong>：前日の {TODAY_WORDS_COUNT} 単語を思い出してから、新しい {TODAY_WORDS_COUNT} 単語に進む
            </li>
          </ul>
          <h3 className="mt-4 mb-2 text-sm font-semibold text-slate-800">
            なぜ「1 日 {TODAY_WORDS_COUNT} 単語」なのか
          </h3>
          <p className="mb-3">
            {TODAY_WORDS_COUNT} 語は、短時間でも一覧を見渡し、例文と音声まで確認しやすい量として当サイトが設定した日次目標です。記憶できる語数には個人差があるため、すべて覚えることをノルマにせず、難しかった語をお気に入りへ残して後日もう一度確認してください。
          </p>
          <p className="text-xs text-slate-500">
            復習タイミングの詳細は{" "}
            <Link href="/guide/forgetting-curve" prefetch={false} className="text-blue-600 underline">
              「忘却曲線と間隔反復を取り入れる方法」
            </Link>
            、毎日の学習習慣の組み立て方は{" "}
            <Link href="/guide/last-week-plan" prefetch={false} className="text-blue-600 underline">
              「直前 1 週間の単語復習プラン」
            </Link>{" "}
            をご参照ください。
          </p>
        </section>
      </main>
    </div>
  );
}
