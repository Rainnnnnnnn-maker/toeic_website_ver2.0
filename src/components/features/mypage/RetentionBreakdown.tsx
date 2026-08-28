"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { ReviewSummary } from "@/lib/review-schedule";

type Props = {
  summary: ReviewSummary;
};

const SEGMENTS = [
  { key: "untouched", label: "未着手", bar: "bg-slate-300", dot: "bg-slate-300" },
  { key: "learning", label: "復習中", bar: "bg-sky-400", dot: "bg-sky-400" },
  { key: "familiar", label: "定着間近", bar: "bg-emerald-400", dot: "bg-emerald-400" },
  { key: "mastered", label: "定着済み", bar: "bg-emerald-600", dot: "bg-emerald-600" },
] as const;

/** お気に入り全体の定着度を 4 区分で表示する。 */
export default function RetentionBreakdown({ summary }: Props) {
  const total = summary.total;
  const remaining = total - summary.mastered;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800">定着度の内訳</h3>
        <p className="text-xs text-slate-500">
          お気に入り {total} 語
          {remaining > 0 && ` ・ あと ${remaining} 語で全部が定着済み`}
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
          <li key={key} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
            <span className="text-xs text-slate-500">{label}</span>
            <span className="ml-auto text-sm font-bold text-slate-800 sm:ml-0">
              {summary[key]}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-[11px] leading-[1.6] text-slate-400">
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
