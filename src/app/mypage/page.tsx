import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllWords } from "@/data/words";
import MyPageClient from "@/components/features/mypage/MyPageClient";
import { MyPageContentFallback } from "@/components/features/mypage/MyPageFallback";
import MyPageShell from "@/components/features/mypage/MyPageShell";

export const metadata: Metadata = {
  title: "マイページ",
  description:
    "お気に入り単語の復習スケジュールと学習の記録を確認できるマイページです。",
  alternates: {
    canonical: "https://www.toeic-words.com/mypage",
  },
  // 個人向け画面のためインデックスさせない
  robots: {
    index: false,
  },
};

async function MyPageContent() {
  // 個人データはすべてクライアントから Supabase を読む。
  // ここで渡すのは長寿命の単語リスト（キャッシュ済み）だけなので、
  // ページシェルは静的なまま保てる。
  const allWords = await getAllWords();

  return <MyPageClient allWords={allWords} />;
}

export default function MyPage() {
  // ヘッダーは単語リストの取得を待たずに描画し、本体だけを
  // 各パーツのスケルトンでストリーミングする（TOP と同じ方式）。
  return (
    <MyPageShell>
      <Suspense fallback={<MyPageContentFallback />}>
        <MyPageContent />
      </Suspense>
    </MyPageShell>
  );
}
