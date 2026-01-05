 'use client';
import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import type { Word } from "@/data/words";
import TabNavigation, { TabId } from "@/components/TabNavigation";

type Props = {
  importantWords: Word[];
  mediumWords: Word[];
};

export default function WordsListClient({ importantWords, mediumWords }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>('important');
  const pageSize = 20;

  const currentList = activeTab === 'medium' ? mediumWords : importantWords;

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = e.target.value;
    setQuery(nextQuery);
    setPage(1);
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return currentList;
    return currentList.filter((w) => w.term.toLowerCase().startsWith(q));
  }, [currentList, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  return (
    <section className={styles.gridSection}>
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className={styles.controlsRow}>
        <input
          value={query}
          onChange={handleQueryChange}
          className={styles.searchInput}
          placeholder="単語を検索..."
          aria-label="単語検索"
        />
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
            href={`/words/${word.slug}`}
            className={styles.wordCard}
          >
            <span className={styles.wordText}>{word.term}</span>
            <span className={styles.wordMeta}>クリックしてAIによる解説を見る</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
