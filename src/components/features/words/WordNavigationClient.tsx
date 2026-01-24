"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";
import { useMemo } from "react";
import styles from "./word-detail.module.css";
import type { Word } from "@/data/words";

export default function WordNavigationClient({
  allWords,
  currentSlug,
}: {
  allWords: Word[];
  currentSlug: string;
}) {
  const searchParams = useSearchParams();
  const isFromFavorites = searchParams.get("from") === "favorites";
  const { favorites } = useFavorites();

  const navigationList = useMemo(() => {
    if (isFromFavorites) {
      const favSet = new Set(favorites);
      // allWordsの順序を維持してフィルタリング
      return allWords.filter((w) => favSet.has(w.slug));
    }
    return allWords;
  }, [allWords, favorites, isFromFavorites]);

  const currentIndex = navigationList.findIndex((w) => w.slug === currentSlug);
  const prevWord = currentIndex > 0 ? navigationList[currentIndex - 1] : null;
  const nextWord =
    currentIndex >= 0 && currentIndex < navigationList.length - 1
      ? navigationList[currentIndex + 1]
      : null;

  const entry = allWords.find((w) => w.slug === currentSlug);
  const term = entry?.term || currentSlug;

  const querySuffix = isFromFavorites ? "?from=favorites" : "";

  return (
    <>
      <header className={styles.headerRow}>
        <div>
          <p className={styles.breadcrumb}>
            {isFromFavorites ? (
              <Link href="/favorites" className={styles.breadcrumbLink}>
                お気に入り
              </Link>
            ) : (
              <Link href="/" className={styles.breadcrumbLink}>
                単語一覧
              </Link>
            )}
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{term}</span>
          </p>
          <h2 className={styles.pageTitle}>AIによる単語の詳細解説</h2>
        </div>
        <div id="word-nav-share-container" className={styles.shareContainer} />
      </header>

      <nav className={styles.navRow} aria-label="単語ナビゲーション">
        {prevWord ? (
          <Link
            href={`/words/${prevWord.slug}${querySuffix}`}
            className={styles.navButton}
          >
            <span aria-hidden="true">←</span> 前単語
          </Link>
        ) : (
          <span className={`${styles.navButton} ${styles.disabled}`}>
            <span aria-hidden="true">←</span> 前単語
          </span>
        )}

        {nextWord ? (
          <Link
            href={`/words/${nextWord.slug}${querySuffix}`}
            className={styles.navButton}
          >
            次単語 <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <span className={`${styles.navButton} ${styles.disabled}`}>
            次単語 <span aria-hidden="true">→</span>
          </span>
        )}
      </nav>
    </>
  );
}
