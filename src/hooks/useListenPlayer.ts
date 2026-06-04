"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Word } from "@/data/words";
import { fetchWordDetail } from "@/actions/word";
import { WordDetails } from "@/types/word";
import { useTTS } from "@/hooks/useTTS";
import { pickExample } from "@/lib/listen-utils";

// 後方互換のため re-export（既存の import 経路を維持）
export { pickExample };

// iOS Safari blocks audio.play() unless called within a user gesture call stack.
// We work around this by creating one persistent Audio element during the play
// button tap (which IS in the gesture stack) and reusing it for all subsequent
// programmatic plays.
const SILENT_AUDIO = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

export type PlayStep = "word" | "example_en" | "example_ja";

const NEXT_STEP: Record<PlayStep, PlayStep | null> = {
  word: "example_ja",
  example_ja: "example_en",
  example_en: null,
};

type UseListenPlayerArgs = {
  /** 再生対象の単語（表示順そのまま） */
  words: Word[];
  /** 履歴が無いときの「戻る」先 */
  backHref: string;
};

/**
 * 単語の発音→日本語例文→英語例文を順に自動再生する「聞き流し」プレイヤーの状態機械。
 * /today-words/listen と /favorites/listen で共有する。
 *
 * 注: useCallback / 呼び出し側の useMemo は React Compiler の最適化目的ではなく、
 * 再生用 useEffect の依存配列を安定させるために必須（識別子が毎レンダー変わると
 * 再生・プリフェッチの effect が再実行されてしまう）。
 */
export function useListenPlayer({ words, backHref }: UseListenPlayerArgs) {
  const router = useRouter();
  const { fetchTTS } = useTTS();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<PlayStep>("word");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordDetailsCache, setWordDetailsCache] = useState<Record<string, WordDetails>>({});

  const wordDetailsCacheRef = useRef<Record<string, WordDetails>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Persistent element created in the user-gesture handler; reused for all plays
  // so iOS Safari never sees play() outside a gesture context.
  const persistentAudioRef = useRef<HTMLAudioElement | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const stepRef = useRef<PlayStep>("word");

  const currentWord = words[currentIndex];
  const isCompleted = !isPlaying && currentIndex === words.length - 1 && currentStep === "example_en";

  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { stepRef.current = currentStep; }, [currentStep]);

  const getWordDetailData = useCallback(async (slug: string) => {
    if (wordDetailsCacheRef.current[slug]) return wordDetailsCacheRef.current[slug];
    const detail = await fetchWordDetail(slug);
    if (detail) {
      wordDetailsCacheRef.current[slug] = detail;
      setWordDetailsCache(prev => ({ ...prev, [slug]: detail }));
    }
    return detail;
  }, []);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
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
      clearAdvanceTimer();
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (persistentAudioRef.current) {
        persistentAudioRef.current.onended = null;
        persistentAudioRef.current.pause();
        persistentAudioRef.current = null;
      }
    };
  }, [clearAdvanceTimer]);

  // Prefetch detail for the current word and the next one so the example area
  // shows content before the user presses play, and step transitions don't stall.
  useEffect(() => {
    const targets = [words[currentIndex]?.slug, words[currentIndex + 1]?.slug].filter(
      (s): s is string => typeof s === "string" && !wordDetailsCacheRef.current[s]
    );
    if (targets.length === 0) return;

    let cancelled = false;
    void Promise.all(
      targets.map(async slug => {
        try {
          const detail = await fetchWordDetail(slug);
          if (cancelled || !detail) return;
          wordDetailsCacheRef.current[slug] = detail;
          setWordDetailsCache(prev => (prev[slug] ? prev : { ...prev, [slug]: detail }));
        } catch {
          // prefetch errors are non-fatal; the play loop will retry on demand
        }
      })
    );

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
          setIsLoading(false);
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
          setIsLoading(false);
          advance();
          return;
        }

        const audioUrl = await fetchTTS(textToPlay, language, detail.word);
        if (cancelled) return;

        // Reuse the persistent element that was created in the user-gesture handler.
        // Falling back to new Audio() on the rare case the persistent element is
        // not yet initialised (e.g. autoplay triggered programmatically in tests).
        const audio = persistentAudioRef.current ?? new Audio();
        if (!persistentAudioRef.current) persistentAudioRef.current = audio;
        audioRef.current = audio;
        audio.src = audioUrl;

        audio.onended = () => {
          if (cancelled || audioRef.current !== audio) return;
          if (stepRef.current !== stepAtStart || indexRef.current !== indexAtStart) return;
          // 単語やステップ間の間隔を少しあける（0.5秒）
          clearAdvanceTimer();
          advanceTimerRef.current = setTimeout(() => {
            advanceTimerRef.current = null;
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
      clearAdvanceTimer();
      stopAudio();
    };
  }, [isPlaying, currentIndex, currentStep, currentWord, fetchTTS, advance, stopAudio, getWordDetailData, clearAdvanceTimer]);

  const handleTogglePlay = useCallback(() => {
    setError(null);
    // iOS Safari: audio.play() is only allowed within a user-gesture call stack.
    // Create (or reuse) the persistent audio element here — synchronously, inside
    // the tap handler — so the element is already "unlocked" when the effect later
    // calls play() after async network operations.
    if (!persistentAudioRef.current) {
      const a = new Audio(SILENT_AUDIO);
      persistentAudioRef.current = a;
      void a.play().catch(() => {});
    }
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
      router.push(backHref);
    }
  }, [router, backHref]);

  const currentDetail = currentWord ? wordDetailsCache[currentWord.slug] : undefined;
  const { en: currentExampleEn, ja: currentExampleJa } = currentDetail
    ? pickExample(currentDetail)
    : { en: "", ja: "" };

  return {
    currentIndex,
    currentStep,
    isPlaying,
    isLoading,
    error,
    isCompleted,
    currentWord,
    currentDetail,
    currentExampleEn,
    currentExampleJa,
    wordsLength: words.length,
    handleTogglePlay,
    handlePrev,
    handleNext,
    handleBack,
  };
}
