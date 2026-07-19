'use client';

import { Star, Volume2, Loader2 } from 'lucide-react';
import type { Word } from '@/data/words';
import AutoResizingText from './AutoResizingText';
import HintExample from './HintExample';

type Props = {
  cardRef: React.RefObject<HTMLElement | null>;
  word: Word;
  isFlipped: boolean;
  isLoadingHint: boolean;
  hintExample: string | null;
  countdownValue: number | null;
  countdownKey: number;
  showHintButton: boolean;
  isFavorite: boolean;
  audioLoading: boolean;
  sentenceAudioLoading: string | null;
  onHint: () => void;
  onToggleFavorite: () => void;
  onPlayWordAudio: () => void;
  onPlaySentenceAudio: (text: string, id: string, language: string, wordSlug?: string) => void;
};

// 学習カード本体。表面は単語のみ、裏面（ヒント表示後）は単語 + 例文 + 音声ボタン。
// カウントダウン・ヒントボタン・お気に入りボタンをオーバーレイ表示する。
export default function StudyCard({
  cardRef,
  word,
  isFlipped,
  isLoadingHint,
  hintExample,
  countdownValue,
  countdownKey,
  showHintButton,
  isFavorite,
  audioLoading,
  sentenceAudioLoading,
  onHint,
  onToggleFavorite,
  onPlayWordAudio,
  onPlaySentenceAudio,
}: Props) {
  return (
    <section ref={cardRef} className="w-full perspective-[1000px] relative">
      <div className={`flex flex-col justify-center items-center px-6 py-12 rounded-3xl bg-white/95 border border-gray-200 shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition-all duration-300 min-h-[225px] ${isFlipped ? 'animate-flipIn' : ''}`}>
        {!isFlipped ? (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <AutoResizingText text={word.term} className="text-5xl font-bold text-gray-900 text-center mb-3 whitespace-nowrap max-w-full overflow-hidden text-ellipsis" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full animate-flipIn">
            <div className="flex items-center justify-center gap-3 w-full max-w-full">
              <div style={{ minWidth: 0, display: 'flex', justifyContent: 'center' }}>
                <AutoResizingText text={word.term} className="text-5xl font-bold text-gray-900 text-center mb-0 whitespace-nowrap max-w-full overflow-hidden text-ellipsis" style={{ marginBottom: 0 }} />
              </div>
              <button
                className="inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer disabled:opacity-70 disabled:cursor-default align-middle group"
                onClick={onPlayWordAudio}
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
              hintExample && (
                <HintExample
                  sentence={hintExample}
                  term={word.term}
                  slug={word.slug}
                  sentenceAudioLoading={sentenceAudioLoading}
                  onPlaySentenceAudio={onPlaySentenceAudio}
                />
              )
            )}
          </div>
        )}
      </div>
      {countdownValue !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30" aria-hidden="true">
          <div key={countdownKey} className={`inline-block text-[140px] leading-none font-black drop-shadow-lg animate-countdownCenter ${countdownValue === 2 ? 'text-amber-500/40' : 'text-red-500/40'}`}>
            {countdownValue}
          </div>
        </div>
      )}
      {showHintButton && !isFlipped && (
        <div className="absolute inset-0 flex items-start justify-end p-3.5 pointer-events-none z-20 sm:p-2.5">
          <button
            onClick={onHint}
            className="pointer-events-auto relative flex items-center justify-center px-5 py-2.5 bg-white text-slate-700 border-2 border-amber-300 rounded-full text-sm font-bold cursor-pointer transition-all duration-200 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:bg-amber-50 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-hintPop overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="animate-pulse text-base">💡</span> ヒントを見る
            </span>
            <div className="absolute inset-0 rounded-full bg-amber-200/30 animate-ping opacity-75"></div>
          </button>
        </div>
      )}
      {isFlipped && (
        <div className="absolute inset-0 flex items-start justify-end p-3.5 pointer-events-none z-20 sm:p-2.5">
          <button
            onClick={onToggleFavorite}
            className="pointer-events-auto inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white text-slate-500 cursor-pointer transition-all duration-200 shadow-sm shrink-0 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-px hover:shadow-md active:translate-y-0"
            aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            <Star
              size={24}
              fill={isFavorite ? '#FFC107' : 'none'}
              color={isFavorite ? '#FFC107' : '#94a3b8'}
              strokeWidth={2}
            />
          </button>
        </div>
      )}
    </section>
  );
}
