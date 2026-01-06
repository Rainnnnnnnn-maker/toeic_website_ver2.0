import Link from "next/link";
import Script from "next/script";
import styles from "./page.module.css";
import { getImportantWords, getMediumWords } from "@/data/words";
import WordsListClient from "./WordsListClient";

export default function Home() {
  const importantWords = getImportantWords();
  const mediumWords = getMediumWords();

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
          <div className={styles.ctaGroup}>
            <Link href="/study" className={styles.ctaButton}>
              <span className={styles.ctaButtonLabel}>学習モード</span>
            </Link>
            <Link href="/favorites" className={styles.secondaryButton}>
              <span className={styles.ctaButtonLabel}>お気に入り</span>
            </Link>
          </div>
        </header>
        <WordsListClient importantWords={importantWords} mediumWords={mediumWords} />
      </main>
    </div>
  );
}
