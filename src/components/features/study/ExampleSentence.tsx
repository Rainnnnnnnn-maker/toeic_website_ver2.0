'use client';

import { Loader2, Volume2 } from 'lucide-react';
import { splitSentenceByTerm } from '@/lib/study-utils';

type Props = {
  sentence: string;
  term: string;
  slug: string;
  /** 答え側では和訳も添える。ヒント側では渡さない */
  translation?: string;
  sentenceAudioLoading: string | null;
  onPlaySentenceAudio: (text: string, id: string, language: string, wordSlug?: string) => void;
};

/** 例文の読み上げ・エラー表示で共有する音声 ID */
export function getExampleAudioId(slug: string): string {
  return `example-${slug}`;
}

// 学習カードの例文。対象単語（活用形を含む）をハイライトし、読み上げボタンを添える。
export default function ExampleSentence({ sentence, term, slug, translation, sentenceAudioLoading, onPlaySentenceAudio }: Props) {
  const audioId = getExampleAudioId(slug);
  const isLoading = sentenceAudioLoading === audioId;
  const parts = splitSentenceByTerm(sentence, term);

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-4 text-left">
      <div className="flex w-full items-start gap-3">
        <p className="min-w-0 flex-1 break-words text-base font-medium leading-relaxed text-slate-900 sm:text-lg">
          {parts.map((part, i) =>
            part.isMatch ? (
              <mark key={i} className="rounded-sm bg-amber-100 px-0.5 font-bold text-slate-900">{part.text}</mark>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )}
        </p>
        <button
          type="button"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 transition-colors hover:bg-blue-50 active:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-default"
          onClick={() => onPlaySentenceAudio(sentence, audioId, 'en', slug)}
          disabled={isLoading}
          aria-label="例文を再生"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Volume2 size={20} />
          )}
        </button>
      </div>
      {translation && (
        <p className="text-sm leading-relaxed text-slate-600">{translation}</p>
      )}
    </div>
  );
}
