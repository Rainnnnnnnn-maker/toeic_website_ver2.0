"use client";

import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import { Headphones } from "lucide-react";

export default function ListenModeButton() {
  const { favorites } = useFavorites();
  
  if (favorites.length === 0) return null;

  return (
    <Link href="/favorites/listen" prefetch={false} className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-bold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
        <div className="relative h-full w-8 bg-white/20" />
      </div>
      <Headphones size={16} className="transition-transform group-hover:scale-110" />
      <span className="relative z-10">聞き流し</span>
    </Link>
  );
}
