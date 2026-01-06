import Link from "next/link";
import { getAllWords } from "@/data/words";
import FavoritesListClient from "./FavoritesListClient";
import styles from "../page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お気に入り単語",
  description: "登録したお気に入り単語の一覧",
};

export default function FavoritesPage() {
  const allWords = getAllWords();

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
          <Link href="/" className={styles.secondaryButton} style={{ alignSelf: "flex-start" }}>
            ← トップへ戻る
          </Link>
        </header>
        <FavoritesListClient allWords={allWords} />
      </main>
    </div>
  );
}
