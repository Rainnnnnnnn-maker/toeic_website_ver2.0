import styles from "./word-detail.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.detailContainer}>
          <div className={styles.headerRow}>
            <div className={styles.wordSkeleton} />
            <div className={styles.pronunciationSkeleton} />
          </div>

          {/* Meanings Section */}
          <div className={styles.sectionSkeleton} style={{ width: "140px" }} />
          <div className={styles.skeletonBlock} />
          <div className={styles.skeletonBlock} />

          {/* Word Forms / Synonyms */}
          <div className={styles.sectionSkeleton} style={{ width: "80px" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
          </div>

          {/* TOEIC Examples */}
          <div className={styles.sectionSkeleton} style={{ width: "120px" }} />
          <div className={styles.skeletonBlock} style={{ height: "80px" }} />
          <div className={styles.skeletonBlock} style={{ height: "80px" }} />
        </div>
      </main>
    </div>
  );
}
