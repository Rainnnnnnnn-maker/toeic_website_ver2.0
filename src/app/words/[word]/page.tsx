import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { getWordBySlug } from "@/data/words";
import { getWordDetail, type WordDetails } from "@/lib/actions";
import styles from "./word-detail.module.css";
import Loading from "./loading";

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
  // Cache Components有効時は最低1件返す必要があるが、
  // 全件返すとビルド時にGemini APIを大量にコールしてしまい、時間がかかり不安定になる。
  // そのため、ダミーのパスを1つだけ返し、実質的にオンデマンド生成（ISR）とする。
  return [{ word: "__build_placeholder__" }];
}

// データ取得をPromise化するためのラッパー
async function fetchWord(slug: string) {
  return getWordBySlug(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { word: slug } = await params;
  
  // 基本情報の取得（同期・高速）
  const wordEntry = getWordBySlug(slug);
  if (!wordEntry) {
    return {
      title: "単語が見つかりません | TOEIC重要単語",
      description: "お探しの単語は見つかりませんでした。",
    };
  }

  // 詳細情報の取得（非同期・キャッシュor生成）
  // SEOのために、可能な限り詳細情報を含める
  let detail: WordDetails | null = null;
  try {
    detail = await getWordDetail(slug);
  } catch (error) {
    console.error(`Failed to fetch word detail for metadata (${slug}):`, error);
    // エラー時は基本情報のみでフォールバック
  }

  const title = detail
    ? `${detail.word}の意味・覚え方「${detail.japaneseTranslation}」 | TOEIC重要単語`
    : `${wordEntry.term} | TOEIC重要単語`;

  const description = detail
    ? `TOEIC重要単語「${detail.word}」の意味は「${detail.japaneseTranslation}」。${detail.nuance || ""} 例文: ${detail.toeicExamples[0]?.english} - ${detail.toeicExamples[0]?.japanese}`
    : `TOEIC頻出単語「${wordEntry.term}」の意味と使い方をAIが解説。効率よく学習してスコアアップを目指しましょう。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://toeic-words.com/words/${slug}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function WordPage({ params }: PageProps) {
  const { word } = await params;

  return (
    <>
      <Suspense fallback={<Loading />}>
        <WordDetailFetcher word={word} />
      </Suspense>
    </>
  );
}

async function WordDetailFetcher({ word }: { word: string }) {
  // Server Component内でデータを取得（L1 Cache: Next.js Data Cache）
  // データがない場合は生成処理が走る（L2: Redis -> L3: Gemini）
  const detailData = await getWordDetail(word);

  if (!detailData) {
    return (
      <div className={styles.detailContainer}>
        <p className={styles.errorText}>
          データの取得に失敗しました。時間をおいて再度お試しください。
        </p>
        <Link href="/" className={styles.retryButton}>
          一覧へ戻る
        </Link>
      </div>
    );
  }

  return <WordDetailClient initialData={detailData} />;
}
