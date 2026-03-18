'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Volume2, Loader2, ChevronLeft } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import type { Word } from '@/data/words';
import { fetchWordDetail } from '@/actions/word';
import { useTTS } from '@/hooks/useTTS';

type Props = {
  words: Word[];
  storageKey?: string;
  pageTitle?: string;
  backLink?: string;
  backLinkText?: string;
  order?: 'random' | 'sequential';
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
const DEFAULT_BACK_LINK_TEXT = '単語一覧';

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

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
  }, []);

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
  backLinkText = DEFAULT_BACK_LINK_TEXT,
  order = 'random'
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

  const {
    audioLoading,
    sentenceAudioLoading,
    handlePlayAudio,
    handlePlaySentenceAudio
  } = useTTS();

  const mediumWords = useMemo(() => words.filter(w => w.level === 'medium'), [words]);
  const importantWords = useMemo(() => words.filter(w => w.level === 'important'), [words]);
  const highWords = useMemo(() => words.filter(w => w.level === 'high'), [words]);

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

    if (order === 'sequential') {
      if (!currentWord) {
        nextWord = words[0];
      } else {
        const currentIndex = words.findIndex(w => w.slug === currentWord.slug);
        const nextIndex = (currentIndex + 1) % words.length;
        nextWord = words[nextIndex];
      }
    } else {
      let safetyCounter = 0;
      
      // 現在の単語と同じ場合は再抽選する（リストが2つ以上ある場合のみ）
      do {
        let pool = words;

        // highWordsがある場合の重み付け
        if (highWords.length > 0) {
          // high: 30%, medium: 60%, important: 10%
          const r = Math.random();
          if (r < 0.3) {
            pool = highWords;
          } else if (r < 0.9) {
            pool = mediumWords;
          } else {
            pool = importantWords;
          }
        } else if (mediumWords.length > 0 && importantWords.length > 0) {
          // 重み付け: medium(80%), important(20%)
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
    }

    setCurrentWord(nextWord);
  }, [startCountdown, words, currentWord, mediumWords, importantWords, highWords, order]);

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
    const query = backLink === '/favorites' ? '?from=favorites' : '';
    router.push(`/words/${currentWord.slug}${query}`);
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
      if (!currentWord) return <p className="text-xl text-gray-700 text-center leading-[1.6] font-medium max-w-[90%]">{hintExample}</p>;

      const word = currentWord.term;
      const escapedWord = escapeRegExp(word);
      const parts = hintExample.split(new RegExp(`(\\b${escapedWord}\\w*)`, 'gi'));

      return (
        <div className="text-xl text-gray-700 text-center leading-[1.6] font-medium max-w-[90%]">
          <span className="text-emerald-600 font-extrabold text-[1.1em] mr-2">Sample:</span>
          {parts.map((part, i) => {
            const isMatch = new RegExp(`^${escapedWord}\\w*$`, 'i').test(part);
            return isMatch ? (
              <span key={i} className="text-gray-900 font-extrabold underline decoration-amber-300 decoration-[3px] bg-amber-200/30 px-[2px] rounded-[2px]">{part}</span>
            ) : (
              <span key={i}>{part}</span>
            );
          })}
          <button 
            className="inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer align-middle disabled:opacity-70 disabled:cursor-default ml-2 group" 
            onClick={() => handlePlaySentenceAudio(hintExample, `hint-example-${currentWord?.slug}`)}
            disabled={sentenceAudioLoading === `hint-example-${currentWord?.slug}`}
            aria-label="Play sample audio"
            style={{ marginLeft: '8px', verticalAlign: 'middle', display: 'inline-flex' }}
          >
            <span className="w-[26px] h-[26px] rounded-full inline-flex items-center justify-center bg-gray-100 text-[#5780d8] text-lg leading-none transition-all duration-160 group-hover:translate-y-[-1px] group-hover:shadow-md">
              {sentenceAudioLoading === `hint-example-${currentWord?.slug}` ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Volume2 size={14} />
              )}
            </span>
          </button>
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center gap-1 w-full">
        {renderContent()}
      </div>
    );
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f9fafb_45%,#ffffff_100%)]">
        <div className="w-full max-w-[600px] flex flex-col gap-8 items-center">
          <p className="text-sm leading-[1.6] text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f9fafb_45%,#ffffff_100%)] sm:py-12 sm:px-6">
      <main className="w-full max-w-[600px] flex flex-col gap-8 items-center">
        <header className="flex flex-col gap-3 text-center w-full items-center relative">
          <Link 
            href={backLink} 
            className="group absolute right-0 -top-4 inline-flex items-center justify-center gap-1.5 h-10 px-5 bg-white border border-gray-200 rounded-full text-slate-600 text-[15px] font-semibold no-underline transition-all duration-200 shadow-sm select-none z-10 hover:bg-gray-50 hover:border-gray-300 hover:text-slate-900 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-600" />
            {backLinkText}
          </Link>
          <h1 className="text-[28px] leading-[1.3] text-slate-900 font-bold mt-12 sm:text-[32px]">{pageTitle}</h1>
          <p className="text-sm leading-[1.6] text-gray-500">
            表示された単語を知っていますか？
          </p>
        </header>

        <section className="w-full perspective-[1000px] relative">
          <div className={`flex flex-col justify-center items-center px-6 py-12 rounded-3xl bg-white/95 border border-gray-200 shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition-all duration-300 min-h-[225px] ${isFlipped ? 'animate-flipIn' : ''}`}>
            {!isFlipped ? (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <AutoResizingText text={currentWord.term} className="text-5xl font-bold text-gray-900 text-center mb-3 whitespace-nowrap max-w-full overflow-hidden text-ellipsis" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full animate-flipIn">
                <div className="flex items-center justify-center gap-3 w-full max-w-full">
                  <div style={{ minWidth: 0, display: 'flex', justifyContent: 'center' }}>
                    <AutoResizingText text={currentWord.term} className="text-5xl font-bold text-gray-900 text-center mb-0 whitespace-nowrap max-w-full overflow-hidden text-ellipsis" style={{ marginBottom: 0 }} />
                  </div>
                  <button 
                    className="inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer disabled:opacity-70 disabled:cursor-default align-middle group" 
                    onClick={() => currentWord && handlePlayAudio(currentWord.term)}
                    disabled={audioLoading}
                    aria-label="Play word audio"
                  >
                    <span className="w-[26px] h-[26px] rounded-full inline-flex items-center justify-center bg-gray-100 text-[#5780d8] text-lg leading-none transition-all duration-160 group-hover:translate-y-[-1px] group-hover:shadow-md">
                      {audioLoading ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Volume2 size={14} />
                      )}
                    </span>
                  </button>
                </div>
                {isLoadingHint ? (
                  <div className="flex flex-col items-center gap-1 w-full">
                    <div className="h-5 w-[80%] mx-auto mb-2 bg-blue-100 rounded relative overflow-hidden after:content-[''] after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent" />
                    <div className="h-5 w-[60%] mx-auto mb-2 bg-blue-100 rounded relative overflow-hidden after:content-[''] after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent" />
                  </div>
                ) : (
                  renderExample()
                )}
              </div>
            )}
          </div>
          {countdownValue !== null && (
            <div className="absolute inset-0 flex items-start justify-end p-3.5 pointer-events-none sm:p-2.5" aria-hidden="true">
              <div key={countdownKey} className="inline-block text-[clamp(34px,9.5vw,46px)] font-extrabold text-red-500 drop-shadow-[0_10px_28px_rgba(15,23,42,0.18)] opacity-0 animate-countdownPop translate-y-1 scale-90">
                {countdownValue}
              </div>
            </div>
          )}
          {showHintButton && !isFlipped && (
            <div className="absolute inset-0 flex items-start justify-end p-3.5 pointer-events-none z-20 sm:p-2.5">
              <button onClick={handleHint} className="pointer-events-auto px-4 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 shadow-sm hover:bg-gray-200 hover:text-gray-800 hover:-translate-y-px">
                ヒント
              </button>
            </div>
          )}
          {isFlipped && (
            <div className="absolute inset-0 flex items-start justify-end p-3.5 pointer-events-none z-20 sm:p-2.5">
              <button
                onClick={() => currentWord && toggleFavorite(currentWord.slug)}
                className="pointer-events-auto inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white text-slate-500 cursor-pointer transition-all duration-200 shadow-sm shrink-0 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-px hover:shadow-md active:translate-y-0"
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

        <section className="flex gap-6 w-full justify-center mt-0">
          <button 
            className="flex flex-col items-center justify-center gap-2 w-[120px] h-[120px] rounded-full border-none cursor-pointer transition-all duration-200 shadow-sm bg-green-200 text-green-900 border-2 border-green-300 hover:bg-green-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            onClick={handleRemembered}
            aria-label="覚えている"
          >
            <span className="text-[32px] font-bold">💡</span>
            <span className="text-sm font-semibold">覚えている</span>
          </button>
          
          <button 
            className="flex flex-col items-center justify-center gap-2 w-[120px] h-[120px] rounded-full border-none cursor-pointer transition-all duration-200 shadow-sm bg-red-200 text-red-900 border-2 border-red-300 hover:bg-red-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            onClick={handleForgot}
            aria-label="覚えていない"
          >
            <span className="text-[32px] font-bold">❔</span>
            <span className="text-sm font-semibold">覚えていない</span>
          </button>
        </section>
      </main>
    </div>
  );
}
