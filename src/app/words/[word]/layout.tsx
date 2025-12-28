import { getWordBySlug } from "@/data/words";
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

        {children}

        <p className={styles.aiDisclaimer}>
          AIによる解説は必ずしも正しいとは限りません。重要な情報は確認するようにしてください。
        </p>
      </main>
    </div>
  );
}
