import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import styles from "./page.module.css";
import { getAllWords } from "@/data/words";
import WordsListClient from "./WordsListClient";

export const metadata: Metadata = {
  title: "2026年版 TOEIC 重要単語集",
  description: "TOEIC頻出の重要単語を、一覧・検索・AI解説で効率よく学べる単語集。",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const words = getAllWords();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TOEIC重要単語",
    url: "https://toeic-words.com/",
    inLanguage: "ja-JP",
  };

  return (
    <div className={styles.page}>
      <Script
        id="ldjson-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <p className={styles.tagline}>LEVEL UP YOUR SCORE</p>
            <h1 className={styles.title}>2026年版 TOEIC 重要単語集</h1>
            <p className={styles.subtitle}>
              頻出単語を効率よく学習して、スコアアップを目指しましょう。
            </p>
          </div>
          <Link href="/study" className={styles.ctaButton}>
            学習モード
          </Link>
        </header>
        <WordsListClient words={words} />
      </main>
    </div>
  );
}
