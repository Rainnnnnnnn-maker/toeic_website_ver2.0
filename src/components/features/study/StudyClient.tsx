'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import type { Word } from '@/data/words';
import { useTTS } from '@/hooks/useTTS';
import { useStudyProgress, readPersistedState, clearPersistedState } from '@/hooks/useStudyProgress';
import { useStudyWordDetails } from '@/hooks/useStudyWordDetails';
import type { ReviewGrade, ReviewQueue } from '@/lib/review-schedule';
import {
  buildWordMap,
  getGradeAvailability,
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
  /** 「詳しい解説を見る」で単語詳細へ遷移する際の from パラメータ */
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
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const initializedRef = useRef(false);
  const cardRef = useRef<HTMLElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLElement>(null);
  const revealButtonRef = useRef<HTMLButtonElement>(null);

  const {
    audioError,
    retryAudio,
    audioLoading,
    sentenceAudioLoading,
    handlePlayAudio,
    handlePlaySentenceAudio
  } = useTTS(currentWord?.slug);

  const {
    laterSlugs,
    consecutiveRememberCount,
    markRemembered,
    markForgot,
    markLater,
    restoreProgress,
    resetProgress,
  } = useStudyProgress(storageKey, currentWord?.slug ?? null, isRevealed);

  const { detailBySlug, loadDetail } = useStudyWordDetails();
  const answerStatus = currentWord ? (detailBySlug[currentWord.slug]?.status ?? 'loading') : 'loading';
  const gradeAvailability = getGradeAvailability(answerStatus);

  /** 答えを開き、その内容を取得できた採点だけ受け付ける（ボタンの無効化と二重に守る） */
  const canGrade = (grade: ReviewGrade) => isRevealed && gradeAvailability[grade];

  const wordBySlug = buildWordMap(words);

  const laterWords = laterSlugs
    .map((slug) => wordBySlug.get(slug))
    .filter((word): word is Word => Boolean(word));

  /**
   * 単語をカードに表示する。答えとヒントは閉じた状態から始め、
   * 「答えを見る」で待たせないよう詳細を先に取得しておく。
   */
  const showWord = (word: Word, revealed = false) => {
    setCurrentWord(word);
    setIsRevealed(revealed);
    setIsHintVisible(false);
    void loadDetail(word.slug);
  };

  /** 次の単語を選んで表示する（random は難易度調整付き） */
  const advanceToNextWord = (overrideCount?: number) => {
    if (words.length === 0) return;
    const count = overrideCount ?? consecutiveRememberCount;
    const next =
      order === 'sequential'
        ? pickSequentialStudyWord(words, currentWord?.slug ?? null)
        : pickRandomStudyWord(splitWordsByLevel(words), currentWord?.slug ?? null, count);
    if (!next) return;
    showWord(next);
    // 採点ボタンは表面に戻ると消えるため、キーボード操作を「答えを見る」から続けられるようにする
    window.requestAnimationFrame(() => revealButtonRef.current?.focus({ preventScroll: true }));
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
          restoreProgress(persisted);
          setCurrentWord(word);
          // 「詳しい解説を見る」から戻った場合は、開いていた答えから採点を続けられる
          setIsRevealed(persisted.revealed === true);
          void loadDetail(word.slug);
          return;
        }
      }

      if (words.length === 0) return;
      const first =
        order === 'sequential'
          ? pickSequentialStudyWord(words, null)
          : pickRandomStudyWord(splitWordsByLevel(words), null, 0);
      if (first) {
        setCurrentWord(first);
        void loadDetail(first.slug);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [words, order, storageKey, wordBySlug, restoreProgress, resetProgress, loadDetail]);

  const handleReveal = () => {
    if (!currentWord) return;
    setIsRevealed(true);
    void loadDetail(currentWord.slug);
    window.requestAnimationFrame(() => {
      // 答えを読み上げ環境へ伝え、伸びたカードの下にある採点ボタンを画面内へ寄せる
      answerRef.current?.focus({ preventScroll: true });
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      actionsRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    });
  };

  const handleToggleHint = () => {
    if (!currentWord) return;
    setIsHintVisible((visible) => !visible);
    void loadDetail(currentWord.slug);
  };

  const handleRetryDetail = () => {
    if (!currentWord) return;
    void loadDetail(currentWord.slug);
  };

  const handleRemembered = () => {
    if (!currentWord || !canGrade('remembered')) return;
    onGrade?.(currentWord.slug, 'remembered');
    const newCount = markRemembered(currentWord.slug);
    advanceToNextWord(newCount);
  };

  // 答えはカード上で確認済みなので、単語詳細へは移動せず次の単語へ進む
  const handleForgot = () => {
    if (!currentWord || !canGrade('forgot')) return;
    onGrade?.(currentWord.slug, 'forgot');
    markForgot(currentWord.slug);
    advanceToNextWord(0);
  };

  const handleLater = () => {
    if (!currentWord || !canGrade('later')) return;
    onGrade?.(currentWord.slug, 'later');
    markLater(currentWord.slug);
    advanceToNextWord();
  };

  const handleSelectLaterWord = (word: Word) => {
    showWord(word);
    // モバイル（lg未満）ではサイドバーがカードの下に表示されるため、
    // 選択した単語が反映されたカードを画面内へスクロールする
    if (window.innerWidth < 1024) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const fromParam = wordDetailFrom ?? (backLink === '/favorites' ? 'review' : 'study');
  const detailParams = new URLSearchParams({ from: fromParam });
  if (fromParam === 'review' && reviewQueue) {
    detailParams.set('queue', reviewQueue);
  }
  const detailHref = `/words/${currentWord.slug}?${detailParams.toString()}`;

  return (
    <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6">
      <div
        className={`w-full items-start ${
          laterWords.length > 0
            ? 'grid max-w-[980px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,600px)_minmax(260px,320px)]'
            : 'max-w-[600px]'
        }`}
      >
        <main className="w-full max-w-[600px] flex flex-col gap-6 items-center lg:max-w-none">
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
            <p className="text-sm leading-[1.6] text-slate-600">
              {isRevealed
                ? '思い出せたかどうかを選んでください'
                : '意味を思い浮かべてから答えを確認しましょう'}
            </p>
          </header>

          <StudyCard
            cardRef={cardRef}
            answerRef={answerRef}
            word={currentWord}
            isRevealed={isRevealed}
            isHintVisible={isHintVisible}
            detailState={detailBySlug[currentWord.slug] ?? { status: 'loading' }}
            detailHref={detailHref}
            isFavorite={isFavorite(currentWord.slug)}
            audioLoading={audioLoading}
            sentenceAudioLoading={sentenceAudioLoading}
            onToggleHint={handleToggleHint}
            onRetryDetail={handleRetryDetail}
            onToggleFavorite={() => toggleFavorite(currentWord.slug)}
            onPlayWordAudio={() => handlePlayAudio(currentWord.term, undefined, "en", currentWord.slug)}
            onPlaySentenceAudio={handlePlaySentenceAudio}
            audioError={audioError}
            onRetryAudio={retryAudio}
          />

          <StudyActions
            actionsRef={actionsRef}
            revealButtonRef={revealButtonRef}
            isRevealed={isRevealed}
            answerStatus={answerStatus}
            onReveal={handleReveal}
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
