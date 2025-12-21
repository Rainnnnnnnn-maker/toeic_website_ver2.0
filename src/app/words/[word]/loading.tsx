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
          <div className={styles.sectionSkeleton} />
          <div className={styles.sectionSkeleton} />
          <div className={styles.sectionSkeleton} />
        </div>
      </main>
    </div>
  );
}
