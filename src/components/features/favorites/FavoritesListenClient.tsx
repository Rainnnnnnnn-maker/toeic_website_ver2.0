"use client";

import { RefreshCw } from "lucide-react";
import { Word } from "@/data/words";
import { useFavorites } from "@/context/FavoritesContext";
import FavoritePracticeLoginGate from "@/components/features/auth/FavoritePracticeLoginGate";
import FavoritesListenPlayer from "@/components/features/favorites/FavoritesListenPlayer";

type Props = {
  allWords: Word[];
};

/**
 * お気に入り聞き流しの状態分岐だけを担当する。
 *
 * 聞き流しはログイン必須。未ログインでは再生を始めず（＝TTS も呼ばず）、
 * 共通のログイン案内を表示する。ログイン中は Supabase 由来のお気に入りが
 * 揃うまで待ってからプレイヤーをマウントする。
 */
export default function FavoritesListenClient({ allWords }: Props) {
  const { favorites, favoritesStatus, retryFavoritesSync } = useFavorites();

  if (favoritesStatus === "guest") {
    return <FavoritePracticeLoginGate feature="listen" />;
  }

  if (favoritesStatus === "error") {
    return (
      <section className="flex flex-col items-start gap-4 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold text-slate-800">
            お気に入りを読み込めませんでした
          </p>
          <p className="mt-1 text-[13px] leading-[1.6] text-slate-500">
            アカウントのお気に入りを確認できないため、再生を開始していません。時間をおいて再度お試しください。
          </p>
        </div>
        <button
          type="button"
          onClick={retryFavoritesSync}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        >
          <RefreshCw size={15} />
          再読み込み
        </button>
      </section>
    );
  }

  if (favoritesStatus !== "ready") {
    return (
      <div
        className="flex flex-col gap-4"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">読み込み中</span>
        <div className="h-40 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
      </div>
    );
  }

  return <FavoritesListenPlayer allWords={allWords} favorites={favorites} />;
}
