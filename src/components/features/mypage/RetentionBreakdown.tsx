"use client";

import { useId, useState } from "react";
import type { Word } from "@/data/words";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { RetentionLevel, ReviewSummary } from "@/lib/review-schedule";

type Props = {
  summary: ReviewSummary;
  words: { word: Word; level: RetentionLevel }[];
};

const SEGMENTS = [
  { key: "untouched", label: "未着手", bar: "bg-slate-300", dot: "bg-slate-300" },
  { key: "learning", label: "復習中", bar: "bg-sky-400", dot: "bg-sky-400" },
  { key: "familiar", label: "定着間近", bar: "bg-emerald-400", dot: "bg-emerald-400" },
  { key: "mastered", label: "定着済み", bar: "bg-emerald-600", dot: "bg-emerald-600" },
] as const;

/** お気に入り全体の定着度を 4 区分で表示する。 */
export default function RetentionBreakdown({ summary, words }: Props) {
  const total = summary.total;
  const [selected, setSelected] = useState<RetentionLevel | null>(null);
  const listId = useId();
  const selectedWords = words.filter((item) => item.level === selected);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800">定着度の内訳</h3>
        <p className="text-xs text-slate-500">
          お気に入り {total} 語
          {` ・ ${summary.mastered} 語が定着済み・${summary.familiar} 語が定着間近`}
        </p>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {SEGMENTS.map(({ key, label, bar }) => {
          const value = summary[key];
          if (value === 0) return null;
          return (
            <div
              key={key}
              className={`${bar} h-full transition-[width] duration-500`}
              style={{ width: `${(value / total) * 100}%` }}
              title={`${label} ${value}語`}
            />
          );
        })}
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SEGMENTS.map(({ key, label, dot }) => (
          <li key={key}>
            <button type="button" aria-expanded={selected === key} aria-controls={listId}
              onClick={() => setSelected(selected === key ? null : key)}
              className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-2 text-left transition-colors hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${selected === key ? "border-emerald-600 bg-emerald-50" : "border-slate-200"}`}>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
            <span className="text-xs text-slate-500">{label}</span>
            <span className="ml-auto text-sm font-bold text-slate-800 sm:ml-0">
              {summary[key]}
            </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-600">定着度を選ぶと、該当する単語を確認できます。</p>
      <div id={listId} hidden={selected === null}>
        {selected !== null && (
          <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-bold text-slate-800">{SEGMENTS.find((item) => item.key === selected)?.label}：{selectedWords.length} 語</h4>
            {selectedWords.length === 0 ? <p className="text-sm text-slate-600">この定着度の単語はまだありません。</p> : (
              <ul className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {selectedWords.map(({ word }) => (
                  <li key={word.slug}><Link href={`/words/${word.slug}?from=mypage`} prefetch={false}
                    className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 active:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">{word.term}</Link></li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <p className="text-xs leading-[1.6] text-slate-600">
        「覚えている」と答えるたびに 1 → 3 → 7 → 14 → 30 日と間隔が伸び、忘れかけた頃に再出題されます。
        <Link
          href="/guide/forgetting-curve"
          prefetch={false}
          className="ml-1 inline-flex items-center gap-0.5 text-blue-600 underline underline-offset-2"
        >
          <BookOpen size={11} />
          忘却曲線とは
        </Link>
      </p>
    </section>
  );
}
