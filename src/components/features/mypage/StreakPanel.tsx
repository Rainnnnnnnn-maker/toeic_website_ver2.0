"use client";

import { Flame, Repeat2, Trophy } from "lucide-react";

type Props = {
  currentStreak: number;
  bestStreak: number;
  /** 直近 7 日間に復習した単語数（最終復習日ベースの近似値） */
  weeklyReviewedCount: number;
};

/** 継続を可視化するパネル。1 語でも復習すればその日はカウントされる。 */
export default function StreakPanel({
  currentStreak,
  bestStreak,
  weeklyReviewedCount,
}: Props) {
  const items = [
    {
      icon: Flame,
      label: "連続学習日数",
      value: currentStreak,
      unit: "日",
      tone: "text-orange-500 bg-orange-50",
    },
    {
      icon: Trophy,
      label: "自己ベスト",
      value: bestStreak,
      unit: "日",
      tone: "text-amber-500 bg-amber-50",
    },
    {
      icon: Repeat2,
      label: "直近7日の復習",
      value: weeklyReviewedCount,
      unit: "語",
      tone: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-3">
      {items.map(({ icon: Icon, label, value, unit, tone }) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}
          >
            <Icon size={16} />
          </span>
          <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
            {label}
          </p>
          <p className="flex items-baseline gap-0.5 text-slate-900">
            <span className="text-[22px] font-bold leading-none sm:text-[26px]">
              {value}
            </span>
            <span className="text-xs font-bold">{unit}</span>
          </p>
        </div>
      ))}
    </section>
  );
}
