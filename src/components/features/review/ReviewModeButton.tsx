"use client";

import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";

export default function ReviewModeButton() {
  const { favorites } = useFavorites();
  
  // Prevent hydration mismatch by checking if mounted, or just return null initially?
  // Since favorites come from localStorage, initially they are empty array in context until loaded.
  // FavoritesContext initializes favorites as [] and isLoaded as false.
  // But we want to avoid flash. 
  // Ideally, we should wait until loaded. But if we return null, it might just pop in.
  // That's probably acceptable.

  if (favorites.length === 0) return null;

  return (
    <Link href="/review" className="inline-flex items-center justify-center gap-2 px-[26px] py-[14px] min-h-[44px] bg-gradient-to-br from-[#726ece] to-[#1eabed] text-white rounded-full font-semibold text-[15px] tracking-[0.04em] no-underline transition-all duration-160 shadow-[0_12px_30px_rgba(15,23,42,0.28)] hover:-translate-y-px hover:scale-[1.02] hover:brightness-105 hover:shadow-[0_18px_40px_rgba(15,23,42,0.32)] active:translate-y-0 active:scale-99 active:shadow-[0_8px_20px_rgba(15,23,42,0.22)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(191,219,254,0.9),0_12px_30px_rgba(15,23,42,0.28)]">
       <span className="inline-flex items-center">復習モード</span>
    </Link>
  );
}
