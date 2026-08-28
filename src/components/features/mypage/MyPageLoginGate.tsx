"use client";

import Link from "next/link";
import {
  BookOpen,
  CircleUserRound,
  Flame,
  RefreshCw,
  Smartphone,
  Star,
} from "lucide-react";
import { trackMyPageCta } from "@/components/features/mypage/analytics";

const BENEFITS = [
  {
    icon: Smartphone,
    title: "端末をまたいで同期",
    body: "スマホで付けたお気に入りの続きを、PC でそのまま復習できます。",
  },
  {
    icon: RefreshCw,
    title: "復習のタイミングを自動で管理",
    body: "覚えた単語は 1 → 3 → 7 → 14 → 30 日と間隔を空けて出題します。",
  },
  {
    icon: Flame,
    title: "連続学習日数が記録される",
    body: "1 語でも復習すればカウント。続けた実感が積み上がります。",
  },
];

/** 未ログイン時のマイページ。突き放さず、無料で使える導線も併記する。 */
export default function MyPageLoginGate() {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-5 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.12em] text-emerald-600">
            MY PAGE
          </p>
          <h2 className="text-[20px] font-bold leading-[1.4] text-slate-900 sm:text-[24px]">
            ログインすると、お気に入り単語の
            <br className="hidden sm:block" />
            復習スケジュールが使えます
          </h2>
          <p className="text-sm leading-[1.7] text-slate-500">
            忘れかけたタイミングで出題される復習キューと、学習の記録をアカウントに保存します。
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="text-[13px] leading-[1.6] text-slate-500">{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/login?next=/mypage"
          prefetch={false}
          onClick={() => trackMyPageCta("login")}
          className="group relative inline-flex items-center justify-center gap-2 self-start rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <CircleUserRound size={16} />
          Google でログイン
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-800">
          ログインしなくても使える機能
        </p>
        <p className="mt-1 text-[13px] leading-[1.6] text-slate-500">
          お気に入りの登録・一覧・復習モード・聞き流しは、これまでどおりログインなしでご利用いただけます。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/favorites"
            prefetch={false}
            onClick={() => trackMyPageCta("favorites")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-bold text-amber-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-sm"
          >
            <Star size={14} />
            お気に入り
          </Link>
          <Link
            href="/study"
            prefetch={false}
            onClick={() => trackMyPageCta("study")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[13px] font-bold text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm"
          >
            <BookOpen size={14} />
            学習モード
          </Link>
          <Link
            href="/today-words"
            prefetch={false}
            onClick={() => trackMyPageCta("today_words")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
          >
            今日の6単語
          </Link>
        </div>
      </section>
    </div>
  );
}
