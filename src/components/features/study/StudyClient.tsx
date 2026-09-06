'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import type { Word } from '@/data/words';
import { fetchWordDetail } from '@/actions/word';
import { useTTS } from '@/hooks/useTTS';
import { useStudyCountdown } from '@/hooks/useStudyCountdown';
import { useStudyProgress, readPersistedState, clearPersistedState } from '@/hooks/useStudyProgress';
import type { ReviewGrade, ReviewQueue } from '@/lib/review-schedule';
import {
  buildWordMap,
  getNavigationType,
  splitWordsByLevel,
  pickRandomStudyWord,
  pickSequentialStudyWord,
} from '@/lib/study-utils';
import StudyCard from './StudyCard';
import StudyActions from './StudyActions';
import LaterWordsSidebar from './LaterWordsSidebar';

type Props = {
  words: Word[];
  storageKey?: string;
  pageTitle?: string;
  backLink?: string;
  backLinkText?: string;
  order?: 'random' | 'sequential';
  /**
   * 採点結果の記録先。復習モード（ログイン中）からのみ渡される。
   * 学習モードでは undefined なので、既存の挙動は変わらない。
   */
  onGrade?: (slug: string, grade: ReviewGrade) => void;
  /** 「覚えていない」で単語詳細へ遷移する際の from パラメータ */
  wordDetailFrom?: 'review' | 'study';
  /** 復習詳細から戻る際に復元するキュー */
  reviewQueue?: ReviewQueue;
  sessionProgress?: { total: number; remaining: number };
};

const DEFAULT_STORAGE_KEY = 'toeic-study-state-v1';
const DEFAULT_PAGE_TITLE = '英単語学習';
const DEFAULT_BACK_LINK = '/';
const DEFAULT_BACK_LINK_TEXT = '単語一覧';

