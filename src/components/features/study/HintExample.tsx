'use client';

import { Loader2, Volume2 } from 'lucide-react';
import { splitSentenceByTerm } from '@/lib/study-utils';

type Props = {
  sentence: string;
  term: string;
  slug: string;
  sentenceAudioLoading: string | null;
  onPlaySentenceAudio: (text: string, id: string, language: string, wordSlug?: string) => void;
};

// ヒント例文。対象単語（活用形を含む）をハイライトし、読み上げボタンを添える。
export default function HintExample({ sentence, term, slug, sentenceAudioLoading, onPlaySentenceAudio }: Props) {
  const audioId = `hint-example-${slug}`;
  const isLoading = sentenceAudioLoading === audioId;
  const parts = splitSentenceByTerm(sentence, term);

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <div className="text-xl text-gray-700 text-center leading-[1.6] font-medium max-w-[90%]">
        <span className="text-emerald-600 font-extrabold text-[1.1em] mr-2">Sample:</span>
        {parts.map((part, i) =>
          part.isMatch ? (
            <span key={i} className="text-gray-900 font-extrabold underline decoration-amber-300 decoration-[3px] bg-amber-200/30 px-[2px] rounded-[2px]">{part.text}</span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
        <button
          type="button"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 align-middle transition-colors hover:bg-blue-100 active:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-default ml-2"
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
    </div>
  );
}
