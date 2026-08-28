import Link from "next/link";
import { getAllWords } from "@/data/words";
import FavoritesListClient from "@/components/features/favorites/FavoritesListClient";
import ListenModeButton from "@/components/features/favorites/ListenModeButton";
import type { Metadata } from "next";
import ReviewModeButton from "@/components/features/review/ReviewModeButton";
import MyPageLinkButton from "@/components/features/mypage/MyPageLinkButton";
import Script from "next/script";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "お気に入り単語",
  description: "登録したお気に入り単語の一覧",
  alternates: {
    canonical: "https://www.toeic-words.com/favorites",
  },
  robots: {
    index: false,
  },
};

export default async function FavoritesPage() {
  const allWords = await getAllWords();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "TOP",
        "item": "https://www.toeic-words.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "お気に入り単語",
        "item": "https://www.toeic-words.com/favorites"
      }
    ]
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <Script
        id="json-ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full max-w-[960px] flex flex-col gap-5 relative">
        <header className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex flex-col gap-3 sm:max-w-[60%]">
            <p className="text-xs tracking-[0.12em] uppercase text-slate-500">YOUR COLLECTION</p>
            <h1 className="text-[22px] leading-[1.3] text-slate-900 font-bold sm:text-[26px] lg:text-[28px]">お気に入り単語</h1>
            <p className="text-sm leading-[1.6] text-gray-500">
              学習中に気になった単語を復習しましょう。
            </p>
          </div>
          <div className="flex gap-4 items-center mt-2 flex-wrap justify-end sm:justify-start">
            <ListenModeButton />
            <ReviewModeButton />
            <MyPageLinkButton variant="solid" />
            <Link href="/" prefetch={false} className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-sm shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span>単語一覧</span>
            </Link>
          </div>
        </header>
        <FavoritesListClient allWords={allWords} />
      </main>
    </div>
  );
}
