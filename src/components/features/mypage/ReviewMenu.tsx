"use client";

import Link from "next/link";
import { BookOpen, Headphones, Sparkles, Star } from "lucide-react";
import {
  trackMyPageCta,
  type MyPageCtaTarget,
} from "@/components/features/mypage/analytics";

type MenuItem = {
  href: string;
  target: MyPageCtaTarget;
  label: string;
  description: string;
  icon: typeof Star;
  tone: string;
};

const ITEMS: MenuItem[] = [
  {
    href: "/favorites",
    target: "favorites",
    label: "お気に入り一覧",
    description: "登録した単語をまとめて見る",
    icon: Star,
    tone: "text-amber-500 bg-amber-50",
  },
  {
    href: "/favorites/listen",
    target: "listen",
    label: "聞き流し",
    description: "音声で例文ごと復習する",
    icon: Headphones,
    tone: "text-cyan-600 bg-cyan-50",
  },
  {
    href: "/study",
    target: "study",
    label: "学習モード",
    description: "全単語からランダム出題",
    icon: BookOpen,
    tone: "text-blue-600 bg-blue-50",
  },
  {
    href: "/today-words",
    target: "today_words",
    label: "今日の6単語",
    description: "新しい単語を仕入れる",
    icon: Sparkles,
    tone: "text-indigo-600 bg-indigo-50",
  },
];

/** マイページから既存の学習機能へ渡す導線。 */
export default function ReviewMenu() {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {ITEMS.map(({ href, target, label, description, icon: Icon, tone }) => (
        <Link
          key={href}
          href={href}
          prefetch={false}
          onClick={() => trackMyPageCta(target)}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
          >
            <Icon size={17} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-800">
              {label}
            </span>
            <span className="block text-xs text-slate-500">{description}</span>
          </span>
        </Link>
      ))}
    </section>
  );
}
