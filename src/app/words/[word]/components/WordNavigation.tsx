import Link from "next/link";
import { getAllWords } from "@/data/words";
import styles from "../word-detail.module.css";

export default async function WordNavigation({ currentSlug }: { currentSlug: string }) {
  const allWords = await getAllWords();
  const currentIndex = allWords.findIndex((w) => w.slug === currentSlug);
  const prevWord = currentIndex > 0 ? allWords[currentIndex - 1] : null;
  const nextWord = currentIndex >= 0 && currentIndex < allWords.length - 1 ? allWords[currentIndex + 1] : null;
  
  const entry = allWords[currentIndex];
  const term = entry?.term || currentSlug;

  return (
    <>
        <header className={styles.headerRow}>
          <div>
            <p className={styles.breadcrumb}>
              <Link href="/" className={styles.breadcrumbLink}>
                単語一覧
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{term}</span>
            </p>
            <h2 className={styles.pageTitle}>AIによる単語の詳細解説</h2>
          </div>
        </header>

        <nav className={styles.navRow} aria-label="単語ナビゲーション">
          {prevWord ? (
            <Link href={`/words/${prevWord.slug}`} className={styles.navButton}>
              <span aria-hidden="true">←</span> 前単語
            </Link>
          ) : (
            <span className={`${styles.navButton} ${styles.disabled}`}>
              <span aria-hidden="true">←</span> 前単語
            </span>
          )}

          {nextWord ? (
            <Link href={`/words/${nextWord.slug}`} className={styles.navButton}>
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
