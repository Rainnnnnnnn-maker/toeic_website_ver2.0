'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import styles from './study.module.css';
import type { Word } from '@/data/words';
import { fetchWordDetail } from '@/app/study/actions';

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

// Helper for audio
const playAudio = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; // Default to English US
  window.speechSynthesis.speak(utterance);
};

// AutoResizingText Component
const AutoResizingText = ({ text, className, style }: { text: string, className?: string, style?: React.CSSProperties }) => {
  const ref = useRef<HTMLSpanElement>(null);
  
  const adjustSize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    
    const parent = el.parentElement;
    // If parent is not available or has 0 width (hidden), skip
    if (!parent || parent.clientWidth === 0) return;

    // Force styles to allow accurate measurement of natural width
    // We override class styles that might constrain width or show ellipsis
    el.style.maxWidth = 'none';
    el.style.overflow = 'visible';
    el.style.textOverflow = 'clip';
    el.style.whiteSpace = 'nowrap';
    
    let size = 48; // default from css
    el.style.fontSize = `${size}px`;
    
    // Let's use a safe margin.
    const maxWidth = parent.clientWidth - 10; 

    while (el.scrollWidth > maxWidth && size > 16) {
      size -= 2;
      el.style.fontSize = `${size}px`;
    }
    
    // If still overflowing, allow wrap
    if (el.scrollWidth > maxWidth) {
       el.style.whiteSpace = 'normal';
       el.style.wordBreak = 'break-word';
       el.style.maxWidth = '100%';
    } else {
       // Fits! Ensure no ellipsis by keeping overflow visible, but constrain width just in case.
       el.style.maxWidth = '100%';
    }
  }, [text]);

  useEffect(() => {
    adjustSize();
  }, [adjustSize]);

  useEffect(() => {
    const handleResize = () => adjustSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustSize]);

  return <span ref={ref} className={className} style={style}>{text}</span>;
};

