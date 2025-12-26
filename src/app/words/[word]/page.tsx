import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getAllWords, getWordBySlug } from "@/data/words";
import styles from "./word-detail.module.css";

const WordDetailClient = dynamic(
  () => import("./WordDetailClient").then((m) => m.WordDetailClient),
  {
    loading: () => (
      <div className={styles.detailContainer}>
        <div className={styles.headerRow}>
          <div className={styles.wordSkeleton} />
          <div className={styles.pronunciationSkeleton} />
        </div>
        <div className={styles.sectionSkeleton} style={{ width: "140px" }} />
        <div className={styles.skeletonBlock} />
        <div className={styles.skeletonBlock} />
        <div className={styles.sectionSkeleton} style={{ width: "80px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
          <div className={styles.skeletonPill} />
          <div className={styles.skeletonPill} />
          <div className={styles.skeletonPill} />
        </div>
        <div className={styles.sectionSkeleton} style={{ width: "120px" }} />
        <div className={styles.skeletonBlock} style={{ height: "80px" }} />
        <div className={styles.skeletonBlock} style={{ height: "80px" }} />
      </div>
    ),
  }
);

type PageProps = {
  params: Promise<{
    word: string;
  }>;
};

export function generateStaticParams() {
  return getAllWords().map((word) => ({ word: word.slug }));
}

export default async function WordPage({ params }: PageProps) {
  const { word } = await params;
  const entry = getWordBySlug(word);

  if (!entry) {
    notFound();
  }

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
              <span className={styles.breadcrumbCurrent}>{entry.term}</span>
            </p>
            <h2 className={styles.pageTitle}>AIによる単語の詳細解説</h2>
          </div>
        </header>

        <WordDetailClient word={entry.slug} />

        <p className={styles.aiDisclaimer}>
          AIによる解説は必ずしも正しいとは限りません。重要な情報は確認するようにしてください。
        </p>
      </main>
    </div>
  );
}
