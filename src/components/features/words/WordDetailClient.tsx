"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Star } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import styles from "./word-detail.module.css";
import type { WordDetails } from "@/lib/actions";
import { SnsShareButtons } from "@/components/features/sns/SnsShareButtons";
import { useTTS } from "@/hooks/useTTS";

type Props = {
  initialData: WordDetails;
  linkedWords?: Record<string, string>;
};

export function WordDetailClient({ initialData, linkedWords = {} }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    audioLoading,
    sentenceAudioLoading,
    handlePlayAudio,
    handlePlaySentenceAudio
  } = useTTS();
  const [shareContainer, setShareContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setShareContainer(document.getElementById("word-nav-share-container"));
  }, []);

  const data = initialData;



  return (
    <>
      {shareContainer &&
        createPortal(
          <SnsShareButtons
            url={`https://www.toeic-words.com/words/${data.word}`}
            title={`${data.word}の意味「${data.japaneseTranslation}」 | TOEIC重要単語`}
          />,
          shareContainer
        )}
      <div className={styles.detailContainer}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.wordHeading}>{data.word}</h1>
            {data.pronunciation && (
              <div className={styles.pronRow}>
                <p className={styles.pronunciation}>{data.pronunciation}</p>
                <button
                  type="button"
                  className={styles.audioButton}
                  onClick={() => handlePlayAudio(data.word)}
                  disabled={audioLoading}
                  aria-label="発音を再生"
                >
                  <span className={styles.audioIcon}>
                    {audioLoading ? (
                      <svg
                        className={styles.spinner}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className={styles.spinnerBase}
                        ></circle>
                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          style={{ opacity: 0.75 }}
                          className={styles.spinnerPath}
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="16"
                        height="16"
                      >
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => toggleFavorite(data.word)}
            className={styles.favoriteButton}
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

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>日本語の意味（品詞別）</h2>
          <div className={`${styles.sectionBody} ${styles.marginBottom12}`}>
            <p>
              <strong>意味</strong>：{data.japaneseTranslation}
            </p>
          </div>
          {data.meanings.map((m, idx) => (
            <div key={idx} className={styles.sectionBody}>
              <p><strong>{m.partOfSpeech}</strong>：{m.meaning}</p>
              {m.detailedMeanings.length > 0 && (
                <div className={styles.marginTop6}>
                  {m.detailedMeanings.map((d) => (
                    <div key={d.number} className={styles.marginBottom8}>
                      <p>【{d.number}】{d.definition}</p>
                      {d.grammarPattern && (
                        <p className={styles.metaText}>文型：{d.grammarPattern}</p>
                      )}
                      <div className={styles.flexStartGap8}>
                        <p className={`${styles.exampleSentence} ${styles.noMargin}`}>{d.example}</p>
                        <button
                          type="button"
                          className={`${styles.audioButton} ${styles.exampleAudioButton}`}
                          onClick={() => handlePlaySentenceAudio(d.example, `meaning-${idx}-detail-${d.number}`)}
                          disabled={sentenceAudioLoading === `meaning-${idx}-detail-${d.number}`}
                          aria-label="例文を再生"
                        >
                          <span
                            className={`${styles.audioIcon} ${styles.smallAudioIcon}`}
                          >
                            {sentenceAudioLoading === `meaning-${idx}-detail-${d.number}` ? (
                              <svg
                                className={styles.spinner}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  className={styles.spinnerBase}
                                ></circle>
                                <path
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  className={styles.spinnerPath}
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                width="14"
                                height="14"
                              >
                                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                              </svg>
                            )}
                          </span>
                        </button>
                      </div>
                      <p className={`${styles.exampleTranslation} ${styles.marginTop4}`}>{d.exampleJapanese}</p>
                      <p className={styles.metaText}>
                        場面：{d.context}／頻度：{d.frequency}
                      </p>
                      {d.synonyms?.length > 0 && (
                        <div className={styles.pillList}>
                          {d.synonyms.map((s) => (
                            <span key={s} className={styles.pill}>{s}</span>
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
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>語形変化</h2>
            <ul className={styles.pillList}>
              {data.wordForms.map((wf, i) => (
                <li key={`${wf.form}-${i}`} className={styles.pill}>
                  {wf.form}
                  <span className={styles.wordFormType}>
                    （{wf.type}）
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.synonyms.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>類義語</h2>
            <ul className={styles.pillList}>
              {data.synonyms.map((s, i) => (
                <li key={i} className={styles.pill}>
                  {linkedWords[s] ? (
                    <Link
                      href={`/words/${linkedWords[s]}`}
                      className={styles.wordLink}
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
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>ニュアンス</h2>
            <div className={styles.sectionBody}>
              <p>{data.nuance}</p>
            </div>
          </section>
        )}

        {data.toeicExamples.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{data.word}のTOEIC例文（AI例文）</h2>
            <div className={styles.sectionBody}>
              {data.toeicExamples.map((ex, i) => (
                <div key={i} className={i < data.toeicExamples.length - 1 ? styles.exampleRow : styles.exampleRowLast}>
                  <div className={styles.flexStartGap8}>
                    <p className={`${styles.exampleSentence} ${styles.noMargin}`}>
                      {ex.english}
                    </p>
                    <button
                      type="button"
                      className={`${styles.audioButton} ${styles.exampleAudioButton}`}
                      onClick={() => handlePlaySentenceAudio(ex.english, `toeic-${i}`)}
                      disabled={sentenceAudioLoading === `toeic-${i}`}
                      aria-label="例文を再生"
                    >
                      <span
                        className={`${styles.audioIcon} ${styles.smallAudioIcon}`}
                      >
                        {sentenceAudioLoading === `toeic-${i}` ? (
                          <svg
                            className={styles.spinner}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              className={styles.spinnerBase}
                            ></circle>
                            <path
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              className={styles.spinnerPath}
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="14"
                            height="14"
                          >
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                            <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </div>
                  <p className={`${styles.exampleTranslation} ${styles.marginTop4}`}>
                    {ex.japanese}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
