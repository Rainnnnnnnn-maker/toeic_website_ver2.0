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
  const words = getAllWords();
  if (!process.env.GEMINI_API_KEY) {
    const first = words[0];
    return first ? [{ word: first.slug }] : [{ word: "placeholder" }];
  }
  return words.map((word) => ({ word: word.slug }));
}

export default async function WordPage({ params }: PageProps) {
  const { word } = await params;
  const entry = getWordBySlug(word);

  if (!entry) {
    notFound();
  }

  let detailData = null;

  if (process.env.GEMINI_API_KEY) {
    try {
      detailData = await getWordDetail(word);
    } catch {
      detailData = null;
    }
  }

  if (!detailData) {
    return (
       <div className={styles.detailContainer}>
        <p className={styles.errorText}>データの取得に失敗しました。時間をおいて再度お試しください。</p>
        <Link href="/" className={styles.retryButton}>
          一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <WordDetailClient initialData={detailData} />
  );
}
