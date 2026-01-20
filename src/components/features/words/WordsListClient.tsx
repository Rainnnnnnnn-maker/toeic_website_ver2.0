 'use client';
import { useMemo, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import styles from "@/app/page.module.css";
import type { Word } from "@/data/words";
import TabNavigation, { TabId } from "@/components/TabNavigation";

type WordWithCategory = Word & { category: 'important' | 'medium' };

type Props = {
  importantWords: Word[];
  mediumWords: Word[];
};

export default function WordsListClient({ importantWords, mediumWords }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>('important');
  const inputRef = useRef<HTMLInputElement>(null);
  const pageSize = 20;

  const { importantWithCategory, mediumWithCategory, allWithCategory } = useMemo(() => {
    const imp = importantWords.map(w => ({ ...w, category: 'important' as const }));
    const med = mediumWords.map(w => ({ ...w, category: 'medium' as const }));
    return {
      importantWithCategory: imp,
      mediumWithCategory: med,
      allWithCategory: [...imp, ...med]
    };
  }, [importantWords, mediumWords]);

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = e.target.value;
    setQuery(nextQuery);
    setPage(1);
  };

  const handleClear = () => {
    setQuery("");
    setPage(1);
    inputRef.current?.focus();
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setQuery(""); // タブ切り替え時に検索をクリア
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return activeTab === 'important' ? importantWithCategory : mediumWithCategory;
    }
    return allWithCategory.filter((w) => w.term.toLowerCase().startsWith(q));
  }, [query, activeTab, importantWithCategory, mediumWithCategory, allWithCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  return (
    <section className={styles.gridSection}>
      <div className={styles.introSection}>
        {query ? (
          <div>
             <h2 className={styles.levelTitle}>検索結果: {filtered.length}件</h2>
          </div>
        ) : activeTab === 'important' ? (
          <div>
            <h2 className={styles.levelTitle}>最重要単語（TOEIC 600点レベル）</h2>
            <p className={styles.levelDescription}>
              TOEICスコアアップのために最初に覚えるべき基礎単語です。
              まずはこのリストを完璧にすることで、スコアアップを目指しましょう。
            </p>
          </div>
        ) : (
          <div>
            <h2 className={styles.levelTitle}>中級単語（TOEIC 730〜800点レベル）</h2>
            <p className={styles.levelDescription}>
              さらなるスコアアップを目指すための応用単語です。
              やや難易度の高い単語ですが、Part 5、Part 6、Part 7の問題対策としても有効です。
            </p>
          </div>
        )}
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className={styles.controlsRow}>
        <div className={styles.searchContainer}>
          <input
            ref={inputRef}
            value={query}
            onChange={handleQueryChange}
            className={styles.searchInput}
            placeholder="全単語から検索..."
            aria-label="単語検索"
          />
          {query && (
            <button
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="検索条件をクリア"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                width="16"
                height="16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            aria-label="最初のページ"
          >
            最初
          </button>
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
          <button
            className={styles.pageButton}
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="最後のページ"
          >
            最後
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
            <div className={styles.wordCardHeader}>
              <span className={styles.wordText}>{word.term}</span>
              {query && (
                <span className={`${styles.categoryBadge} ${word.category === 'important' ? styles.badgeImportant : styles.badgeMedium}`}>
                  {word.category === 'important' ? '重要' : '中級'}
                </span>
              )}
            </div>
            <span className={styles.wordMeta}>クリックしてAIによる解説を見る</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
