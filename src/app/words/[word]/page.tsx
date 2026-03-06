import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { getWordBySlug, getAllWords, getRelatedWords } from "@/data/words";
import { getWordDetail } from "@/actions/word";
import type { WordDetails } from "@/types/word";
import styles from "@/components/features/words/word-detail.module.css";
import { generateWordDetailJsonLd } from "@/lib/json-ld";
import Loading from "./loading";

const WordDetailClient = dynamic(
  () => import("@/components/features/words/WordDetailClient").then((m) => m.WordDetailClient),
  { ssr: true } // Client ComponentでもSSR有効化
);

type PageProps = {
  params: Promise<{
    word: string;
  }>;
};

export async function generateStaticParams() {
  const words = await getAllWords();
  
  // すべての単語をビルド時に生成する（SSG）
  // これにより、Bot等のアクセスによるISR Usage（Function実行）を削減できる。
  if (words.length > 0) {
    return words.map((w) => ({ word: w.slug }));
  }

  // 万が一単語が取得できない場合はダミーを返し、オンデマンドISRとする
  return [{ word: "__build_placeholder__" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { word: slug } = await params;
  
  // 基本情報の取得（同期・高速）
  const wordEntry = await getWordBySlug(slug);
  if (!wordEntry) {
    return {
      title: "単語が見つかりません | TOEIC重要単語",
      description: "お探しの単語は見つかりませんでした。",
    };
  }

  // 詳細情報の取得（getWordDetail）を削除し、ここで待機しないようにする
  // これによりSuspense（ローディング）が即座に動作し、UXが向上する

  const title = `${wordEntry.term} | TOEIC重要単語`;
  const description = `TOEIC頻出単語「${wordEntry.term}」の意味と使い方をAIが解説。効率よく学習してスコアアップを目指しましょう。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://www.toeic-words.com/words/${slug}`,
    },
    alternates: {
      canonical: `https://www.toeic-words.com/words/${slug}`,
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

  // 存在しない単語の場合は404ページへ遷移
  // __build_placeholder__ はビルド用ダミーパスなので除外
  if (word !== "__build_placeholder__" && !(await getWordBySlug(word))) {
    notFound();
  }

  // 親コンポーネントではデータ取得を待機せず、Suspense境界内で取得させることで
  // ストリーミングレンダリング（スケルトン表示）を有効にする。
  // generateMetadataで一度待機するため、TTFB自体は変わらないが、
  // HTMLボディのレンダリングは非同期に行われる。

  return (
    <Suspense fallback={<Loading />}>
      <WordDetailFetcher word={word} />
    </Suspense>
  );
}

async function WordDetailFetcher({ word }: { word: string }) {
  // Server Component内でデータを取得（L1 Cache: Next.js Data Cache）
  // データがない場合は生成処理が走る（L2: Redis -> L3: Gemini）
  const detailData = await getWordDetail(word);

  // データ取得後にJSON-LDを生成（ストリーミングの一部として送信）
  const jsonLd = generateWordDetailJsonLd(word, detailData);

  if (!detailData) {
    return (
      <>
        <Script
          id="json-ld-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className={styles.detailContainer}>
          <p className={styles.errorText}>
            データの取得に失敗しました。時間をおいて再度お試しください。
          </p>
          <Link href="/" className={styles.retryButton}>
            一覧へ戻る
          </Link>
        </div>
      </>
    );
  }

  // 内部リンク用のマッピングを作成
  const linkedWords: Record<string, string> = {};
  
  // 関連単語の取得
  const relatedWords = await getRelatedWords(word, 5);
  
  // チェック対象の単語リスト
  const candidates = new Set<string>();
  
  // 1. 類義語
  detailData.synonyms.forEach(s => candidates.add(s));
  
  // 2. 詳細な意味の中の類義語
  detailData.meanings.forEach(m => {
    m.detailedMeanings.forEach(d => {
      d.synonyms?.forEach(s => candidates.add(s));
    });
  });

  // 存在確認とマッピング
  const allWords = await getAllWords();
  
  // 配列検索からMap検索へ最適化 (O(N*M) -> O(N+M))
  const allWordsMap = new Set(allWords.map(w => w.slug));

  candidates.forEach(term => {
    const slug = term.toLowerCase();
    if (allWordsMap.has(slug)) {
      linkedWords[term] = slug;
    }
  });

  return (
    <>
      <Script
        id="json-ld-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WordDetailClient initialData={detailData} linkedWords={linkedWords} relatedWords={relatedWords} />
    </>
  );
}
