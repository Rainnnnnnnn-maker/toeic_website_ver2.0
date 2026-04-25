"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Loader2 } from "lucide-react";
import { Word } from "@/data/words";
import { fetchWordDetail } from "@/actions/word";
import { WordDetails } from "@/types/word";
import { useTTS } from "@/hooks/useTTS";

type Props = {
  allWords: Word[];
};

type PlayStep = "word" | "example_en" | "example_ja";

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export default function TodayWordsListenClient({ allWords }: Props) {
  const { fetchTTS } = useTTS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<PlayStep>("word");
  const [wordDetailsCache, setWordDetailsCache] = useState<Record<string, WordDetails>>({});
  const wordDetailsCacheRef = useRef<Record<string, WordDetails>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const todayWords = useMemo(() => {
    if (allWords.length === 0) return [];
    const todayKey = new Date().toISOString().slice(0, 10);
    const ordered = [...allWords].sort((a, b) => {
      const aHash = hashString(`${todayKey}:${a.slug}`);
      const bHash = hashString(`${todayKey}:${b.slug}`);
      if (aHash === bHash) return a.slug.localeCompare(b.slug);
      return aHash - bHash;
    });
    return ordered.slice(0, Math.min(5, ordered.length));
  }, [allWords]);

  const currentWord = todayWords[currentIndex];

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
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const playNext = useCallback(() => {
    if (currentIndex < todayWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentStep("word");
    } else {
      setIsPlaying(false);
      setCurrentIndex(0);
      setCurrentStep("word");
    }
  }, [currentIndex, todayWords.length]);

  const playPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentStep("word");
    }
  }, [currentIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const playAudioSequence = async () => {
      if (!isPlaying || !currentWord) return;

      setIsLoading(true);
      stopAudio();

      try {
        const detail = await getWordDetailData(currentWord.slug);
        if (isCancelled) return;
        if (!detail) {
          setIsLoading(false);
          playNext();
          return;
        }

        let exampleEn = "";
        let exampleJa = "";

        if (detail.toeicExamples && detail.toeicExamples.length > 0) {
          exampleEn = detail.toeicExamples[0].english;
          exampleJa = detail.toeicExamples[0].japanese;
        } else if (detail.meanings[0]?.detailedMeanings[0]) {
          exampleEn = detail.meanings[0].detailedMeanings[0].example;
          exampleJa = detail.meanings[0].detailedMeanings[0].exampleJapanese;
        }

        let textToPlay = "";
        let language = "en";

        if (currentStep === "word") {
          textToPlay = detail.word;
          language = "en";
        } else if (currentStep === "example_en") {
          textToPlay = exampleEn;
          language = "en";
        } else if (currentStep === "example_ja") {
          textToPlay = exampleJa;
          language = "ja";
        }

        if (!textToPlay) {
          // Skip this step if text is missing
          if (currentStep === "word") setCurrentStep("example_en");
          else if (currentStep === "example_en") setCurrentStep("example_ja");
          else playNext();
          return;
        }

        const audioUrl = await fetchTTS(textToPlay, language, detail.word);
        if (isCancelled) return;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          if (isCancelled) return;
          if (currentStep === "word") {
            setCurrentStep("example_en");
          } else if (currentStep === "example_en") {
            setCurrentStep("example_ja");
          } else {
            playNext();
          }
        };

        await audio.play();
        if (!isCancelled) {
          setIsLoading(false);
        }

      } catch (error) {
        if (!isCancelled) {
          console.error("Audio playback failed", error);
          setIsLoading(false);
          setIsPlaying(false);
        }
      }
    };

    if (isPlaying) {
      playAudioSequence();
    } else {
      stopAudio();
    }
    
    return () => {
      isCancelled = true;
      stopAudio();
    };
  }, [isPlaying, currentIndex, currentStep, currentWord, fetchTTS, playNext, stopAudio, getWordDetailData]);

  if (!currentWord) return null;

  const currentDetail = wordDetailsCache[currentWord.slug];
  
  let currentExampleEn = "";
  let currentExampleJa = "";
  
  if (currentDetail) {
    if (currentDetail.toeicExamples && currentDetail.toeicExamples.length > 0) {
      currentExampleEn = currentDetail.toeicExamples[0].english;
      currentExampleJa = currentDetail.toeicExamples[0].japanese;
    } else if (currentDetail.meanings[0]?.detailedMeanings[0]) {
      currentExampleEn = currentDetail.meanings[0].detailedMeanings[0].example;
      currentExampleJa = currentDetail.meanings[0].detailedMeanings[0].exampleJapanese;
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <Link 
          href="/"
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">今日の単語 聞き流し</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col items-center text-center gap-6">
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {currentIndex + 1} / {todayWords.length}
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
              <p className={`text-base font-medium leading-relaxed transition-colors duration-300 ${currentStep === "example_en" && isPlaying ? "text-blue-600" : "text-slate-800"}`}>
                {currentExampleEn}
              </p>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${currentStep === "example_ja" && isPlaying ? "text-blue-600" : "text-slate-600"}`}>
                {currentExampleJa}
              </p>
            </>
          ) : (
             <div className="flex items-center justify-center h-full">
               <Loader2 className="animate-spin text-slate-400" size={24} />
             </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            onClick={playPrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="前の単語"
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-70"
            disabled={isLoading && !isPlaying}
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
            onClick={playNext}
            disabled={currentIndex === todayWords.length - 1 && !isPlaying}
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
