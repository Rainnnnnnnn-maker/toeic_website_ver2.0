"use client";

import { useEffect, useRef } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { RefreshCw, TriangleAlert } from "lucide-react";
import type { Word } from "@/data/words";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useReviewProgress } from "@/hooks/useReviewProgress";
import MyPageAccountCard from "@/components/features/mypage/MyPageAccountCard";
import MyPageDashboard from "@/components/features/mypage/MyPageDashboard";
import {
  MyPageAccountCardFallback,
  MyPageDashboardFallback,
  ReviewMenuFallback,
} from "@/components/features/mypage/MyPageFallback";
import MyPageLoginGate from "@/components/features/mypage/MyPageLoginGate";
import ReviewMenu from "@/components/features/mypage/ReviewMenu";

type Props = {
  allWords: Word[];
};

/**
 * マイページの状態分岐と、パーツごとのスケルトン差し替えを担当する。
 *
 * お気に入りは「Supabase から取得済み（favoritesStatus === "ready"）」の
 * ときだけ本体へ渡す。ログイン直後の localStorage 由来の値を混ぜないため。
 */
export default function MyPageClient({ allWords }: Props) {
  const { user, signOut } = useAuth();
  const { favorites, favoritesStatus, retryFavoritesSync } = useFavorites();
  const {
    status: progressStatus,
    records,
    streak,
    hasSyncError,
    retry: retryProgress,
  } = useReviewProgress();

  const status: "guest" | "loading" | "ready" | "error" = (() => {
    if (favoritesStatus === "guest" || progressStatus === "guest") return "guest";
    if (favoritesStatus === "error" || progressStatus === "error") return "error";
    if (favoritesStatus === "ready" && progressStatus === "ready") return "ready";
    return "loading";
  })();

  const gateTrackedRef = useRef(false);

  useEffect(() => {
    if (status !== "guest" || gateTrackedRef.current) return;
    gateTrackedRef.current = true;
    sendGAEvent("event", "mypage_login_gate_view");
  }, [status]);

  if (status === "guest") {
    return <MyPageLoginGate />;
  }

  if (status === "error") {
    return (
      <section className="flex flex-col items-start gap-4 rounded-2xl border border-amber-200 bg-white p-6 shadow-xs">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <TriangleAlert size={18} />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-800">
            学習データを読み込めませんでした
          </p>
          <p className="mt-1 text-[13px] leading-[1.6] text-slate-500">
            通信状況が不安定な可能性があります。時間をおいて再度お試しください。
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            retryFavoritesSync();
            retryProgress();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        >
          <RefreshCw size={15} />
          再読み込み
        </button>
      </section>
    );
  }

  // ここに来るのはログイン中か、認証判定中（プリレンダリング時を含む）。
  // パーツごとに必要なデータが揃った時点で、同じ位置のスケルトンを本体へ差し替える。
  // アカウント行と学習メニューはログインが分かれば出せるが、集計パーツは
  // Supabase のお気に入りと復習記録の両方が揃うまでスケルトンのまま待つ。
  return (
    <>
      {user ? (
        <MyPageAccountCard user={user} onSignOut={signOut} />
      ) : (
        <MyPageAccountCardFallback />
      )}
      {status === "ready" ? (
        <MyPageDashboard
          allWords={allWords}
          favorites={favorites}
          records={records}
          streak={streak}
          hasSyncError={hasSyncError}
        />
      ) : (
        <MyPageDashboardFallback />
      )}
      {user ? <ReviewMenu /> : <ReviewMenuFallback />}
    </>
  );
}
