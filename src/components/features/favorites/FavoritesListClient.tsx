"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../app/page.module.css";
import { useFavorites } from "@/context/FavoritesContext";
import type { Word } from "@/data/words";

export default function FavoritesListClient({ allWords }: { allWords: Word[] }) {
  const { favorites } = useFavorites();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const favoriteWords = useMemo(() => {
    const favSet = new Set(favorites);
    // 元の順序を維持したい場合は allWords をフィルタリング
    // 追加順にしたい場合は favorites を map して検索するが、
    // ここではリストの順序（アルファベット順など元の順序）を維持する方針とする
    return allWords.filter((w) => favSet.has(w.slug));
  }, [allWords, favorites]);

  const totalPages = Math.max(1, Math.ceil(favoriteWords.length / pageSize));
  // ページ数が減った場合に現在のページが範囲外にならないように調整
  const currentPage = Math.min(Math.max(1, page), totalPages);
  
  const start = (currentPage - 1) * pageSize;
  const current = favoriteWords.slice(start, start + pageSize);

  if (favoriteWords.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
        <p style={{ fontSize: "18px", fontWeight: 500, marginBottom: "12px" }}>
          お気に入りの単語はまだありません
        </p>
        <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
          単語詳細ページの星マーク（☆）をクリックすると、
          <br />
          ここにリストとして保存されます。
        </p>
        <div style={{ marginTop: "32px" }}>
          <Link href="/" className={styles.ctaButton}>
            単語を探しに行く
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.gridSection}>
      <div className={styles.controlsRow}>
        <div style={{ flex: 1 }}></div> {/* Spacer to align pagination to right or center if needed */}
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="前のページ"
          >
            前へ
          </button>
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>
          <button
            className={styles.pageButton}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="次のページ"
          >
            次へ
          </button>
        </div>
      </div>

      <div className={styles.wordGrid}>
        {current.map((word) => (
          <Link
            key={word.slug}
            href={`/words/${word.slug}?from=favorites`}
            className={styles.wordCard}
          >
            <span className={styles.wordText}>{word.term}</span>
            <span className={styles.wordMeta}>
              クリックしてAIによる解説を見る
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
