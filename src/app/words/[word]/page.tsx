import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getWordBySlug } from "@/data/words";
import { getWordDetail } from "@/lib/actions";
import styles from "./word-detail.module.css";
import Loading from "./loading";
import { DynamicMetadata } from "./components/DynamicMetadata";

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

export default async function WordPage({ params }: PageProps) {
  const { word } = await params;

  // 以前の同期的な getWordBySlug 呼び出しと 404 判定を削除し、
  // Suspense 内で処理させることで TTFB を改善する。
  // DynamicMetadata に Promise を渡し、クライアント側でタイトルを更新する。

  return (
    <>
      <Suspense fallback={null}>
        <DynamicMetadata wordPromise={fetchWord(word)} />
      </Suspense>
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
