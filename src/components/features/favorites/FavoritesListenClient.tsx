"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Loader2 } from "lucide-react";
import { Word } from "@/data/words";
import { fetchWordDetail } from "@/actions/word";
import { WordDetails } from "@/types/word";
import { useTTS } from "@/hooks/useTTS";
import { useFavorites } from "@/context/FavoritesContext";

type Props = {
  allWords: Word[];
};

type PlayStep = "word" | "example_en" | "example_ja";

const NEXT_STEP: Record<PlayStep, PlayStep | null> = {
  word: "example_ja",
  example_ja: "example_en",
  example_en: null,
};

function pickExample(detail: WordDetails): { en: string; ja: string } {
  if (detail.toeicExamples && detail.toeicExamples.length > 0) {
    return { en: detail.toeicExamples[0].english, ja: detail.toeicExamples[0].japanese };
  }
  const fallback = detail.meanings[0]?.detailedMeanings[0];
  if (fallback) {
    return { en: fallback.example, ja: fallback.exampleJapanese };
  }
  return { en: "", ja: "" };
}

export default function FavoritesListenClient({ allWords }: Props) {
  const router = useRouter();
  const { fetchTTS } = useTTS();
  const { favorites } = useFavorites();

  const words = useMemo(() => {
    // favoritesは追加順のslug配列。これに沿ってallWordsから検索して並べる
    return favorites
      .map(slug => allWords.find(w => w.slug === slug))
      .filter((w): w is Word => w !== undefined);
  }, [favorites, allWords]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<PlayStep>("word");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordDetailsCache, setWordDetailsCache] = useState<Record<string, WordDetails>>({});

  const wordDetailsCacheRef = useRef<Record<string, WordDetails>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const stepRef = useRef<PlayStep>("word");
  const playingRef = useRef(false);

  const currentWord = words[currentIndex];
  const isCompleted = !isPlaying && currentIndex === words.length - 1 && currentStep === "example_en";

  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { stepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);

  const getWordDetailData = useCallback(async (slug: string) => {
    if (wordDetailsCacheRef.current[slug]) return wordDetailsCacheRef.current[slug];
    const detail = await fetchWordDetail(slug);
    if (detail) {
      wordDetailsCacheRef.current[slug] = detail;
      setWordDetailsCache(prev => ({ ...prev, [slug]: detail }));
    }
    return detail;
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Prefetch detail for the current word and the next one
  useEffect(() => {
    const targets = [words[currentIndex]?.slug, words[currentIndex + 1]?.slug].filter(
      (s): s is string => typeof s === "string" && !wordDetailsCacheRef.current[s]
    );
    if (targets.length === 0) return;

    let cancelled = false;
    void (async () => {
      for (const slug of targets) {
        try {
          const detail = await fetchWordDetail(slug);
          if (cancelled || !detail) continue;
          wordDetailsCacheRef.current[slug] = detail;
          setWordDetailsCache(prev => (prev[slug] ? prev : { ...prev, [slug]: detail }));
        } catch {
          // prefetch errors are non-fatal
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [words, currentIndex]);

  const advance = useCallback(() => {
    const next = NEXT_STEP[stepRef.current];
    if (next) {
      setCurrentStep(next);
      return;
    }
    if (indexRef.current < words.length - 1) {
      setCurrentIndex(i => i + 1);
      setCurrentStep("word");
    } else {
      setIsPlaying(false);
      setCurrentStep("example_en");
    }
  }, [words.length]);

  useEffect(() => {
    if (!isPlaying || !currentWord) {
      stopAudio();
      return;
    }

    let cancelled = false;
    const stepAtStart = currentStep;
    const indexAtStart = currentIndex;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      stopAudio();

      try {
        const detail = await getWordDetailData(currentWord.slug);
        if (cancelled) return;
        if (!detail) {
          advance();
          return;
        }

        const { en, ja } = pickExample(detail);

        let textToPlay = "";
        let language: "en" | "ja" = "en";
        if (stepAtStart === "word") {
          textToPlay = detail.word;
          language = "en";
        } else if (stepAtStart === "example_en") {
          textToPlay = en;
          language = "en";
        } else {
          textToPlay = ja;
          language = "ja";
        }

        if (!textToPlay) {
          advance();
          return;
        }

        const audioUrl = await fetchTTS(textToPlay, language, detail.word);
        if (cancelled) return;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          if (cancelled || audioRef.current !== audio) return;
          if (stepRef.current !== stepAtStart || indexRef.current !== indexAtStart) return;
          // 単語やステップ間の間隔を少しあける（0.5秒）
          setTimeout(() => {
            if (cancelled || stepRef.current !== stepAtStart || indexRef.current !== indexAtStart) return;
            advance();
          }, 500);
        };

        await audio.play();
        if (!cancelled) setIsLoading(false);
      } catch (e) {
        if (cancelled) return;
        setIsLoading(false);
        setIsPlaying(false);
        const message = e instanceof Error && e.message.includes("429")
          ? "リクエストが多すぎます。しばらくしてからもう一度お試しください。"
          : "音声の再生に失敗しました。時間をおいて再度お試しください。";
        setError(message);
        console.error("Audio playback failed", e);
      }
    };

    void run();

    return () => {
      cancelled = true;
      stopAudio();
    };
  }, [isPlaying, currentIndex, currentStep, currentWord, fetchTTS, advance, stopAudio, getWordDetailData]);

  const handleTogglePlay = useCallback(() => {
    setError(null);
    if (isCompleted) {
      setCurrentIndex(0);
      setCurrentStep("word");
      setIsPlaying(true);
      return;
    }
    setIsPlaying(p => !p);
  }, [isCompleted]);

  const handlePrev = useCallback(() => {
    setError(null);
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setCurrentStep("word");
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    setError(null);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(i => i + 1);
      setCurrentStep("word");
    } else {
      setIsPlaying(false);
      setCurrentStep("example_en");
    }
  }, [currentIndex, words.length]);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/favorites");
    }
  }, [router]);

  if (words.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto w-full text-center py-20">
        <p className="text-slate-500">お気に入りに登録された単語がありません。</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-blue-600 hover:underline"
        >
          単語一覧に戻る
        </button>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto w-full text-center py-20">
        <p className="text-slate-500">表示できる単語がありません。</p>
      </div>
    );
  }

  const currentDetail = wordDetailsCache[currentWord.slug];
  const { en: currentExampleEn, ja: currentExampleJa } = currentDetail
    ? pickExample(currentDetail)
    : { en: "", ja: "" };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">お気に入り単語 聞き流し</h1>
        <div className="w-9" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col items-center text-center gap-6">
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {currentIndex + 1} / {words.length}
        </div>

        <div className="flex flex-col gap-2 min-h-[100px] justify-center items-center w-full">
          <h2 className={`text-4xl font-bold tracking-tight transition-colors duration-300 ${currentStep === "word" && isPlaying ? "text-blue-600" : "text-slate-900"}`}>
            {currentWord.term}
          </h2>
          {currentDetail && (
             <p className="text-lg text-slate-600 font-medium mt-2">{currentDetail.japaneseTranslation}</p>
          )}
        </div>

        <div className="w-full bg-slate-50 rounded-lg p-4 border border-slate-100 min-h-[120px] flex flex-col justify-center gap-3">
          {currentDetail ? (
            <>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${currentStep === "example_ja" && isPlaying ? "text-blue-600" : "text-slate-600"}`}>
                {currentExampleJa}
              </p>
              <p className={`text-base font-medium leading-relaxed transition-colors duration-300 ${currentStep === "example_en" && isPlaying ? "text-blue-600" : "text-slate-800"}`}>
                {currentExampleEn}
              </p>
            </>
          ) : (
             <div className="flex items-center justify-center h-full">
               <Loader2 className="animate-spin text-slate-400" size={24} />
             </div>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 w-full">
            {error}
          </p>
        )}

        {isCompleted && !error && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 w-full">
            すべての単語の再生が完了しました。再生ボタンでもう一度聞けます。
          </p>
        )}

        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="前の単語"
          >
            <SkipBack size={24} />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95"
            aria-label={isPlaying ? "一時停止" : "再生"}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={28} />
            ) : isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
            className="p-3 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="次の単語"
          >
            <SkipForward size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
