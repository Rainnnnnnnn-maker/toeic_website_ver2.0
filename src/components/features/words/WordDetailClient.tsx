"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { Star, Volume2, Loader2 } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import styles from "./word-detail.module.css";
import type { WordDetails } from "@/lib/actions";
import { SnsShareButtons } from "@/components/features/sns/SnsShareButtons";
import { useTTS } from "@/hooks/useTTS";
import { useShareTarget } from "@/context/ShareTargetContext";

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
                      <Loader2 className={styles.spinner} size={16} />
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
                              <Loader2 className={styles.spinner} size={14} />
                            ) : (
                              <Volume2 size={14} />
                            )}
                          </span>
                        </button>
                      </div>
                      <div className={styles.flexStartGap8}>
                        <p className={`${styles.exampleTranslation} ${styles.marginTop4} ${styles.noMargin}`}>{d.exampleJapanese}</p>
                        <button
                          type="button"
                          className={`${styles.audioButton} ${styles.exampleAudioButton}`}
                          onClick={() => handlePlaySentenceAudio(d.exampleJapanese, `meaning-${idx}-detail-${d.number}-ja`, "ja")}
                          disabled={sentenceAudioLoading === `meaning-${idx}-detail-${d.number}-ja`}
                          aria-label="日本語訳を再生"
                        >
                          <span
                            className={`${styles.audioIcon} ${styles.smallAudioIcon}`}
                          >
                            {sentenceAudioLoading === `meaning-${idx}-detail-${d.number}-ja` ? (
                              <Loader2 className={styles.spinner} size={14} />
                            ) : (
                              <Volume2 size={14} />
                            )}
                          </span>
                        </button>
                      </div>
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
                          <Loader2 className={styles.spinner} size={14} />
                        ) : (
                          <Volume2 size={14} />
                        )}
                      </span>
                    </button>
                  </div>
                  <div className={styles.flexStartGap8}>
                    <p className={`${styles.exampleTranslation} ${styles.marginTop4} ${styles.noMargin}`}>
                      {ex.japanese}
                    </p>
                    <button
                      type="button"
                      className={`${styles.audioButton} ${styles.exampleAudioButton}`}
                      onClick={() => handlePlaySentenceAudio(ex.japanese, `toeic-${i}-ja`, "ja")}
                      disabled={sentenceAudioLoading === `toeic-${i}-ja`}
                      aria-label="日本語訳を再生"
                    >
                      <span
                        className={`${styles.audioIcon} ${styles.smallAudioIcon}`}
                      >
                        {sentenceAudioLoading === `toeic-${i}-ja` ? (
                          <Loader2 className={styles.spinner} size={14} />
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
      </div>
    </>
  );
}
