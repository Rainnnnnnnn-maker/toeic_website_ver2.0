import type { Metadata } from "next";
import { getAllWords } from "@/data/words";
import MyPageClient from "@/components/features/mypage/MyPageClient";

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

export default async function MyPage() {
  // 個人データはすべてクライアントから Supabase を読む。
  // ここで渡すのは長寿命の単語リスト（キャッシュ済み）だけなので、
  // ページシェルは静的なまま保てる。
  const allWords = await getAllWords();

  return <MyPageClient allWords={allWords} />;
}
