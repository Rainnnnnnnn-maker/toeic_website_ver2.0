import styles from "./word-detail.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Page Header (Breadcrumb etc) - Replicates page.tsx structure */}
        <header className={styles.headerRow}>
          <div>
            <p className={styles.breadcrumb}>
              <span className={styles.breadcrumbLink} style={{ color: "#e5e7eb" }}>単語一覧</span>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.skeletonText} style={{ width: "80px", display: "inline-block", marginBottom: 0 }} />
            </p>
            <h2 className={styles.pageTitle} style={{ color: "transparent", background: "#e5e7eb", borderRadius: "4px", width: "240px" }}>
              AIによる単語の詳細解説
            </h2>
          </div>
        </header>

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

        {/* Disclaimer Footer */}
        <p className={styles.aiDisclaimer} style={{ color: "transparent", background: "#e5e7eb", borderRadius: "4px", width: "80%", margin: "14px auto" }}>
          AIによる解説は必ずしも正しいとは限りません。重要な情報は確認するようにしてください。
        </p>
      </main>
    </div>
  );
}
