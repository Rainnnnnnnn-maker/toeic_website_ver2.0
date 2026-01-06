 'use client';
import { useMemo, useState, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const pageSize = 20;

  const currentList = activeTab === 'medium' ? mediumWords : importantWords;

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
      <div className={styles.introSection}>
        {activeTab === 'important' ? (
          <div>
            <h2 className={styles.levelTitle}>最重要単語（TOEIC 600点レベル）</h2>
            <p className={styles.levelDescription}>
              TOEICスコアアップのために最初に覚えるべき基礎単語です。ビジネスシーンで頻出する動詞や名詞を中心に収録しています。
              まずはこのリストを完璧にすることで、Part 1〜4の聞き取りやPart 5の読解スピードが向上します。
            </p>
          </div>
        ) : (
          <div>
            <h2 className={styles.levelTitle}>中級単語（TOEIC 730〜800点レベル）</h2>
            <p className={styles.levelDescription}>
              さらなるスコアアップを目指すための応用単語です。
              より抽象的な概念や、やや難易度の高いビジネス用語が含まれます。Part 5、Part 6、、Part 7の語彙問題対策としても有効です。
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
            placeholder="単語を検索..."
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
