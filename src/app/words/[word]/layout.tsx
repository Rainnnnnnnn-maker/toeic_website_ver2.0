import Link from "next/link";
import { Suspense } from "react";
import styles from "@/components/features/words/word-detail.module.css";
import WordNavigation from "@/components/features/words/WordNavigation";

export default async function WordLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ word: string }>;
}) {
  const { word } = await params;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Suspense
          fallback={
            <header>
              <p className={styles.breadcrumb}>
                <Link href="/" className={styles.breadcrumbLink}>
                  単語一覧
                </Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>...</span>
              </p>
              <div className={styles.headerRow}>
                <h2 className={styles.pageTitle}>AI単語解説</h2>
              </div>
            </header>
          }
        >
          <WordNavigation currentSlug={word} />
        </Suspense>

        {children}

        <p className={styles.aiDisclaimer}>
          AIによる解説は必ずしも正しいとは限りません。重要な情報は確認するようにしてください。
        </p>
      </main>
    </div>
  );
}
