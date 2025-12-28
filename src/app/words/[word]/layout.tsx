import { getAllWords, getWordBySlug } from "@/data/words";
import Link from "next/link";
import styles from "./word-detail.module.css";

export default async function WordLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ word: string }>;
}) {
  const { word } = await params;
  const entry = getWordBySlug(word);
  
  // entryが見つからない場合のフォールバック（通常はpage側で404になるが、layoutは共有される）
  // loading中も表示されるため、最低限の情報を表示
  const term = entry?.term || word;

  const allWords = getAllWords();
  const currentIndex = allWords.findIndex((w) => w.slug === word);
  const prevWord = currentIndex > 0 ? allWords[currentIndex - 1] : null;
  const nextWord = currentIndex >= 0 && currentIndex < allWords.length - 1 ? allWords[currentIndex + 1] : null;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
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

        {children}

        <p className={styles.aiDisclaimer}>
          AIによる解説は必ずしも正しいとは限りません。重要な情報は確認するようにしてください。
        </p>
      </main>
    </div>
  );
}
