"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import {
  ChevronLeft,
  CircleUserRound,
  Flame,
  Lock,
  RefreshCw,
  Smartphone,
} from "lucide-react";

export type FavoritePracticeFeature = "review" | "listen";

type Props = {
  feature: FavoritePracticeFeature;
};

const FEATURE_COPY: Record<
  FavoritePracticeFeature,
  { heading: string; body: string }
> = {
  review: {
    heading: "お気に入りの復習にはログインが必要です",
    body: "復習モードは、マイページの復習スケジュールと一体で動く機能になりました。ログインすると、この端末のお気に入りを引き継いだうえで利用できます。",
  },
  listen: {
    heading: "お気に入りの聞き流しにはログインが必要です",
    body: "お気に入り単語の聞き流しは、マイページから利用できます。ログインすると、この端末のお気に入りを引き継いだうえで利用できます。",
  },
};

const LOGIN_HREF = "/login?next=/mypage";

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

/**
 * お気に入りを使った復習・聞き流しの共通ログイン案内。
 * `/review` と `/favorites/listen` の両方から使う。
 *
 * 「制限された」ではなく「同期と復習管理のために必要」と伝えるため、
 * お気に入りの登録・一覧がログインなしで使える点も必ず併記する。
 */
export default function FavoritePracticeLoginGate({ feature }: Props) {
  const { heading, body } = FEATURE_COPY[feature];

  const viewTrackedRef = useRef(false);

  useEffect(() => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    sendGAEvent("event", "favorite_practice_gate_view", { feature });
  }, [feature]);

  return (
    <section className="flex w-full flex-col gap-5 rounded-2xl border border-emerald-100 bg-white p-6 text-left shadow-sm sm:p-8">
      <div className="flex flex-col gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Lock size={18} />
        </span>
        <h1 className="text-[20px] font-bold leading-[1.4] text-slate-900 sm:text-[24px]">
          {heading}
        </h1>
        <p className="text-sm leading-[1.7] text-slate-500">{body}</p>
      </div>

      <ul className="flex flex-col gap-3">
        {BENEFITS.map(({ icon: Icon, title, body: benefitBody }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Icon size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">{title}</p>
              <p className="text-[13px] leading-[1.6] text-slate-500">
                {benefitBody}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={LOGIN_HREF}
          prefetch={false}
          onClick={() =>
            sendGAEvent("event", "favorite_practice_gate_cta", {
              feature,
              target: "login",
            })
          }
          className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <CircleUserRound size={16} />
          Google でログインしてマイページへ
        </Link>
        <Link
          href="/favorites"
          prefetch={false}
          onClick={() =>
            sendGAEvent("event", "favorite_practice_gate_cta", {
              feature,
              target: "favorites",
            })
          }
          className="group inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        >
          <ChevronLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-600"
          />
          お気に入り一覧へ戻る
        </Link>
      </div>

      <ul className="flex list-inside list-disc flex-col gap-1 text-xs leading-relaxed text-slate-500">
        <li>初回ログイン時に、この端末のお気に入りが引き継がれます。</li>
        <li>
          お気に入りの登録・一覧、学習モード、今日の6単語は、ログインなしでも利用できます。
        </li>
      </ul>
    </section>
  );
}
