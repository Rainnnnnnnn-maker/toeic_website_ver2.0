import Link from "next/link";
import styles from "./page.module.css";
import { getAllWords } from "@/data/words";
import WordsListClient from "./WordsListClient";

export default function Home() {
  const words = getAllWords();

  return (
    <div className={styles.page}>
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
            学習モードを開始する
          </Link>
        </header>
        <WordsListClient words={words} />
      </main>
    </div>
  );
}
