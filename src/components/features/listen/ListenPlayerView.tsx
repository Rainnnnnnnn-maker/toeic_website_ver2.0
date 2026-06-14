"use client";

import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Loader2 } from "lucide-react";
import type { useListenPlayer } from "@/hooks/useListenPlayer";

type Props = {
  player: ReturnType<typeof useListenPlayer>;
  /** ヘッダーに表示するタイトル */
  title: string;
  /** 全単語の再生完了時に表示するメッセージ */
  completionMessage: string;
};

/**
 * 聞き流しプレイヤーの表示部分。状態は useListenPlayer から受け取る。
 * /today-words/listen と /favorites/listen で共有する。
 */
export default function ListenPlayerView({ player, title, completionMessage }: Props) {
  const {
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
    wordsLength,
    handleTogglePlay,
    handlePrev,
    handleNext,
    handleBack,
  } = player;

  if (!currentWord) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto w-full text-center py-20">
        <p className="text-slate-500">表示できる単語がありません。</p>
      </div>
    );
  }

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
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        <div className="w-9" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col items-center text-center gap-6">
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {currentIndex + 1} / {wordsLength}
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
            <div className="flex flex-col items-center justify-center h-full w-full gap-4 animate-pulse px-4">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-5 bg-slate-200 rounded w-full max-w-[90%]"></div>
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
            {completionMessage}
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
            disabled={currentIndex === wordsLength - 1}
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
