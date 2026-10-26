'use client';

import Link from 'next/link';
import { AudioErrorNotice } from "@/components/features/audio/AudioErrorNotice";
import { WORD_LEVEL_CARD_STYLES } from "@/components/features/words/wordLevelStyles";
import type { StudyDetailState } from "@/hooks/useStudyWordDetails";
import type { AudioError } from "@/hooks/useTTS";
import { ChevronRight, Lightbulb, Loader2, RefreshCw, Star, Volume2 } from 'lucide-react';
import type { Word } from '@/data/words';
import { pickExample } from '@/lib/listen-utils';
import { WORD_LEVEL_INFO } from '@/lib/word-level';
import AutoResizingText from './AutoResizingText';
import ExampleSentence, { getExampleAudioId } from './ExampleSentence';

type Props = {
  audioError: AudioError | null;
  onRetryAudio: () => void;
  cardRef: React.RefObject<HTMLElement | null>;
  answerRef: React.RefObject<HTMLDivElement | null>;
  word: Word;
  isRevealed: boolean;
  isHintVisible: boolean;
  detailState: StudyDetailState;
  detailHref: string;
  isFavorite: boolean;
  audioLoading: boolean;
  sentenceAudioLoading: string | null;
  onToggleHint: () => void;
  onRetryDetail: () => void;
  onToggleFavorite: () => void;
  onPlayWordAudio: () => void;
  onPlaySentenceAudio: (text: string, id: string, language: string, wordSlug?: string) => void;
};

// 学習カード本体。表面は単語と発音（任意で例文ヒント）、
// 「答えを見る」後は訳・例文・単語詳細へのリンクを表示する。
export default function StudyCard({
  audioError,
  onRetryAudio,
  cardRef,
  answerRef,
  word,
  isRevealed,
  isHintVisible,
  detailState,
  detailHref,
  isFavorite,
  audioLoading,
  sentenceAudioLoading,
  onToggleHint,
  onRetryDetail,
  onToggleFavorite,
  onPlayWordAudio,
  onPlaySentenceAudio,
}: Props) {
  const detail = detailState.status === 'ready' ? detailState.detail : null;
  const example = detail ? pickExample(detail) : null;
  const partsOfSpeech = detail
    ? Array.from(new Set(detail.meanings.map((meaning) => meaning.partOfSpeech).filter(Boolean)))
    : [];
  const exampleErrorNotice = (
    <AudioErrorNotice error={audioError} targets={[getExampleAudioId(word.slug)]} onRetry={onRetryAudio} />
  );

  return (
    <section
      ref={cardRef}
      aria-label="単語カード"
      className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_25px_rgba(15,23,42,0.08)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${WORD_LEVEL_CARD_STYLES[word.level].badgeClass}`}>
          {WORD_LEVEL_INFO[word.level].label}
        </span>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        >
          <Star
            size={22}
            fill={isFavorite ? '#F59E0B' : 'none'}
            color={isFavorite ? '#F59E0B' : 'currentColor'}
            strokeWidth={2}
          />
        </button>
      </div>

      {!isRevealed ? (
        <>
          <div className="flex min-h-[176px] flex-col items-center justify-center gap-3 py-4 text-center">
            <div className="flex w-full justify-center">
              <AutoResizingText text={word.term} className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-5xl font-bold text-slate-900" />
            </div>
            <WordAudioButton loading={audioLoading} onClick={onPlayWordAudio} />
            <AudioErrorNotice error={audioError} targets={[`word:${word.term}`]} onRetry={onRetryAudio} />
          </div>

          {isHintVisible && (
            <div id={`study-hint-${word.slug}`} className="flex flex-col gap-2">
              {detailState.status === 'loading' && <SentenceSkeleton />}
              {detailState.status === 'error' && <DetailError onRetry={onRetryDetail} />}
              {example && (example.en ? (
                <>
                  <ExampleSentence
                    sentence={example.en}
                    term={word.term}
                    slug={word.slug}
                    sentenceAudioLoading={sentenceAudioLoading}
                    onPlaySentenceAudio={onPlaySentenceAudio}
                  />
                  {exampleErrorNotice}
                </>
              ) : (
                <p className="text-center text-sm text-slate-600">この単語の例文はまだありません。</p>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onToggleHint}
            aria-expanded={isHintVisible}
            aria-controls={isHintVisible ? `study-hint-${word.slug}` : undefined}
            className="mx-auto mt-3 flex min-h-11 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Lightbulb size={16} aria-hidden />
            {isHintVisible ? '例文ヒントを隠す' : '例文ヒントを見る'}
          </button>
        </>
      ) : (
        <div
          ref={answerRef}
          tabIndex={-1}
          aria-label={`${word.term} の答え`}
          className="mt-4 flex flex-col gap-4 animate-flipIn focus:outline-hidden motion-reduce:animate-none"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <AutoResizingText
                text={word.term}
                maxSize={32}
                className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[32px] font-bold leading-tight text-slate-900"
              />
              {detail?.pronunciation && (
                <p className="mt-1 text-sm text-slate-600">{detail.pronunciation}</p>
              )}
            </div>
            <WordAudioButton loading={audioLoading} onClick={onPlayWordAudio} />
          </div>
          <AudioErrorNotice error={audioError} targets={[`word:${word.term}`]} onRetry={onRetryAudio} />
          <div className="h-px bg-slate-200" aria-hidden />

          {detailState.status === 'loading' && (
            <div className="flex flex-col gap-3" aria-busy="true" aria-label="答えを読み込み中">
              <div className="h-7 w-2/3 animate-pulse rounded-md bg-slate-100" />
              <SentenceSkeleton />
            </div>
          )}
          {detailState.status === 'error' && <DetailError onRetry={onRetryDetail} />}
          {detail && (
            <>
              <div className="flex flex-col gap-2">
                {partsOfSpeech.length > 0 && (
                  <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                    {partsOfSpeech.map((partOfSpeech) => (
                      <li key={partOfSpeech} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {partOfSpeech}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xl font-bold leading-relaxed text-slate-900">{detail.japaneseTranslation}</p>
              </div>
              {example?.en && (
                <div className="flex flex-col gap-2">
                  <ExampleSentence
                    sentence={example.en}
                    term={word.term}
                    slug={word.slug}
                    translation={example.ja}
                    sentenceAudioLoading={sentenceAudioLoading}
                    onPlaySentenceAudio={onPlaySentenceAudio}
                  />
                  {exampleErrorNotice}
                </div>
              )}
            </>
          )}

          <Link
            href={detailHref}
            prefetch={false}
            className="inline-flex min-h-11 items-center gap-1 self-start rounded-lg text-sm font-medium text-blue-700 no-underline transition-colors hover:text-blue-900 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            詳しい解説を見る
            <ChevronRight size={16} aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}

function WordAudioButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 active:bg-blue-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-default"
      onClick={onClick}
      disabled={loading}
      aria-label="発音を再生"
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
    </button>
  );
}

function SentenceSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4" aria-hidden>
      <div className="h-5 w-[85%] animate-pulse rounded-sm bg-slate-200" />
      <div className="h-5 w-[60%] animate-pulse rounded-sm bg-slate-200" />
    </div>
  );
}

function DetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <span>意味と例文を読み込めませんでした。</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 font-bold text-amber-900 transition-colors hover:bg-amber-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
      >
        <RefreshCw size={15} aria-hidden />
        再読み込み
      </button>
    </div>
  );
}
