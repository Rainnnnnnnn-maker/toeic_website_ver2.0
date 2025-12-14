import Link from "next/link";
import styles from "./page.module.css";
import { getAllWords } from "@/data/words";

export default function Home() {
  const words = getAllWords();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.tagline}>日本人のためのTOEIC単語学習サイト</p>
            <h1 className={styles.title}>ビジネス英語の必須単語を効率よくマスター</h1>
            <p className={styles.subtitle}>
              単語カードをクリックして、意味・発音・例文・ニュアンスなどを
              AIが日本語で丁寧に解説します。
            </p>
          </div>
        </header>

        <section className={styles.gridSection}>
          <div className={styles.gridHeader}>
            <h2 className={styles.sectionTitle}>はじめてのTOEIC単語セット</h2>
            <p className={styles.sectionDescription}>
              まずはTOEIC頻出の重要単語10語からスタート。あとから自由に単語を
              追加して、自分だけの単語帳を育てていけます。
            </p>
          </div>
          <div className={styles.wordGrid}>
            {words.map((word) => (
              <Link
                key={word.slug}
                href={`/words/${word.slug}`}
                className={styles.wordCard}
              >
                <span className={styles.wordText}>{word.term}</span>
                <span className={styles.wordMeta}>クリックしてAIによる詳しい解説を見る</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
