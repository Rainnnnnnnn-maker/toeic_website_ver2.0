import Link from "next/link";
import { getAllWords } from "@/data/words";
import FavoritesListClient from "./FavoritesListClient";
import styles from "../page.module.css";
import type { Metadata } from "next";
import ReviewModeButton from "../ReviewModeButton";

export const metadata: Metadata = {
  title: "お気に入り単語",
  description: "登録したお気に入り単語の一覧",
  alternates: {
    canonical: "https://www.toeic-words.com/favorites",
  },
};

export default async function FavoritesPage() {
  const allWords = await getAllWords();

  return (
    <div className={styles.page}>
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
