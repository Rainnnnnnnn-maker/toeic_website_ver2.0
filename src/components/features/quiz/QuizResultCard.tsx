"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import StudyBulkFavoriteButton from "@/components/features/study/StudyBulkFavoriteButton";
import type { DailyQuiz, QuizDaySummary } from "@/lib/daily-quiz";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";

type Props = {
  quiz: DailyQuiz;
  summary: QuizDaySummary;
  /** 今日以外の日を解き終えたとき、今日のクイズへ誘導する */
  onOpenToday: (() => void) | null;
  onRetry: () => void;
};

/** 6問を解き終えた後の結果。不正解の語は、押したときだけお気に入りへまとめて追加できる。 */
export default function QuizResultCard({ quiz, summary, onOpenToday, onRetry }: Readonly<Props>) {
  const wrongQuestions = quiz.questions.filter((question) => summary.wrongSlugs.includes(question.slug));
  const percent = Math.round((summary.correctCount / summary.total) * 100);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-6">
      <h2 className="text-center text-base font-bold text-slate-800">チャレンジ完了！</h2>
      <p className="mt-2 text-center text-[44px] leading-none font-extrabold text-slate-900">
        {summary.correctCount}
        <span className="mx-1.5 text-2xl font-bold text-slate-400">/</span>
        {summary.total}
      </p>
      <p className="mt-2 text-center text-sm text-slate-500">正答率 {percent}%</p>

      {wrongQuestions.length === 0 ? (
        <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-800">
          全問正解です。この調子で続けましょう。
        </p>
      ) : (
        <div className="mt-5">
          <h3 className="text-sm font-bold text-slate-800">不正解の単語</h3>
          <ul className="mt-2 grid gap-2">
            {wrongQuestions.map((question) => {
              const correct = question.options.find((option) => option.id === question.correctOptionId);
              return (
                <li key={question.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-xl border border-slate-200 px-3 py-2">
                  <Link
                    href={`/words/${question.slug}?from=quiz`}
                    prefetch={false}
                    className="text-base font-bold text-blue-700 underline-offset-2 hover:underline"
                  >
                    {question.term}
                  </Link>
                  <span className="text-sm text-slate-700">{correct?.text}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3">
            <StudyBulkFavoriteButton slugs={summary.wrongSlugs} source="quiz_result" />
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            お気に入りに入れた単語は、復習モードでまとめて確認できます（復習モードはログインが必要です）。
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <RotateCcw size={16} aria-hidden />
          もう一度チャレンジ
        </button>
        {onOpenToday && (
          <button
            type="button"
            onClick={onOpenToday}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-300 bg-white px-4 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            今日のクイズへ
          </button>
        )}
        <Link
          href="/today-words"
          prefetch={false}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 no-underline transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          今日の{TODAY_WORDS_COUNT}単語を見る
        </Link>
      </div>
    </section>
  );
}
