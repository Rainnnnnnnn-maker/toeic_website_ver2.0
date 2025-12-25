'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './study.module.css';
import type { Word } from '@/data/words';

type Props = {
  words: Word[];
};

export default function StudyClient({ words }: Props) {
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);

  const pickRandomWord = useCallback(() => {
    if (words.length === 0) return;
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentWord(words[randomIndex]);
  }, [words]);

  // Initial load
  useEffect(() => {
    // Use setTimeout to avoid "setState in effect" warning and ensure client-side execution
    const timer = setTimeout(() => {
      pickRandomWord();
    }, 0);
    return () => clearTimeout(timer);
  }, [pickRandomWord]);

  useEffect(() => {
    if (!currentWord) return;
    router.prefetch(`/words/${currentWord.slug}`);
  }, [currentWord, router]);

  const handleRemembered = () => {
    pickRandomWord();
  };

  const handleForgot = () => {
    if (!currentWord) return;
    router.push(`/words/${currentWord.slug}`);
  };

  if (!currentWord) {
    return (
      <div className={styles.page}>
        <div className={styles.main}>
          <p className={styles.subtitle}>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <Link href="/" className={styles.backButton}>
            ← 単語一覧へ戻る
          </Link>
          <h1 className={styles.title}>英単語学習</h1>
          <p className={styles.subtitle}>
            表示された単語を知っていますか？
          </p>
        </header>

        <section className={styles.cardSection}>
          <div className={styles.wordCard}>
            <span className={styles.wordText}>{currentWord.term}</span>
          </div>
        </section>

        <section className={styles.controls}>
          <button 
            className={`${styles.actionButton} ${styles.rememberButton}`}
            onClick={handleRemembered}
            aria-label="覚えている"
          >
            <span className={styles.buttonIcon}>💡</span>
            <span className={styles.buttonLabel}>覚えている</span>
          </button>
          
          <button 
            className={`${styles.actionButton} ${styles.forgotButton}`}
            onClick={handleForgot}
            aria-label="覚えていない"
          >
            <span className={styles.buttonIcon}>❔</span>
            <span className={styles.buttonLabel}>覚えていない</span>
          </button>
        </section>
      </main>
    </div>
  );
}
