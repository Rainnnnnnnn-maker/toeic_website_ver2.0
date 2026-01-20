"use client";

import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import styles from "@/app/page.module.css";

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
    <Link href="/review" className={styles.ctaButton}>
       <span className={styles.ctaButtonLabel}>復習モード</span>
    </Link>
  );
}
