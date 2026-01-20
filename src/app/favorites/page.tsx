import Link from "next/link";
import { getAllWords } from "@/data/words";
import FavoritesListClient from "@/components/features/favorites/FavoritesListClient";
import styles from "@/app/page.module.css";
import type { Metadata } from "next";
import ReviewModeButton from "@/components/features/review/ReviewModeButton";
import Script from "next/script";

export const metadata: Metadata = {
  title: "お気に入り単語",
  description: "登録したお気に入り単語の一覧",
  alternates: {
    canonical: "https://www.toeic-words.com/favorites",
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
    <div className={styles.page}>
      <Script
        id="json-ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <p className={styles.tagline}>YOUR COLLECTION</p>
            <h1 className={styles.title}>お気に入り単語</h1>
            <p className={styles.subtitle}>
              学習中に気になった単語を復習しましょう。
            </p>
          </div>
          <div className={styles.ctaGroup}>
            <ReviewModeButton />
            <Link href="/" className={styles.secondaryButton}>
              単語一覧へ戻る
            </Link>
          </div>
        </header>
        <FavoritesListClient allWords={allWords} />
      </main>
    </div>
  );
}
