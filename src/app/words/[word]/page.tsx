import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { getWordBySlug, getAllWords, getRelatedWords } from "@/data/words";
import { getWordDetail } from "@/data/word-detail";
import { generateWordDetailJsonLd } from "@/lib/json-ld";
import Loading from "./loading";

// Vercel Hobbyプランの制限対策 (60秒)
export const maxDuration = 60;

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

  // 詳細情報も取得して meta description をユニーク化
  // （L1 Data Cache ヒット時は数ms。SSGビルド済みのため実質無コスト）
  const detailData = await getWordDetail(slug).catch(() => null);

  const levelLabel =
    wordEntry.level === "important" ? "重要" :
    wordEntry.level === "medium" ? "中級" : "上級";

  const title = `${wordEntry.term} | TOEIC重要単語`;

  let description: string;
  if (detailData) {
    const translation = detailData.japaneseTranslation?.trim() || "";
    const partsOfSpeech = Array.from(
      new Set(detailData.meanings.map((m) => m.partOfSpeech).filter(Boolean))
    ).join("・");
    const exampleEn = detailData.toeicExamples?.[0]?.english?.trim() || "";

    const head = translation
      ? `「${wordEntry.term}」の意味は「${translation}」。`
      : `TOEIC頻出単語「${wordEntry.term}」の使い方を解説。`;
    const middle = partsOfSpeech
      ? `品詞:${partsOfSpeech}、TOEIC ${levelLabel}レベル。`
      : `TOEIC ${levelLabel}レベル。`;
    const tail = exampleEn
      ? `例文「${exampleEn}」など、ビジネス文脈の例文・類義語・発音音声を掲載。`
      : `ビジネス文脈の例文・類義語・派生語・発音音声を掲載。`;

    // 160字前後に収める
    description = `${head}${middle}${tail}`.slice(0, 158);
  } else {
    description = `「${wordEntry.term}」(TOEIC ${levelLabel}レベル) の意味・例文・類義語・派生語・発音音声を、ビジネス文脈に絞って掲載。`;
  }
  const url = `https://www.toeic-words.com/words/${slug}`;
  const images = [
    {
      url: `/words/${slug}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: `${wordEntry.term} - TOEIC重要単語`,
    },
  ];

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images,
    },
    alternates: {
      canonical: url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
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
  const wordEntry = await getWordBySlug(word);

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
        <div className="mt-0 p-5 bg-white/96 rounded-[20px] border border-gray-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)] relative flex flex-col gap-4">
          <p className="text-red-500 text-lg font-medium mb-6">
            データの取得に失敗しました。時間をおいて再度お試しください。
          </p>
          <Link href="/" className="inline-flex py-2.5 px-5 bg-indigo-600 text-white rounded-lg font-medium transition-colors duration-200 hover:bg-indigo-700">
            一覧へ戻る
          </Link>
        </div>
      </>
    );
  }

  // 内部リンク用のマッピングを作成
  const linkedWords: Record<string, string> = {};
  
  // 関連単語の取得（同レベル単語取得）
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
      <WordDetailClient 
        initialData={detailData} 
        linkedWords={linkedWords} 
        relatedWords={relatedWords} 
        level={wordEntry?.level}
      />
    </>
  );
}
