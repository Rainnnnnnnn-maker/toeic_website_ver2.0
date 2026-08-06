"use client";

import Link from "next/link";
import type { Word } from "@/data/words";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";
import { Headphones } from "lucide-react";

type Props = {
  words: Word[];
  /** 選定に使われた日付キー。詳細ページの前後ナビが同じセットを再計算するために引き渡す。 */
  dateKey: string;
  /** 選定元の単語コーパス版。不一致時に誤った6語ナビを使わないために引き渡す。 */
  wordListVersion: string;
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

export default function TodayRecommendedWordsClient({ words, dateKey, wordListVersion, variant }: Props) {
  // 6語の slug ではなく日付キーと短いコーパス版を載せる。詳細ページ側は
  // 同じ純粋ロジックでセットを再計算し、版が違えば全単語ナビへフォールバックする。
  const todayQuery = new URLSearchParams({
    from: "today",
    today: dateKey,
    v: wordListVersion,
  }).toString();

  if (variant === "preview") {
    return (
      <section className="bg-white/90 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-800">
              今日おすすめの{TODAY_WORDS_COUNT}単語
            </h2>
            <Link
              href="/today-words/listen"
              // prefetch={false}
              className="group relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg shadow-[0_2px_8px_0_rgba(16,185,129,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_12px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-4 bg-white/20" />
              </div>
              <Headphones size={14} className="transition-transform group-hover:scale-110" />
              <span className="relative z-10">聞き流し</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            {words.map((word) => (
              <Link
                key={word.slug}
                href={`/words/${word.slug}?${todayQuery}`}
                // prefetch={false}
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
          <h2 className="text-base font-bold text-slate-800">
            今日おすすめの{TODAY_WORDS_COUNT}単語
          </h2>
          <Link
            href="/today-words/listen"
            // prefetch={false}
            className="group relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg shadow-[0_2px_8px_0_rgba(16,185,129,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_12px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
              <div className="relative h-full w-4 bg-white/20" />
            </div>
            <Headphones size={14} className="transition-transform group-hover:scale-110" />
            <span className="relative z-10">聞き流し</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {words.map((word) => (
            <Link
              key={word.slug}
              href={`/words/${word.slug}?${todayQuery}`}
              // prefetch={false}
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
