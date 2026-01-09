'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './study.module.css';
import type { Word } from '@/data/words';

type Props = {
  words: Word[];
  storageKey?: string;
  pageTitle?: string;
  backLink?: string;
  backLinkText?: string;
};

type PersistedStudyStateV1 = {
  v: 1;
  currentSlug: string;
  rememberedSlugs: string[];
  forgottenSlugs: string[];
  updatedAt: number;
};

const DEFAULT_STORAGE_KEY = 'toeic-study-state-v1';
const DEFAULT_PAGE_TITLE = '英単語学習';
const DEFAULT_BACK_LINK = '/';
const DEFAULT_BACK_LINK_TEXT = '単語一覧へ戻る';

function getNavigationType(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const entry = window.performance.getEntriesByType('navigation')[0];
  if (!entry) return undefined;
  if ('type' in entry) {
    return (entry as PerformanceNavigationTiming).type;
  }
  return undefined;
}

function parsePersistedStudyState(raw: string): PersistedStudyStateV1 | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== 'object') return null;
    const obj = data as Record<string, unknown>;
    if (obj.v !== 1) return null;
    if (typeof obj.currentSlug !== 'string') return null;
    if (!Array.isArray(obj.rememberedSlugs) || !obj.rememberedSlugs.every((s) => typeof s === 'string')) {
      return null;
    }
    if (!Array.isArray(obj.forgottenSlugs) || !obj.forgottenSlugs.every((s) => typeof s === 'string')) {
      return null;
    }
    if (typeof obj.updatedAt !== 'number') return null;
    return obj as PersistedStudyStateV1;
  } catch {
    return null;
  }
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function addUnique(values: string[], value: string): string[] {
  if (values.includes(value)) return values;
  return [...values, value];
}

function removeValue(values: string[], value: string): string[] {
  return values.filter((v) => v !== value);
}

export default function StudyClient({ 
  words, 
  storageKey = DEFAULT_STORAGE_KEY,
  pageTitle = DEFAULT_PAGE_TITLE,
  backLink = DEFAULT_BACK_LINK,
  backLinkText = DEFAULT_BACK_LINK_TEXT
}: Props) {
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [rememberedSlugs, setRememberedSlugs] = useState<string[]>([]);
  const [forgottenSlugs, setForgottenSlugs] = useState<string[]>([]);
  const initializedRef = useRef(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [countdownKey, setCountdownKey] = useState(0);
  const countdownTimeoutsRef = useRef<number[]>([]);

  const wordBySlug = useMemo(() => {
    const map = new Map<string, Word>();
    for (const w of words) {
      map.set(w.slug, w);
    }
    return map;
  }, [words]);

  const clearCountdown = useCallback(() => {
    for (const id of countdownTimeoutsRef.current) {
      clearTimeout(id);
    }
    countdownTimeoutsRef.current = [];
    setCountdownValue(null);
  }, []);

  const startCountdown = useCallback(() => {
    for (const id of countdownTimeoutsRef.current) {
      clearTimeout(id);
    }
    countdownTimeoutsRef.current = [];

    setCountdownValue(3);
    setCountdownKey((k) => k + 1);

    const t2 = window.setTimeout(() => {
      setCountdownValue(2);
      setCountdownKey((k) => k + 1);
    }, 1000);
    const t1 = window.setTimeout(() => {
      setCountdownValue(1);
      setCountdownKey((k) => k + 1);
    }, 2000);
    const t0 = window.setTimeout(() => {
      setCountdownValue(0);
      setCountdownKey((k) => k + 1);
    }, 3000);
    const th = window.setTimeout(() => {
      setCountdownValue(null);
    }, 3060);

    countdownTimeoutsRef.current = [t2, t1, t0, th];
  }, []);

  const pickRandomWord = useCallback(() => {
    if (words.length === 0) return;

    if (typeof window !== 'undefined') {
      startCountdown();
    }

    let nextWord;
    let safetyCounter = 0;
    
    // 現在の単語と同じ場合は再抽選する（リストが2つ以上ある場合のみ）
    do {
      const randomIndex = Math.floor(Math.random() * words.length);
      nextWord = words[randomIndex];
      safetyCounter++;
    } while (
      words.length > 1 && 
      currentWord && 
      nextWord.slug === currentWord.slug && 
      safetyCounter < 10
    );

    setCurrentWord(nextWord);
  }, [startCountdown, words, currentWord]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted || getNavigationType() === 'back_forward') {
        clearCountdown();
      }
    };

    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      clearCountdown();
    };
  }, [clearCountdown]);

  useEffect(() => {
    if (initializedRef.current) return;
    const timer = window.setTimeout(() => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const navigationType = getNavigationType();

      if (navigationType === 'reload') {
        try {
          window.sessionStorage.removeItem(storageKey);
        } catch {
        }
        setRememberedSlugs([]);
        setForgottenSlugs([]);
        pickRandomWord();
        return;
      }

      try {
        const raw = window.sessionStorage.getItem(storageKey);
        if (raw) {
          const persisted = parsePersistedStudyState(raw);
          if (persisted) {
            const word = wordBySlug.get(persisted.currentSlug);
            if (word) {
              setCurrentWord(word);
              setRememberedSlugs(uniqueStrings(persisted.rememberedSlugs));
              setForgottenSlugs(uniqueStrings(persisted.forgottenSlugs));
              return;
            }
          }
        }
      } catch {
      }

      pickRandomWord();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pickRandomWord, wordBySlug, storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!currentWord) return;
    try {
      const nextState: PersistedStudyStateV1 = {
        v: 1,
        currentSlug: currentWord.slug,
        rememberedSlugs,
        forgottenSlugs,
        updatedAt: Date.now(),
      };
      window.sessionStorage.setItem(storageKey, JSON.stringify(nextState));
    } catch {
    }
  }, [currentWord, rememberedSlugs, forgottenSlugs, storageKey]);

  useEffect(() => {
    if (!currentWord) return;
    router.prefetch(`/words/${currentWord.slug}`);
  }, [currentWord, router]);

  const handleRemembered = () => {
    if (!currentWord) return;
    setRememberedSlugs((prev) => addUnique(prev, currentWord.slug));
    setForgottenSlugs((prev) => removeValue(prev, currentWord.slug));
    pickRandomWord();
  };

  const handleForgot = () => {
    if (!currentWord) return;
    setForgottenSlugs((prev) => addUnique(prev, currentWord.slug));
    setRememberedSlugs((prev) => removeValue(prev, currentWord.slug));
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
          <Link href={backLink} className={styles.backButton}>
            {backLinkText}
          </Link>
          <h1 className={styles.title}>{pageTitle}</h1>
          <p className={styles.subtitle}>
            表示された単語を知っていますか？
          </p>
        </header>

        <section className={styles.cardSection}>
          <div className={styles.wordCard}>
            <span className={styles.wordText}>{currentWord.term}</span>
          </div>
          {countdownValue !== null && (
            <div className={styles.countdownOverlay} aria-hidden="true">
              <div key={countdownKey} className={styles.countdownBubble}>
                {countdownValue}
              </div>
            </div>
          )}
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
