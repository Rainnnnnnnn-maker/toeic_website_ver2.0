"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./word-detail.module.css";
import type { WordDetails } from "@/app/api/words/[word]/route";

type Props = {
  word: string;
};

type State = {
  data?: WordDetails;
  loading: boolean;
  error?: string;
  audioUrl?: string;
  audioLoading: boolean;
};

export function WordDetailClient({ word }: Props) {
  const [state, setState] = useState<State>({
    loading: true,
    audioLoading: false,
  });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let shouldSkipNetwork = false;

    const storageKey = `word-detail:${word}`;

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            data?: WordDetails;
            expiresAt?: number;
          };
          if (
            parsed &&
            typeof parsed === "object" &&
            typeof parsed.expiresAt === "number" &&
            parsed.expiresAt > Date.now() &&
            parsed.data
          ) {
            shouldSkipNetwork = true;
            setState((prev) => ({
              ...prev,
              data: parsed.data,
              loading: false,
              error: undefined,
            }));
          }
        }
      } catch {
      }
    }

    async function fetchDetails() {
      if (shouldSkipNetwork) {
        return;
      }
      setState((prev) => ({ ...prev, loading: true, error: undefined }));

      console.log("Fetching word details for:", word);
      try {
        const response = await fetch(`/api/words/${encodeURIComponent(word)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          const errJson = await response.json().catch(() => null);
          const message = errJson?.error ?? "Failed to load word details";
          throw new Error(message);
        }
        const json = (await response.json()) as WordDetails;

        if (!cancelled) {
          if (typeof window !== "undefined") {
            try {
              const ttlMs = 24 * 60 * 60 * 1000;
              const payload = {
                data: json,
                expiresAt: Date.now() + ttlMs,
              };
              window.localStorage.setItem(storageKey, JSON.stringify(payload));
            } catch {
            }
          }
          setState((prev) => ({
            ...prev,
            data: json,
            loading: false,
            error: undefined,
          }));
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "";
          setState((prev) => ({
            ...prev,
            loading: false,
            error: msg
              ? `AIエラー: ${msg}`
              : "AIデータの取得に失敗しました。時間をおいて再度お試しください。",
          }));
        }
      }
    }

    fetchDetails();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [word]);

  const pronunciationLabel = useMemo(() => {
    if (!state.data?.pronunciation) {
      return "";
    }
    return state.data.pronunciation;
  }, [state.data?.pronunciation]);

  async function handlePlayAudio() {
    if (state.audioUrl) {
      const audio = new Audio(state.audioUrl);
      audio.play();
      return;
    }

    if (!state.data) {
      return;
    }

    setState((prev) => ({ ...prev, audioLoading: true }));

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: state.data.word }),
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

  if (state.loading) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.headerRow}>
          <div className={styles.wordSkeleton} />
          <div className={styles.pronunciationSkeleton} />
        </div>
        <div className={styles.sectionSkeleton} />
        <div className={styles.sectionSkeleton} />
        <div className={styles.sectionSkeleton} />
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className={styles.detailContainer}>
        <p className={styles.errorText}>{state.error ?? "データを取得できませんでした。"}</p>
        <button className={styles.retryButton} onClick={() => location.reload()}>
          再読み込み
        </button>
      </div>
    );
  }

  const data = state.data;

  return (
    <div className={styles.detailContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.wordHeading}>{data.word}</h1>
          {pronunciationLabel && (
            <div className={styles.pronRow}>
              <p className={styles.pronunciation}>{pronunciationLabel}</p>
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
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>日本語の意味（品詞別）</h2>
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
                {wf.form}（{wf.type}）
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.synonyms.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>類義語</h2>
          <div className={styles.pillList}>
            {data.synonyms.map((s) => (
              <span key={s} className={styles.pill}>{s}</span>
            ))}
          </div>
        </section>
      )}

      {data.toeicExamples.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>TOEIC例文</h2>
          <ul className={styles.exampleList}>
            {data.toeicExamples.map((example, index) => (
              <li key={index} className={styles.exampleItem}>
                <p className={styles.exampleSentence}>{example.english}</p>
                <p className={styles.exampleTranslation}>{example.japanese}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ニュアンス</h2>
        <p className={styles.sectionBody}>{data.nuance}</p>
      </section>

      {data.usageNotes && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>使い方の注意</h2>
          {data.usageNotes.commonCollocations?.length ? (
            <div className={styles.pillList}>
              {data.usageNotes.commonCollocations.map((c) => (
                <span key={c} className={styles.pill}>{c}</span>
              ))}
            </div>
          ) : null}
          {data.usageNotes.register && (
            <p className={styles.sectionBody}>レジスター：{data.usageNotes.register}</p>
          )}
          {data.usageNotes.regionalVariations && (
            <p className={styles.sectionBody}>地域差：{data.usageNotes.regionalVariations}</p>
          )}
        </section>
      )}

      {data.etymology && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>語源</h2>
          <p className={styles.sectionBody}>{data.etymology}</p>
        </section>
      )}
    </div>
  );
}
