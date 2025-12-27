import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getAllWords, getWordBySlug } from "@/data/words";
import { getWordDetail } from "@/lib/actions";
import styles from "./word-detail.module.css";

const WordDetailClient = dynamic(
  () => import("./WordDetailClient").then((m) => m.WordDetailClient),
  { ssr: true } // Client ComponentでもSSR有効化
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

  // Server Component内でデータを取得（L1 Cache: Next.js Data Cache）
  // データがない場合は生成処理が走る（L2: Redis -> L3: Gemini）
  const detailData = await getWordDetail(word);

  if (!detailData) {
    // 生成失敗時などのハンドリング（必要に応じてエラーページなど）
    // ここでは簡易的にnotFoundとするか、エラー表示用のUIを出す
    return (
      <div className={styles.page}>
        <main className={styles.main}>
           <div className={styles.detailContainer}>
            <p className={styles.errorText}>データの取得に失敗しました。時間をおいて再度お試しください。</p>
            <Link href="/" className={styles.retryButton}>
              一覧へ戻る
            </Link>
          </div>
        </main>
      </div>
    );
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

        <WordDetailClient initialData={detailData} />

        <p className={styles.aiDisclaimer}>
          AIによる解説は必ずしも正しいとは限りません。重要な情報は確認するようにしてください。
        </p>
      </main>
    </div>
  );
}
