"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import StudyClient from "@/components/features/study/StudyClient";
import type { Word } from "@/data/words";
import styles from "@/components/features/study/study.module.css"; // Reuse study styles

type Props = {
  allWords: Word[];
};

export default function ReviewWrapper({ allWords }: Props) {
  const { favorites } = useFavorites();

  const favoriteWords = useMemo(() => {
    const wordsMap = new Map(allWords.map((w) => [w.slug, w]));
    return favorites
      .map((slug) => wordsMap.get(slug))
      .filter((w): w is Word => w !== undefined);
  }, [allWords, favorites]);

  if (favoriteWords.length === 0) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <header className={styles.header}>
            <Link href="/favorites" className={styles.backButton}>
              お気に入りへ戻る
            </Link>
            <h1 className={styles.title}>復習モード</h1>
          </header>
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <p style={{ fontSize: "18px", fontWeight: 500, marginBottom: "12px" }}>
              お気に入りの単語はまだありません
            </p>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              単語詳細ページの星マーク（☆）をクリックして、
              <br />
              お気に入りに登録してから復習モードをご利用ください。
            </p>
            <div style={{ marginTop: "32px" }}>
              <Link href="/" style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #726ece, #1eabed)",
                color: "#ffffff",
                borderRadius: "9999px",
                fontWeight: 600,
                textDecoration: "none"
              }}>
                単語を探しに行く
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <StudyClient 
      words={favoriteWords} 
      storageKey="toeic-review-state-v1" 
      pageTitle="復習モード"
      backLink="/favorites"
      backLinkText="お気に入りへ戻る"
      order="sequential"
    />
  );
}
