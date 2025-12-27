import styles from "./word-detail.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Breadcrumb Skeleton */}
        <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: "200px", height: "24px", marginBottom: "16px" }} />

        <div className={styles.detailContainer}>
          {/* Title & Subtitle Skeleton */}
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`} />

          {/* Meaning Section Skeleton */}
          <div className={styles.skeletonSection}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonText}`} />
            <div className={`${styles.skeleton} ${styles.skeletonText}`} />
            <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonTextShort}`} />
          </div>

          {/* Examples Section Skeleton */}
          <div className={styles.skeletonSection}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ height: "60px" }} />
            <div style={{ height: "12px" }} />
            <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ height: "60px" }} />
          </div>
        </div>
      </main>
    </div>
  );
}
