"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { Star, Volume2, Loader2 } from "lucide-react";
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
      <div className="mt-0 p-5 bg-white rounded-[20px] border border-gray-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)] relative flex flex-col gap-4">
        <div className="flex justify-between gap-4 items-end">
          <div>
            <h1 className="text-2xl text-slate-900 font-bold tracking-[0.01em] sm:text-[28px] lg:text-[34px]">{data.word}</h1>
            {data.pronunciation && (
              <div className="mt-1 inline-flex items-center gap-2.5">
                <p className="mt-0 text-base text-gray-700 font-mono bg-gray-100 border border-gray-200 rounded-lg inline-block px-2 py-1">{data.pronunciation}</p>
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer disabled:opacity-70 disabled:cursor-default group"
                  onClick={() => handlePlayAudio(data.word)}
                  disabled={audioLoading}
                  aria-label="発音を再生"
                >
                  <span className="w-[26px] h-[26px] rounded-full inline-flex items-center justify-center bg-gray-100 text-[#5780d8] text-lg leading-none transition-all duration-160 group-hover:translate-y-[-1px] group-hover:shadow-md">
                    {audioLoading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => toggleFavorite(data.word)}
            className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white text-slate-500 cursor-pointer transition-all duration-200 shadow-sm shrink-0 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-px hover:shadow-md active:translate-y-0"
            aria-label={isFavorite(data.word) ? "お気に入りから削除" : "お気に入りに追加"}
            title={isFavorite(data.word) ? "お気に入りから削除" : "お気に入りに追加"}
          >
            <Star
              size={24}
              fill={isFavorite(data.word) ? "#FFC107" : "none"}
              color={isFavorite(data.word) ? "#FFC107" : "#94a3b8"}
              strokeWidth={2}
            />
          </button>
        </div>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-[15px] tracking-[0.12em] uppercase text-gray-500 border-b border-gray-200 pb-1.5">日本語の意味（品詞別）</h2>
          <div className="text-[17px] leading-[1.8] text-gray-900 mb-3">
            <p>
              <strong className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-sm font-semibold mr-1.5">意味</strong>：{data.japaneseTranslation}
            </p>
          </div>
          {data.meanings.map((m, idx) => (
            <div key={idx} className="text-[17px] leading-[1.8] text-gray-900">
              <p><strong className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-sm font-semibold mr-1.5">{m.partOfSpeech}</strong>：{m.meaning}</p>
              {m.detailedMeanings.length > 0 && (
                <div className="mt-1.5">
                  {m.detailedMeanings.map((d) => (
                    <div key={d.number} className="mb-2">
                      <p>【{d.number}】{d.definition}</p>
                      {d.grammarPattern && (
                        <p className="text-gray-500">文型：{d.grammarPattern}</p>
                      )}
                      <div className="flex items-start gap-2">
                        <p className="text-lg leading-[1.8] text-slate-900 font-medium m-0">{d.example}</p>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer disabled:opacity-70 disabled:cursor-default group mt-1 shrink-0"
                          onClick={() => handlePlaySentenceAudio(d.example, `meaning-${idx}-detail-${d.number}`)}
                          disabled={sentenceAudioLoading === `meaning-${idx}-detail-${d.number}`}
                          aria-label="例文を再生"
                        >
                          <span
                            className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center bg-gray-100 text-[#5780d8] text-sm leading-none transition-all duration-160 group-hover:translate-y-[-1px] group-hover:shadow-md"
                          >
                            {sentenceAudioLoading === `meaning-${idx}-detail-${d.number}` ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Volume2 size={14} />
                            )}
                          </span>
                        </button>
                      </div>
                      <div className="flex items-start gap-2">
                        <p className="mt-1 text-base text-gray-700 border-l-[3px] border-blue-300 pl-2.5 bg-gradient-to-r from-blue-300/12 to-transparent rounded-md m-0">{d.exampleJapanese}</p>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer disabled:opacity-70 disabled:cursor-default group mt-1 shrink-0"
                          onClick={() => handlePlaySentenceAudio(d.exampleJapanese, `meaning-${idx}-detail-${d.number}-ja`, "ja")}
                          disabled={sentenceAudioLoading === `meaning-${idx}-detail-${d.number}-ja`}
                          aria-label="日本語訳を再生"
                        >
                          <span
                            className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center bg-gray-100 text-[#5780d8] text-sm leading-none transition-all duration-160 group-hover:translate-y-[-1px] group-hover:shadow-md"
                          >
                            {sentenceAudioLoading === `meaning-${idx}-detail-${d.number}-ja` ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Volume2 size={14} />
                            )}
                          </span>
                        </button>
                      </div>
                      <p className="text-gray-500">
                        場面：{d.context}／頻度：{d.frequency}
                      </p>
                      {d.synonyms?.length > 0 && (
                        <div className="flex flex-wrap gap-2 list-none m-0 p-0">
                          {d.synonyms.map((s) => (
                            <span key={s} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm border border-gray-200">
                              {linkedWords[s] ? (
                                <Link
                                  href={`/words/${linkedWords[s]}`}
                                  className="underline decoration-2 underline-offset-2 cursor-pointer transition-all duration-200 inline-block text-blue-600 font-bold bg-blue-50 border-blue-200 hover:text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:-translate-y-px"
                                >
                                  {s}
                                </Link>
                              ) : (
                                s
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        {data.wordForms.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[15px] tracking-[0.12em] uppercase text-gray-500 border-b border-gray-200 pb-1.5">語形変化</h2>
            <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
              {data.wordForms.map((wf, i) => (
                <li key={`${wf.form}-${i}`} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm border border-gray-200">
                  {wf.form}
                  <span className="ml-1.5 text-sm text-gray-500">
                    （{wf.type}）
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.synonyms.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[15px] tracking-[0.12em] uppercase text-gray-500 border-b border-gray-200 pb-1.5">類義語</h2>
            <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
              {data.synonyms.map((s, i) => (
                <li key={i} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm border border-gray-200">
                  {linkedWords[s] ? (
                    <Link
                      href={`/words/${linkedWords[s]}`}
                      className="underline decoration-2 underline-offset-2 cursor-pointer transition-all duration-200 inline-block text-blue-600 font-bold bg-blue-50 border-blue-200 hover:text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:-translate-y-px"
                    >
                      {s}
                    </Link>
                  ) : (
                    s
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.nuance && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[15px] tracking-[0.12em] uppercase text-gray-500 border-b border-gray-200 pb-1.5">ニュアンス</h2>
            <div className="text-[17px] leading-[1.8] text-gray-900">
              <p>{data.nuance}</p>
            </div>
          </section>
        )}

        {data.toeicExamples.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[15px] tracking-[0.12em] uppercase text-gray-500 border-b border-gray-200 pb-1.5">{data.word}のTOEIC例文（AI例文）</h2>
            <div className="text-[17px] leading-[1.8] text-gray-900">
              {data.toeicExamples.map((ex, i) => (
                <div key={i} className={i < data.toeicExamples.length - 1 ? "mb-3" : "mb-0"}>
                  <div className="flex items-start gap-2">
                    <p className="text-lg leading-[1.8] text-slate-900 font-medium m-0">
                      {ex.english}
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer disabled:opacity-70 disabled:cursor-default group mt-1 shrink-0"
                      onClick={() => handlePlaySentenceAudio(ex.english, `toeic-${i}`)}
                      disabled={sentenceAudioLoading === `toeic-${i}`}
                      aria-label="例文を再生"
                    >
                      <span
                        className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center bg-gray-100 text-[#5780d8] text-sm leading-none transition-all duration-160 group-hover:translate-y-[-1px] group-hover:shadow-md"
                      >
                        {sentenceAudioLoading === `toeic-${i}` ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Volume2 size={14} />
                        )}
                      </span>
                    </button>
                  </div>
                  <div className="flex items-start gap-2">
                    <p className="mt-1 text-base text-gray-700 border-l-[3px] border-blue-300 pl-2.5 bg-gradient-to-r from-blue-300/12 to-transparent rounded-md m-0">
                      {ex.japanese}
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-0 border-none bg-transparent cursor-pointer disabled:opacity-70 disabled:cursor-default group mt-1 shrink-0"
                      onClick={() => handlePlaySentenceAudio(ex.japanese, `toeic-${i}-ja`, "ja")}
                      disabled={sentenceAudioLoading === `toeic-${i}-ja`}
                      aria-label="日本語訳を再生"
                    >
                      <span
                        className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center bg-gray-100 text-[#5780d8] text-sm leading-none transition-all duration-160 group-hover:translate-y-[-1px] group-hover:shadow-md"
                      >
                        {sentenceAudioLoading === `toeic-${i}-ja` ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Volume2 size={14} />
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedWords && relatedWords.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[15px] tracking-[0.12em] uppercase text-gray-500 border-b border-gray-200 pb-1.5">同レベル単語</h2>
            <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
              {relatedWords.map((w) => (
                <li key={w.slug} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm border border-gray-200">
                  <Link href={`/words/${w.slug}`} className="underline decoration-2 underline-offset-2 cursor-pointer transition-all duration-200 inline-block text-blue-600 font-bold bg-blue-50 border-blue-200 hover:text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:-translate-y-px">
                    {w.term}
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
