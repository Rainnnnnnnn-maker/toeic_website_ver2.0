"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import type { Word } from "@/data/words";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useReviewProgress } from "@/hooks/useReviewProgress";
import MyPageDashboard from "@/components/features/mypage/MyPageDashboard";
import MyPageLoginGate from "@/components/features/mypage/MyPageLoginGate";

type Props = {
  allWords: Word[];
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <main className="w-full max-w-[960px] flex flex-col gap-5 relative">
        <header className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex flex-col gap-3 sm:max-w-[60%]">
            <p className="text-xs tracking-[0.12em] uppercase text-slate-500">
              MY PAGE
            </p>
            <h1 className="text-[22px] leading-[1.3] text-slate-900 font-bold sm:text-[26px] lg:text-[28px]">
              マイページ
            </h1>
            <p className="text-sm leading-[1.6] text-gray-500">
              お気に入り単語の復習スケジュールと、続けた記録をまとめています。
            </p>
          </div>
          <div className="flex gap-4 items-center mt-2 flex-wrap justify-end sm:justify-start">
            <Link
              href="/"
              prefetch={false}
              className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-sm shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>TOP</span>
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-live="polite" aria-busy="true">
      <span className="sr-only">読み込み中</span>
      <div className="h-16 animate-pulse rounded-2xl bg-white/70" />
      <div className="h-48 animate-pulse rounded-2xl bg-white/70" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-white/70" />
    </div>
  );
}

/**
 * マイページの状態分岐だけを担当する。
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
    return (
      <PageShell>
        <MyPageLoginGate />
      </PageShell>
    );
  }

  if (status === "error") {
    return (
      <PageShell>
        <section className="flex flex-col items-start gap-4 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
          >
            <RefreshCw size={15} />
            再読み込み
          </button>
        </section>
      </PageShell>
    );
  }

  if (status !== "ready" || !user) {
    return (
      <PageShell>
        <LoadingSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <MyPageDashboard
        allWords={allWords}
        user={user}
        onSignOut={signOut}
        favorites={favorites}
        records={records}
        streak={streak}
        hasSyncError={hasSyncError}
      />
    </PageShell>
  );
}