export default function StudyClient({
  words,
  storageKey = DEFAULT_STORAGE_KEY,
  pageTitle = DEFAULT_PAGE_TITLE,
  backLink = DEFAULT_BACK_LINK,
  backLinkText = DEFAULT_BACK_LINK_TEXT,
  order = 'random',
  onGrade,
  wordDetailFrom,
  reviewQueue,
  sessionProgress,
}: Props) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [hintExample, setHintExample] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const initializedRef = useRef(false);
  const cardRef = useRef<HTMLElement>(null);

  const {
    audioLoading,
    sentenceAudioLoading,
    handlePlayAudio,
    handlePlaySentenceAudio
  } = useTTS();

  const {
    countdownValue,
    countdownKey,
    showHintButton,
    setShowHintButton,
    startCountdown,
  } = useStudyCountdown(isFlipped);

  const {
    laterSlugs,
    consecutiveRememberCount,
    markRemembered,
    markForgot,
    markLater,
    restoreProgress,
    resetProgress,
  } = useStudyProgress(storageKey, currentWord?.slug ?? null);

  const wordBySlug = buildWordMap(words);

  const laterWords = laterSlugs
    .map((slug) => wordBySlug.get(slug))
    .filter((word): word is Word => Boolean(word));

  /** カウントダウンを開始し、ヒント関連の状態をリセットする */
  const startCardCountdown = () => {
    startCountdown();
    setHintExample(null);
    setIsFlipped(false);
    setIsLoadingHint(false);
  };

  /** 次の単語を選んで表示する（random は難易度調整付き） */
  const advanceToNextWord = (overrideCount?: number) => {
    if (words.length === 0) return;
    startCardCountdown();
    const count = overrideCount ?? consecutiveRememberCount;
    const next =
      order === 'sequential'
        ? pickSequentialStudyWord(words, currentWord?.slug ?? null)
        : pickRandomStudyWord(splitWordsByLevel(words), currentWord?.slug ?? null, count);
    if (next) setCurrentWord(next);
  };

  // 初回マウント時: リロードなら状態を破棄し、それ以外は sessionStorage からの復元を試みる
  useEffect(() => {
    if (initializedRef.current) return;
    const timer = window.setTimeout(() => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      if (getNavigationType() === 'reload') {
        clearPersistedState(storageKey);
        resetProgress();
      } else {
        const persisted = readPersistedState(storageKey);
        const word = persisted ? wordBySlug.get(persisted.currentSlug) : undefined;
        if (persisted && word) {
          setCurrentWord(word);
          restoreProgress(persisted);
          setShowHintButton(true);
          return;
        }
      }

      if (words.length === 0) return;
      startCountdown();
      const first =
        order === 'sequential'
          ? pickSequentialStudyWord(words, null)
          : pickRandomStudyWord(splitWordsByLevel(words), null, 0);
      if (first) setCurrentWord(first);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [words, order, storageKey, wordBySlug, restoreProgress, resetProgress, setShowHintButton, startCountdown]);

  const handleRemembered = () => {
    if (!currentWord) return;
    onGrade?.(currentWord.slug, 'remembered');
    const newCount = markRemembered(currentWord.slug);
    advanceToNextWord(newCount);
  };

  const handleForgot = () => {
    if (!currentWord) return;
    // 直後の router.push でアンマウントされるため、記録は同期的に呼び出す
    onGrade?.(currentWord.slug, 'forgot');
    const resumeWord =
      wordDetailFrom === 'review'
        ? pickSequentialStudyWord(words, currentWord.slug)
        : currentWord;
    markForgot(currentWord.slug, resumeWord?.slug ?? currentWord.slug);
    if (wordDetailFrom === 'review' && resumeWord) {
      // Next Router が戻り先の画面状態を保持しても、同じ単語を再表示しない。
      // ヒント（例文）とカウントダウンも next カードの初期状態へ戻す。
      // これがないと、戻ったときに次の単語へ前の単語の例文が残って見える。
      setCurrentWord(resumeWord);
      startCardCountdown();
    }
    const fromParam =
      wordDetailFrom ?? (backLink === '/favorites' ? 'review' : 'study');
    const params = new URLSearchParams({ from: fromParam });
    if (fromParam === 'review' && reviewQueue) {
      params.set('queue', reviewQueue);
    }
    router.push(`/words/${currentWord.slug}?${params.toString()}`);
  };

  const handleLater = () => {
    if (!currentWord) return;
    onGrade?.(currentWord.slug, 'later');
    markLater(currentWord.slug);
    advanceToNextWord();
  };

  const handleSelectLaterWord = (word: Word) => {
    setCurrentWord(word);
    startCardCountdown();
    // モバイル（lg未満）ではサイドバーがカードの下に表示されるため、
    // 選択した単語が反映されたカードを画面内へスクロールする
    if (window.innerWidth < 1024) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
        setHintExample('No example available.');
      }
    } catch (e) {
      console.error(e);
      setHintExample('Failed to load example.');
    } finally {
      setIsLoadingHint(false);
    }
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)]">
        <div className="w-full max-w-[600px] flex flex-col gap-8 items-center">
          <p className="text-sm leading-[1.6] text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6">
      <div
        className={`w-full items-start ${
          laterWords.length > 0
            ? 'grid max-w-[980px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,600px)_minmax(260px,320px)]'
            : 'max-w-[600px]'
        }`}
      >
        <main className="w-full max-w-[600px] flex flex-col gap-8 items-center lg:max-w-none">
          <header className="flex flex-col gap-3 text-center w-full items-center relative">
            <Link
              href={backLink}
              prefetch={false}
              className="group absolute right-0 -top-4 inline-flex items-center justify-center gap-1.5 h-10 px-5 bg-white border border-gray-200 rounded-full text-slate-600 text-[15px] font-semibold no-underline transition-all duration-200 shadow-sm select-none z-10 hover:bg-gray-50 hover:border-gray-300 hover:text-slate-900 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm"
            >
              <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-600" />
              {backLinkText}
            </Link>
            <h1 className="text-[28px] leading-[1.3] text-slate-900 font-bold mt-12 sm:text-[32px]">{pageTitle}</h1>
            {sessionProgress && (
              <div className="w-full max-w-xs text-sm text-slate-600" role="status">
                <p>今回の復習：{sessionProgress.total - sessionProgress.remaining} / {sessionProgress.total} 語完了・残り {sessionProgress.remaining} 語</p>
                <progress aria-label="今回の復習の進捗" className="mt-2 h-2 w-full accent-emerald-600" max={sessionProgress.total} value={sessionProgress.total - sessionProgress.remaining} />
              </div>
            )}
            <p className="text-sm leading-[1.6] text-gray-500">
              表示された単語を知っていますか？
            </p>
          </header>

          <StudyCard
            cardRef={cardRef}
            word={currentWord}
            isFlipped={isFlipped}
            isLoadingHint={isLoadingHint}
            hintExample={hintExample}
            countdownValue={countdownValue}
            countdownKey={countdownKey}
            showHintButton={showHintButton}
            isFavorite={isFavorite(currentWord.slug)}
            audioLoading={audioLoading}
            sentenceAudioLoading={sentenceAudioLoading}
            onHint={handleHint}
            onToggleFavorite={() => toggleFavorite(currentWord.slug)}
            onPlayWordAudio={() => handlePlayAudio(currentWord.term)}
            onPlaySentenceAudio={handlePlaySentenceAudio}
          />

          <StudyActions
            onRemembered={handleRemembered}
            onForgot={handleForgot}
            onLater={handleLater}
            showDifficultyTip={order !== 'sequential'}
            consecutiveRememberCount={consecutiveRememberCount}
          />
        </main>

        {laterWords.length > 0 && (
          <LaterWordsSidebar
            words={laterWords}
            currentSlug={currentWord.slug}
            onSelect={handleSelectLaterWord}
          />
        )}
      </div>
    </div>
  );
}
