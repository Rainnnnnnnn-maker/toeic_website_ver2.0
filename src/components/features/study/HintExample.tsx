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
          className="inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer align-middle disabled:opacity-70 disabled:cursor-default ml-2 group"
          onClick={() => onPlaySentenceAudio(sentence, audioId, 'en', slug)}
          disabled={isLoading}
          aria-label="Play sample audio"
          style={{ marginLeft: '8px', verticalAlign: 'middle', display: 'inline-flex' }}
        >
          <span className="w-[26px] h-[26px] rounded-full inline-flex items-center justify-center bg-gray-100 text-[#5780d8] text-lg leading-none transition-all duration-160 group-hover:translate-y-[-1px] group-hover:shadow-md">
            {isLoading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Volume2 size={14} />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
