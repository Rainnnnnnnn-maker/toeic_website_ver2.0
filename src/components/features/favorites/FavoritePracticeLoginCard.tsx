"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { CircleUserRound, Lock } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

/**
 * 未ログイン時のお気に入りページで、「復習モード」「聞き流し」ボタンの代わりに出す案内。
 *
 * お気に入りが 0 件のときは一覧側が空状態を出すため、ここでは何も出さない
 * （従来の `ReviewModeButton` / `ListenModeButton` の挙動を踏襲）。
 */
export default function FavoritePracticeLoginCard() {
  const { favorites, favoritesStatus } = useFavorites();
  const isGuestWithFavorites =
    favoritesStatus === "guest" && favorites.length > 0;

  const viewTrackedRef = useRef(false);

  useEffect(() => {
    if (!isGuestWithFavorites || viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    sendGAEvent("event", "favorite_practice_gate_view", { feature: "card" });
  }, [isGuestWithFavorites]);

  if (!isGuestWithFavorites) return null;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Lock size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-slate-900">
            お気に入りを効率よく復習
          </p>
          <p className="mt-1 text-[13px] leading-[1.7] text-slate-500">
            復習モードと聞き流しは、マイページから利用できます。ログインすると、この端末のお気に入りを引き継ぎ、復習記録も複数端末で同期されます。
          </p>
        </div>
      </div>

      <Link
        href="/login?next=/mypage"
        prefetch={false}
        onClick={() =>
          sendGAEvent("event", "favorite_practice_gate_cta", {
            feature: "card",
            target: "login",
          })
        }
        className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <CircleUserRound size={16} />
        Google でログインしてマイページへ
      </Link>

      <p className="text-xs leading-[1.6] text-slate-400">
        ※ お気に入りの登録・一覧はログインなしでも利用できます
      </p>
    </section>
  );
}
