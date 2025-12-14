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
        <div className={styles.sectionSkeleton} />
        <div className={styles.sectionSkeleton} />
        <div className={styles.sectionSkeleton} />
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
            <h1 className={styles.pageTitle}>AIによる単語の詳しい解説</h1>
            <p className={styles.pageSubtitle}>
              発音・日本語の意味（品詞別）・語形変化・類義語・TOEIC例文・ニュアンスなどをわかりやすく表示します。
            </p>
          </div>
        </header>

        <WordDetailClient word={entry.slug} />
      </main>
    </div>
  );
}
