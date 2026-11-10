"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import {
  ArrowRight,
  BookOpen,
  Brain,
  ChevronRight,
  CircleUserRound,
} from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { REVIEW_INTERVAL_DAYS } from "@/lib/review-schedule";

type Props = {
  /** 解説記事（`/guide/forgetting-curve`）のタイトル。記事データ側を唯一の出どころにする。 */
  guideTitle: string;
  /** 解説記事の読了目安（分）。 */
  guideReadingMin: number;
};

const LOGIN_HREF = "/login?next=/mypage";
const GUIDE_HREF = "/guide/forgetting-curve";

/**
 * 未ログイン時のお気に入りページに出すログイン案内。
 *
 * 「機能が制限されている」ではなく「忘却曲線と間隔反復に沿った復習が使える」
 * という利点を前面に出し、根拠となる解説記事へも同じカード内から送る。
 * お気に入りの登録・一覧はログインなしで使えるままなので、その点も必ず併記する。
 *
 * お気に入り 0 件のゲストにも表示する（別端末で登録済みのユーザーが、
 * 空の一覧を見て離脱するのを防ぐため）。その場合は一覧側の空状態を
 * 押し下げすぎないよう、間隔の図解を省く。
 */
export default function FavoritePracticeLoginCard({
  guideTitle,
  guideReadingMin,
}: Props) {
  const { favorites, favoritesStatus } = useFavorites();
  const isGuest = favoritesStatus === "guest";
  const count = favorites.length;
  const hasFavorites = count > 0;

  const viewTrackedRef = useRef(false);

  useEffect(() => {
    if (!isGuest || viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    sendGAEvent("event", "favorite_practice_gate_view", {
      feature: "card",
      has_favorites: hasFavorites,
    });
  }, [isGuest, hasFavorites]);

  if (!isGuest) return null;

  const trackCta = (target: "login" | "guide") =>
    sendGAEvent("event", "favorite_practice_gate_cta", {
      feature: "card",
      target,
    });

  return (
    <section
      aria-labelledby="favorite-login-card-title"
      className="flex flex-col gap-3.5 rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-teal-50 p-4 shadow-[0_8px_30px_rgba(5,150,105,0.12)] sm:p-5"
    >
      <div className="flex flex-col gap-2">
        <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white">
          <Brain size={13} aria-hidden="true" />
          忘却曲線 × 間隔反復
        </p>
        <h2
          id="favorite-login-card-title"
          className="text-[17px] font-bold leading-[1.4] text-slate-900 sm:text-[20px]"
        >
          {hasFavorites ? (
            <>
              お気に入り
              <span className="mx-1 text-emerald-600">{count}語</span>
              を、
              <br className="sm:hidden" />
              忘れかけた頃にもう一度
            </>
          ) : (
            "気になった単語を、忘れかけた頃にもう一度"
          )}
        </h2>
        <p className="text-[13px] leading-[1.7] text-slate-600">
          {hasFavorites
            ? "ログインすると、復習のタイミングを自動で管理します。"
            : "ログインすると、別の端末のお気に入りもここに表示されます。"}
        </p>
      </div>

      {hasFavorites && (
        <ol
          aria-label="復習の間隔"
          className="flex flex-wrap items-center gap-x-1 gap-y-1.5"
        >
          {REVIEW_INTERVAL_DAYS.map((days, index) => (
            <li key={days} className="flex items-center gap-1">
              {index > 0 && (
                <ArrowRight
                  size={12}
                  aria-hidden="true"
                  className="text-emerald-300"
                />
              )}
              <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                {days}日後
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <Link
          href={LOGIN_HREF}
          prefetch={false}
          onClick={() => trackCta("login")}
          className="group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-emerald-600 to-teal-500 px-8 py-2.5 text-[15px] font-bold text-white shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:transform-[skew(-12deg)_translateX(150%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
          <CircleUserRound size={18} aria-hidden="true" />
          <span className="relative z-10">ログイン</span>
        </Link>
        <p className="text-xs leading-[1.6] text-slate-500">
          登録・一覧はログインなしでも使えます
        </p>
      </div>

      <Link
        href={GUIDE_HREF}
        prefetch={false}
        onClick={() => trackCta("guide")}
        className="group flex items-center gap-2 border-t border-emerald-100 pt-3 text-[13px] font-bold leading-[1.5] text-emerald-700 no-underline hover:text-emerald-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <BookOpen size={16} aria-hidden="true" className="shrink-0" />
        <span className="min-w-0 flex-1 underline decoration-emerald-200 underline-offset-4 group-hover:decoration-emerald-500">
          {guideTitle}
          <span className="ml-1.5 font-normal text-slate-500">
            （約 {guideReadingMin} 分）
          </span>
        </span>
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </section>
  );
}
