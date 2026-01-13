"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import styles from "./word-detail.module.css";
import type { WordDetails } from "@/lib/actions";

type Props = {
  initialData: WordDetails;
  linkedWords?: Record<string, string>;
};

type State = {
  audioUrl?: string;
  audioLoading: boolean;
  sentenceAudioUrls: Record<number, string>;
  sentenceAudioLoading: number | null;
};

export function WordDetailClient({ initialData, linkedWords = {} }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [state, setState] = useState<State>({
    audioLoading: false,
    sentenceAudioUrls: {},
    sentenceAudioLoading: null,
  });
  const [skeletonVisible, setSkeletonVisible] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSkeletonVisible(false);
    }, 300);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  const data = initialData;

  async function handlePlayAudio() {
    if (state.audioUrl) {
      const audio = new Audio(state.audioUrl);
      audio.play();
      return;
    }

    setState((prev) => ({ ...prev, audioLoading: true }));

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: data.word }),
      });

      if (!response.ok) {
        throw new Error("Failed to synthesize speech");
      }

      const json = (await response.json()) as { audioContent?: string };

      if (!json.audioContent) {
        throw new Error("Missing audio content in response");
      }

      const audioUrl = `data:audio/mp3;base64,${json.audioContent}`;

      setState((prev) => ({ ...prev, audioUrl, audioLoading: false }));

      const audio = new Audio(audioUrl);
      audio.play();
    } catch {
      setState((prev) => ({ ...prev, audioLoading: false }));
      alert("音声の生成に失敗しました。時間をおいて再度お試しください。");
    }
  }

  async function handlePlaySentenceAudio(text: string, index: number) {
    if (state.sentenceAudioUrls[index]) {
      const audio = new Audio(state.sentenceAudioUrls[index]);
      audio.play();
      return;
    }

    setState((prev) => ({ ...prev, sentenceAudioLoading: index }));

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to synthesize speech");
      }

      const json = (await response.json()) as { audioContent?: string };

      if (!json.audioContent) {
        throw new Error("Missing audio content in response");
      }

      const audioUrl = `data:audio/mp3;base64,${json.audioContent}`;

      setState((prev) => ({
        ...prev,
        sentenceAudioUrls: { ...prev.sentenceAudioUrls, [index]: audioUrl },
        sentenceAudioLoading: null,
      }));

      const audio = new Audio(audioUrl);
      audio.play();
    } catch {
      setState((prev) => ({ ...prev, sentenceAudioLoading: null }));
      alert("音声の生成に失敗しました。時間をおいて再度お試しください。");
    }
  }

  if (skeletonVisible) {
    return (
      <div className={styles.detailContainer}>
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`} />
        <div className={styles.skeletonSection}>
          <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`} />
          <div className={`${styles.skeleton} ${styles.skeletonText}`} />
          <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonTextShort}`} />
        </div>
        {/* Examples Section Skeleton removed to match server loading state and show footer */}
      </div>
    );
  }

  return (
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
                onClick={handlePlayAudio}
                disabled={state.audioLoading}
                aria-label="発音を再生"
              >
                <span className={styles.audioIcon}>
                  {state.audioLoading ? (
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
                        style={{ opacity: 0.25 }}
                      ></circle>
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        style={{ opacity: 0.75 }}
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
        <div className={styles.sectionBody} style={{ marginBottom: "12px" }}>
          <p>
            <strong>意味</strong>：{data.japaneseTranslation}
          </p>
        </div>
        {data.meanings.map((m, idx) => (
          <div key={idx} className={styles.sectionBody}>
            <p><strong>{m.partOfSpeech}</strong>：{m.meaning}</p>
            {m.detailedMeanings.length > 0 && (
              <div style={{ marginTop: 6 }}>
                {m.detailedMeanings.map((d) => (
                  <div key={d.number} style={{ marginBottom: 8 }}>
                    <p>【{d.number}】{d.definition}</p>
                    {d.grammarPattern && (
                      <p style={{ color: "#6b7280" }}>文型：{d.grammarPattern}</p>
                    )}
                    <p className={styles.exampleSentence}>{d.example}</p>
                    <p className={styles.exampleTranslation}>{d.exampleJapanese}</p>
                    <p style={{ color: "#6b7280" }}>
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
                <span style={{ marginLeft: 6, fontSize: "14px", color: "#6b7280" }}>
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
              <div key={i} style={{ marginBottom: i < data.toeicExamples.length - 1 ? 12 : 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <p className={styles.exampleSentence} style={{ margin: 0 }}>
                    {ex.english}
                  </p>
                  <button
                    type="button"
                    className={styles.audioButton}
                    onClick={() => handlePlaySentenceAudio(ex.english, i)}
                    disabled={state.sentenceAudioLoading === i}
                    aria-label="例文を再生"
                    style={{ marginTop: "4px", flexShrink: 0 }}
                  >
                    <span
                      className={styles.audioIcon}
                      style={{ width: "22px", height: "22px", fontSize: "14px" }}
                    >
                      {state.sentenceAudioLoading === i ? (
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
                            style={{ opacity: 0.25 }}
                          ></circle>
                          <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            style={{ opacity: 0.75 }}
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
                <p className={styles.exampleTranslation} style={{ marginTop: "4px" }}>
                  {ex.japanese}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
