import styles from "./page.module.css";
import { getAllWords } from "@/data/words";
import WordsListClient from "./WordsListClient";

export default function Home() {
  const words = getAllWords();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>TOEIC 重要単語集</h1>
        </header>
        <WordsListClient words={words} />
      </main>
    </div>
  );
}
