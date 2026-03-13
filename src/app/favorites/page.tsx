import Link from "next/link";
import { getAllWords } from "@/data/words";
import FavoritesListClient from "@/components/features/favorites/FavoritesListClient";
import type { Metadata } from "next";
import ReviewModeButton from "@/components/features/review/ReviewModeButton";
import Script from "next/script";

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
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f9fafb_45%,#ffffff_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <Script
        id="json-ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full max-w-[960px] flex flex-col gap-5 relative">
        <header className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex flex-col gap-3 sm:max-w-[60%]">
            <p className="text-xs tracking-[0.12em] uppercase text-slate-500">YOUR COLLECTION</p>
            <h1 className="text-[22px] leading-[1.3] text-slate-900 sm:text-[26px] lg:text-[28px]">お気に入り単語</h1>
            <p className="text-sm leading-[1.6] text-gray-500">
              学習中に気になった単語を復習しましょう。
            </p>
          </div>
          <div className="flex gap-4 items-center mt-2 flex-wrap justify-end sm:justify-start">
            <ReviewModeButton />
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-[26px] py-[14px] min-h-[44px] bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white rounded-full font-semibold text-[15px] tracking-[0.04em] no-underline transition-all duration-160 shadow-[0_12px_30px_rgba(217,119,6,0.28)] hover:-translate-y-px hover:scale-[1.02] hover:brightness-105 hover:shadow-[0_18px_40px_rgba(217,119,6,0.32)] active:translate-y-0 active:scale-99 active:shadow-[0_8px_20px_rgba(217,119,6,0.22)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(253,186,116,0.9),0_12px_30px_rgba(217,119,6,0.28)]">
              単語一覧へ戻る
            </Link>
          </div>
        </header>
        <FavoritesListClient allWords={allWords} />
      </main>
    </div>
  );
}
