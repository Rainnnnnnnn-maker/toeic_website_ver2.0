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

    async function fetchDetails() {
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
                  {state.audioLoading ? "…" : "🔊"}
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
