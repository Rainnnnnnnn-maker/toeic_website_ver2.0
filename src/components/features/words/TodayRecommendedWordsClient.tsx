"use client";

import Link from "next/link";
import type { Word } from "@/data/words";

type Props = {
  words: Word[];
  variant: "preview" | "full";
};

const levelStyles = {
  important: "bg-blue-100 text-blue-800",
  medium: "bg-purple-100 text-purple-800",
  high: "bg-red-100 text-red-800",
} as const;

const levelLabels = {
  important: "重要",
  medium: "中級",
  high: "上級",
} as const;

export default function TodayRecommendedWordsClient({ words, variant }: Props) {
  if (variant === "preview") {
    return (
      <section className="bg-white/90 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-800">今日おすすめの5単語</h2>
            <Link
              href="/today-words/listen"
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
            >
              聞き流し
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            {words.map((word) => (
              <Link
                key={word.slug}
                href={`/words/${word.slug}?from=today`}
                className="flex flex-col gap-0.5 p-2.5 bg-white rounded-md border border-slate-200 no-underline transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-sm hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900 leading-tight">{word.term}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded-full font-semibold whitespace-nowrap ${levelStyles[word.level]}`}>
                    {levelLabels[word.level]}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400">AI解説を見る</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white/90 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-base font-bold text-slate-800">今日おすすめの5単語</h2>
          <Link
            href="/today-words/listen"
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
          >
            聞き流し
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {words.map((word) => (
            <Link
              key={word.slug}
              href={`/words/${word.slug}?from=today`}
              className="flex flex-col gap-1 p-3 bg-white rounded-md border border-slate-200 no-underline transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-sm hover:border-slate-300"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 leading-tight">{word.term}</span>
                <span className={`text-[9px] px-1 py-0.5 rounded-full font-semibold whitespace-nowrap ${levelStyles[word.level]}`}>
                  {levelLabels[word.level]}
                </span>
              </div>
              <span className="text-[9px] text-gray-400">AI解説を見る</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
