"use client";

import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { ArrowRight, BookOpen, Check, X } from "lucide-react";
import type { DailyQuizQuestion } from "@/lib/daily-quiz";

const OPTION_LETTERS = ["A", "B", "C", "D"];

type Props = {
  question: DailyQuizQuestion;
  /** 0 始まりの出題位置 */
  index: number;
  total: number;
  /** 回答済みなら選んだ選択肢の ID */
  selectedOptionId: string | undefined;
  onAnswer: (optionId: string) => void;
  onNext: () => void;
};

function optionClassName(answered: boolean, isCorrect: boolean, isSelected: boolean): string {
  const base =
    "flex w-full min-h-13 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-base transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none";
  if (!answered) return `${base} cursor-pointer border-slate-200 bg-white text-slate-900 hover:border-blue-400 hover:bg-slate-50 active:bg-blue-50`;
  if (isCorrect) return `${base} cursor-default border-emerald-600 bg-emerald-50 text-slate-900`;
  if (isSelected) return `${base} cursor-default border-red-600 bg-red-50 text-slate-900`;
  return `${base} cursor-default border-slate-200 bg-white text-slate-500`;
}

function markClassName(answered: boolean, isCorrect: boolean, isSelected: boolean): string {
  const base = "grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold";
  if (answered && isCorrect) return `${base} bg-emerald-600 text-white`;
  if (answered && isSelected) return `${base} bg-red-600 text-white`;
  return `${base} bg-blue-100 text-blue-700`;
}

/**
 * 1問分の表示。回答すると同じカードの中に正誤・例文・単語詳細へのリンクを出す。
 * 回答後の選択肢は disabled ではなく aria-disabled にして、押した選択肢からフォーカスを外さない。
 */
export default function QuizQuestionCard({ question, index, total, selectedOptionId, onAnswer, onNext }: Readonly<Props>) {
  const answered = selectedOptionId !== undefined;
  const isCorrect = selectedOptionId === question.correctOptionId;
  const correctOption = question.options.find((option) => option.id === question.correctOptionId);
  const isLast = index === total - 1;
  const progressPercent = ((index + (answered ? 1 : 0)) / total) * 100;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-6">
      <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
        <span>第{index + 1}問</span>
        <span>
          {index + 1} / {total}
        </span>
      </div>
      <div
        className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label="クイズの進み具合"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + (answered ? 1 : 0)}
      >
        <div className="h-full bg-blue-600 transition-[width] motion-reduce:transition-none" style={{ width: `${progressPercent}%` }} />
      </div>

      <h2 className="text-[28px] font-extrabold leading-tight break-words text-slate-900 sm:text-[32px]">{question.term}</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">の意味として最も適切なものは？</p>

      <div className="grid gap-2.5">
        {question.options.map((option, position) => {
          const optionIsCorrect = option.id === question.correctOptionId;
          const optionIsSelected = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              type="button"
              aria-disabled={answered}
              onClick={() => {
                if (!answered) onAnswer(option.id);
              }}
              className={optionClassName(answered, optionIsCorrect, optionIsSelected)}
            >
              <span className={markClassName(answered, optionIsCorrect, optionIsSelected)} aria-hidden>
                {answered && optionIsCorrect ? <Check size={16} /> : answered && optionIsSelected ? <X size={16} /> : OPTION_LETTERS[position]}
              </span>
              <span className="flex-1">{option.text}</span>
              {answered && optionIsCorrect && <span className="sr-only">（正解）</span>}
              {answered && optionIsSelected && !optionIsCorrect && <span className="sr-only">（あなたの回答）</span>}
            </button>
          );
        })}
      </div>

      {/* 読み上げ環境へ正誤を伝えるため、回答前も領域は残す */}
      <div role="status" aria-live="polite">
        {answered && (
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className={`text-lg font-extrabold ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>
              {isCorrect ? "正解！" : "不正解"}
            </p>
            {!isCorrect && correctOption && (
              <p className="mt-1 text-sm text-slate-700">
                <span className="mr-1.5 font-semibold text-slate-500">正解</span>
                {correctOption.text}
              </p>
            )}
            {question.example && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed">
                <p className="text-slate-900" lang="en">
                  {question.example.en}
                </p>
                <p className="mt-1 text-slate-600">{question.example.ja}</p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onNext}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {isLast ? "結果を見る" : "次の問題へ"}
                <ArrowRight size={16} aria-hidden />
              </button>
              <Link
                href={`/words/${question.slug}?from=quiz`}
                prefetch={false}
                onClick={() => sendGAEvent("event", "word_detail_open", { word: question.slug, source: "quiz" })}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 no-underline transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              >
                <BookOpen size={16} aria-hidden />
                詳しい解説を見る
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
