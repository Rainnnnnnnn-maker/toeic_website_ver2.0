"use client";

import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import { RotateCcw } from "lucide-react";

export default function ReviewModeButton() {
  // 復習はログイン必須。Supabase 由来のお気に入りが揃うまでは出さない
  // （未ログイン時は FavoritePracticeLoginCard がログイン導線を出す）。
  const { favorites, favoritesStatus } = useFavorites();

  if (favoritesStatus !== "ready" || favorites.length === 0) return null;

  return (
    <Link href="/review" prefetch={false} className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-lg font-bold text-sm shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
        <div className="relative h-full w-8 bg-white/20" />
      </div>
      <RotateCcw size={16} className="transition-transform group-hover:-rotate-45 group-hover:scale-110" />
      <span className="relative z-10">復習モード</span>
    </Link>
  );
}
