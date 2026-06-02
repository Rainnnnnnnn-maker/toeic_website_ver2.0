import type { Metadata } from "next";
import { getAllWords } from "@/data/words";
import FavoritesListenClient from "@/components/features/favorites/FavoritesListenClient";
import { A8AdBanner468x60 } from "@/components/common/A8AdBanner";

export const metadata: Metadata = {
  title: "お気に入り単語 聞き流し | TOEIC Words",
  description: "お気に入りに登録した単語の発音・英語例文・日本語訳を自動再生する「聞き流しモード」です。",
  // ユーザー固有のお気に入りに依存するページなので noindex（self-canonical は付けない）
  robots: {
    index: false,
  },
};

export default async function FavoritesListenPage() {
  const allWords = await getAllWords();

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f9fafb_45%,#ffffff_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <div className="w-full max-w-2xl flex flex-col relative">
        <FavoritesListenClient allWords={allWords} />
        <A8AdBanner468x60 />
      </div>
    </div>
  );
}