export default function StudyClient({ 
  words, 
  storageKey = DEFAULT_STORAGE_KEY,
  pageTitle = DEFAULT_PAGE_TITLE,
  backLink = DEFAULT_BACK_LINK,
  backLinkText = DEFAULT_BACK_LINK_TEXT
}: Props) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [rememberedSlugs, setRememberedSlugs] = useState<string[]>([]);
  const [forgottenSlugs, setForgottenSlugs] = useState<string[]>([]);
  const initializedRef = useRef(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [countdownKey, setCountdownKey] = useState(0);
  const countdownTimeoutsRef = useRef<number[]>([]);
  const [showHintButton, setShowHintButton] = useState(false);
  const [hintExample, setHintExample] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  const mediumWords = useMemo(() => words.filter(w => w.level === 'medium'), [words]);
  const importantWords = useMemo(() => words.filter(w => w.level === 'important'), [words]);

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
    setShowHintButton(false);
  }, []);

  const startCountdown = useCallback(() => {
    for (const id of countdownTimeoutsRef.current) {
      clearTimeout(id);
    }
    countdownTimeoutsRef.current = [];

    // Count down from 2
    setCountdownValue(2);
    setShowHintButton(false);
    setHintExample(null);
    setIsFlipped(false);
    setIsLoadingHint(false);
    setCountdownKey((k) => k + 1);

    const t1 = window.setTimeout(() => {
      setCountdownValue(1);
      setCountdownKey((k) => k + 1);
    }, 1000);
    const t0 = window.setTimeout(() => {
      setCountdownValue(0);
      setCountdownKey((k) => k + 1);
    }, 2000);
    const th = window.setTimeout(() => {
      setCountdownValue(null);
      setShowHintButton(true);
    }, 2060); // 2s + 60ms

    countdownTimeoutsRef.current = [t1, t0, th];
  }, []);

  const pickRandomWord = useCallback(() => {
    if (words.length === 0) return;

    if (typeof window !== 'undefined') {
      startCountdown();
    }

    let nextWord: Word;
    let safetyCounter = 0;
    
    // 現在の単語と同じ場合は再抽選する（リストが2つ以上ある場合のみ）
    do {
      let pool = words;
      // 重み付け: medium(80%), important(20%)
      if (mediumWords.length > 0 && importantWords.length > 0) {
        pool = Math.random() < 0.8 ? mediumWords : importantWords;
      }

      const randomIndex = Math.floor(Math.random() * pool.length);
      nextWord = pool[randomIndex];
      safetyCounter++;
    } while (
      words.length > 1 && 
      currentWord && 
      nextWord.slug === currentWord.slug && 
      safetyCounter < 10
    );

    setCurrentWord(nextWord);
  }, [startCountdown, words, currentWord, mediumWords, importantWords]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPageShow = (event: PageTransitionEvent) => {
      // 戻るボタンでの遷移時、もし既にヒントボタンが表示されている(showHintButton=true)か、
      // カードが裏返っている(isFlipped=true)場合は、状態をリセットしない。
      // これにより、BFCacheで復元された場合でもヒントボタンの状態を維持する。
      if (showHintButton || isFlipped) {
        return;
      }
      if (event.persisted || getNavigationType() === 'back_forward') {
        clearCountdown();
      }
    };

    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      // clearCountdown(); // コンポーネントのアンマウント時にクリアすると戻るボタンで戻った時に消えてしまうため削除
    };
  }, [clearCountdown, showHintButton, isFlipped]);

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
              setShowHintButton(true);
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

  const handleHint = async () => {
    if (!currentWord) return;
    
    setShowHintButton(false);
    setIsFlipped(true);
    setIsLoadingHint(true);
    
    try {
      const detail = await fetchWordDetail(currentWord.slug);
      if (detail && detail.toeicExamples && detail.toeicExamples.length > 0) {
        setHintExample(detail.toeicExamples[0].english);
      } else {
        setHintExample("No example available.");
      }
    } catch (e) {
      console.error(e);
      setHintExample("Failed to load example.");
    } finally {
      setIsLoadingHint(false);
    }
  };

  const renderExample = () => {
    if (!hintExample) return null;
    
    const renderContent = () => {
      if (!currentWord) return <p className={styles.exampleText}>{hintExample}</p>;

      const word = currentWord.term;
      // Split by the word (case insensitive)
      const parts = hintExample.split(new RegExp(`(${word})`, 'gi'));

      return (
        <p className={styles.exampleText}>
          <span className={styles.sampleLabel}>Sample:</span>
          {parts.map((part, i) => 
            part.toLowerCase() === word.toLowerCase() ? (
              <span key={i} className={styles.highlightedWord}>{part}</span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
          <button 
            className={styles.audioButton} 
            onClick={() => playAudio(hintExample)}
            aria-label="Play sample audio"
            style={{ marginLeft: '8px', verticalAlign: 'middle' }}
          >
            <span className={styles.audioIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
              </svg>
            </span>
          </button>
        </p>
      );
    };

    return (
      <div className={styles.exampleContainer}>
        {renderContent()}
      </div>
    );
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
          <div className={`${styles.wordCard} ${isFlipped ? styles.flipped : ''}`}>
            {!isFlipped ? (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <AutoResizingText text={currentWord.term} className={styles.wordText} />
              </div>
            ) : (
              <div className={styles.flippedContent}>
                <div className={styles.wordRow}>
                  <div style={{ minWidth: 0, display: 'flex', justifyContent: 'center' }}>
                    <AutoResizingText text={currentWord.term} className={styles.wordText} style={{ marginBottom: 0 }} />
                  </div>
                  <button 
                    className={styles.audioButton} 
                    onClick={() => playAudio(currentWord.term)}
                    aria-label="Play word audio"
                  >
                    <span className={styles.audioIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                      </svg>
                    </span>
                  </button>
                </div>
                {isLoadingHint ? (
                  <div className={styles.exampleContainer}>
                    <div className={`${styles.skeleton} ${styles.skeletonText}`} />
                    <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonTextShort}`} />
                  </div>
                ) : (
                  renderExample()
                )}
              </div>
            )}
          </div>
          {countdownValue !== null && (
            <div className={styles.countdownOverlay} aria-hidden="true">
              <div key={countdownKey} className={styles.countdownBubble}>
                {countdownValue}
              </div>
            </div>
          )}
          {showHintButton && !isFlipped && (
            <div className={styles.hintOverlay}>
              <button onClick={handleHint} className={styles.hintButton}>
                ヒント
              </button>
            </div>
          )}
          {isFlipped && (
            <div className={styles.favoriteOverlay}>
              <button
                onClick={() => currentWord && toggleFavorite(currentWord.slug)}
                className={styles.favoriteButton}
                aria-label={
                  currentWord && isFavorite(currentWord.slug)
                    ? 'お気に入りから削除'
                    : 'お気に入りに追加'
                }
              >
                <Star
                  size={24}
                  fill={
                    currentWord && isFavorite(currentWord.slug)
                      ? '#FFC107'
                      : 'none'
                  }
                  color={
                    currentWord && isFavorite(currentWord.slug)
                      ? '#FFC107'
                      : '#94a3b8'
                  }
                  strokeWidth={2}
                />
              </button>
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
