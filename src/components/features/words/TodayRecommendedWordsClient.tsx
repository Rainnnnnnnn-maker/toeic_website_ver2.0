"use client";

import Link from "next/link";
import { WORD_LEVEL_INFO } from "@/lib/word-level";
import { WORD_LEVEL_CARD_STYLES } from "./wordLevelStyles";
import type { Word } from "@/data/words";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";
import { buildTodayNavigationQuery } from "@/lib/today-navigation";
import { Headphones, ListChecks } from "lucide-react";
import { WordLinkPending } from "./WordLinkPending";

type Props = {
  words: Word[];
  variant: "preview" | "full";
};

export default function TodayRecommendedWordsClient({ words, variant }: Props) {
  const todayQuery = buildTodayNavigationQuery(words);

  if (variant === "preview") {
    return (
      <section className="bg-white/90 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-800">
              {/* 狭い画面でボタン2つと並ぶと折り返すため、「6単語」の途中では切らせない */}
              今日おすすめの<span className="inline-block">{TODAY_WORDS_COUNT}単語</span>
            </h2>
            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                href="/today-words/quiz"
                prefetch={false}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <ListChecks size={14} aria-hidden />
                <span>クイズ</span>
              </Link>
              <Link
                href="/today-words/listen"
                // prefetch={false}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <Headphones size={14} aria-hidden />
                <span>聞き流し</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {words.map((word) => (
              <Link
                key={word.slug}
                href={`/words/${word.slug}?${todayQuery}`}
                // prefetch={false}
                className="relative flex flex-col gap-0.5 p-2.5 bg-white rounded-md border border-slate-200 no-underline transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-xs hover:border-slate-300"
              >
                <WordLinkPending />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900 leading-tight">{word.term}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded-full font-semibold whitespace-nowrap ${WORD_LEVEL_CARD_STYLES[word.level].badgeClass}`}>
                    {WORD_LEVEL_INFO[word.level].label}
                  </span>
                </div>
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
          <h2 className="text-base font-bold text-slate-800">
            今日おすすめの<span className="inline-block">{TODAY_WORDS_COUNT}単語</span>
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/today-words/quiz"
              prefetch={false}
              className="group relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-blue-500 rounded-lg shadow-[0_2px_8px_0_rgba(37,99,235,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_12px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:transform-[skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-4 bg-white/20" />
              </div>
              <ListChecks size={14} className="transition-transform group-hover:scale-110" aria-hidden />
              <span className="relative z-10">クイズ</span>
            </Link>
            <Link
              href="/today-words/listen"
              // prefetch={false}
              className="group relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-linear-to-r from-emerald-500 to-teal-400 rounded-lg shadow-[0_2px_8px_0_rgba(16,185,129,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_12px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:transform-[skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-4 bg-white/20" />
              </div>
              <Headphones size={14} className="transition-transform group-hover:scale-110" />
              <span className="relative z-10">聞き流し</span>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {words.map((word) => (
            <Link
              key={word.slug}
              href={`/words/${word.slug}?${todayQuery}`}
              // prefetch={false}
              className="relative flex flex-col gap-1 p-3 bg-white rounded-md border border-slate-200 no-underline transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-xs hover:border-slate-300"
            >
              <WordLinkPending />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 leading-tight">{word.term}</span>
                <span className={`text-[9px] px-1 py-0.5 rounded-full font-semibold whitespace-nowrap ${WORD_LEVEL_CARD_STYLES[word.level].badgeClass}`}>
                  {WORD_LEVEL_INFO[word.level].label}
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
