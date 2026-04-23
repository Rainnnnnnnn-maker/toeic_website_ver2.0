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
    <Link href="/review" prefetch={false} className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg font-bold text-sm tracking-wide no-underline transition-all duration-200 hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
      <span className="inline-flex items-center">復習モードで学習</span>
    </Link>
  );
}
