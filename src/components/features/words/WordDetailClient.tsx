"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { Star, Volume2, Loader2, ArrowUpRight } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import type { WordDetails } from "@/types/word";
import type { Word } from "@/data/words";
import { SnsShareButtons } from "@/components/features/sns/SnsShareButtons";
import { useTTS } from "@/hooks/useTTS";
import { useShareTarget } from "@/context/ShareTargetContext";

type Props = {
  initialData: WordDetails;
  linkedWords?: Record<string, string>;
  relatedWords?: Word[];
};

export function WordDetailClient({ initialData, linkedWords = {}, relatedWords = [] }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    audioLoading,
    sentenceAudioLoading,
    handlePlayAudio,
    handlePlaySentenceAudio
  } = useTTS();
  const { shareTarget } = useShareTarget();

  const data = initialData;

  return (
    <>
      {shareTarget &&
        createPortal(
          <SnsShareButtons
            url={`https://www.toeic-words.com/words/${data.word}`}
            title={`${data.word}の意味「${data.japaneseTranslation}」 | TOEIC重要単語`}
          />,
          shareTarget
        )}
      <div className="mt-0 p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative flex flex-col gap-3 sm:p-5">
        <div className="flex justify-between gap-3 items-end border-b border-gray-100 pb-3">
          <div>
            <h1 className="text-2xl text-slate-900 font-bold tracking-tight sm:text-3xl">{data.word}</h1>
            {data.pronunciation && (
              <div className="mt-1.5 inline-flex items-center gap-2">
                <span className="text-sm text-gray-600 font-mono bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">{data.pronunciation}</span>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  onClick={() => handlePlayAudio(data.word)}
                  disabled={audioLoading}
                  aria-label="発音を再生"
                >
                  {audioLoading ? <Loader2 className="animate-spin" size={12} /> : <Volume2 size={12} />}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => toggleFavorite(data.word)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-slate-400 transition-all hover:text-amber-400 hover:border-amber-200 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label={isFavorite(data.word) ? "お気に入りから削除" : "お気に入りに追加"}
          >
            <Star
              size={18}
              fill={isFavorite(data.word) ? "#F59E0B" : "none"}
              color={isFavorite(data.word) ? "#F59E0B" : "currentColor"}
              strokeWidth={2}
            />
          </button>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
            <span className="w-0.5 h-2.5 bg-indigo-500 rounded-full"></span>
            意味・解説
          </h2>
          
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
             <p className="text-base text-slate-900 font-medium">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700 mr-1.5">主要</span>
              {data.japaneseTranslation}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {data.meanings.map((m, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                    {m.partOfSpeech}
                  </span>
                  <span className="text-sm text-slate-900 font-medium">{m.meaning}</span>
                </div>
                
                {m.detailedMeanings.length > 0 && (
                  <div className="pl-1.5 border-l-2 border-slate-100 ml-0.5 flex flex-col gap-3">
                    {m.detailedMeanings.map((d) => (
                      <div key={d.number} className="pl-2.5 flex flex-col gap-1.5">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm text-slate-600 font-medium">
                            <span className="text-slate-400 mr-1.5">#{d.number}</span>
                            {d.definition}
                          </p>
                          {d.grammarPattern && (
                            <p className="text-xs text-slate-400">文型: {d.grammarPattern}</p>
                          )}
                        </div>

                        <div className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm">
                          <div className="flex items-start gap-1.5 mb-1.5">
                            <button
                              type="button"
                              className="mt-0.5 text-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-0.5 -ml-0.5"
                              onClick={() => handlePlaySentenceAudio(d.example, `meaning-${idx}-detail-${d.number}`)}
                              disabled={sentenceAudioLoading === `meaning-${idx}-detail-${d.number}`}
                              aria-label="例文を再生"
                            >
                              {sentenceAudioLoading === `meaning-${idx}-detail-${d.number}` ? (
                                <Loader2 className="animate-spin" size={12} />
                              ) : (
                                <Volume2 size={12} />
                              )}
                            </button>
                            <p className="text-sm text-slate-900 leading-relaxed font-medium">{d.example}</p>
                          </div>
                          <div className="flex items-start gap-1.5 border-t border-slate-100 pt-1.5">
                             <button
                              type="button"
                              className="mt-0.5 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded p-0.5 -ml-0.5"
                              onClick={() => handlePlaySentenceAudio(d.exampleJapanese, `meaning-${idx}-detail-${d.number}-ja`, "ja")}
                              disabled={sentenceAudioLoading === `meaning-${idx}-detail-${d.number}-ja`}
                              aria-label="日本語訳を再生"
                            >
                              {sentenceAudioLoading === `meaning-${idx}-detail-${d.number}-ja` ? (
                                <Loader2 className="animate-spin" size={12} />
                              ) : (
                                <Volume2 size={12} />
                              )}
                            </button>
                            <p className="text-xs text-slate-600 leading-relaxed">{d.exampleJapanese}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <span className="text-slate-400">場面: {d.context}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-400">頻度: {d.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {data.wordForms.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <span className="w-0.5 h-2.5 bg-blue-500 rounded-full"></span>
              語形変化
            </h2>
            <ul className="flex flex-wrap gap-1.5 list-none m-0 p-0">
              {data.wordForms.map((wf, i) => (
                <li key={`${wf.form}-${i}`} className="px-2 py-1 rounded bg-slate-50 text-slate-700 text-sm border border-slate-200 flex items-center gap-1.5">
                  <span className="font-medium">{wf.form}</span>
                  <span className="text-xs text-slate-400 bg-white px-1 rounded border border-slate-100">
                    {wf.type}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.synonyms.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <span className="w-0.5 h-2.5 bg-green-500 rounded-full"></span>
              類義語
            </h2>
            <ul className="flex flex-wrap gap-1.5 list-none m-0 p-0">
              {data.synonyms.map((s, i) => (
                <li key={i} className="text-sm">
                  {linkedWords[s] ? (
                    <Link
                      href={`/words/${linkedWords[s]}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all shadow-sm group"
                    >
                      <span className="font-medium">{s}</span>
                      <ArrowUpRight size={12} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200">
                      {s}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.nuance && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <span className="w-0.5 h-2.5 bg-amber-500 rounded-full"></span>
              ニュアンス
            </h2>
            <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100/50">
              <p className="text-sm text-slate-700 leading-relaxed">{data.nuance}</p>
            </div>
          </section>
        )}

        {data.toeicExamples.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <span className="w-0.5 h-2.5 bg-purple-500 rounded-full"></span>
              {data.word}のTOEIC例文
            </h2>
            <div className="flex flex-col gap-2">
              {data.toeicExamples.map((ex, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <div className="flex items-start gap-1.5 mb-1.5">
                    <button
                      type="button"
                      className="mt-0.5 text-purple-500 hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded p-0.5 -ml-0.5"
                      onClick={() => handlePlaySentenceAudio(ex.english, `toeic-${i}`)}
                      disabled={sentenceAudioLoading === `toeic-${i}`}
                      aria-label="例文を再生"
                    >
                      {sentenceAudioLoading === `toeic-${i}` ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Volume2 size={14} />
                      )}
                    </button>
                    <p className="text-sm text-slate-900 leading-relaxed font-medium">{ex.english}</p>
                  </div>
                  <div className="flex items-start gap-1.5 border-t border-slate-200/50 pt-1.5">
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded p-0.5 -ml-0.5"
                      onClick={() => handlePlaySentenceAudio(ex.japanese, `toeic-${i}-ja`, "ja")}
                      disabled={sentenceAudioLoading === `toeic-${i}-ja`}
                      aria-label="日本語訳を再生"
                    >
                      {sentenceAudioLoading === `toeic-${i}-ja` ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Volume2 size={14} />
                      )}
                    </button>
                    <p className="text-xs text-slate-600 leading-relaxed">{ex.japanese}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedWords && relatedWords.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <span className="w-0.5 h-2.5 bg-teal-500 rounded-full"></span>
              同レベル単語
            </h2>
            <ul className="flex flex-wrap gap-1.5 list-none m-0 p-0">
              {relatedWords.map((w) => (
                <li key={w.slug}>
                  <Link href={`/words/${w.slug}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-slate-700 text-sm border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-md transition-all shadow-sm group">
                    <span className="font-medium">{w.term}</span>
                    <ArrowUpRight size={12} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
