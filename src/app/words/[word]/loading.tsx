import styles from "./word-detail.module.css";

export default function Loading() {
  return (
    <div className={styles.detailContainer}>
      {/* Title & Subtitle Skeleton */}
      <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
      <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`} />

      {/* Meaning Section Skeleton */}
      <div className={styles.skeletonSection}>
        <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`} />
        <div className={`${styles.skeleton} ${styles.skeletonText}`} />
        <div className={`${styles.skeleton} ${styles.skeletonText} ${styles.skeletonTextShort}`} />
      </div>

      {/* Examples Section Skeleton - Removed to reduce height for visibility of footer disclaimer */}
    </div>
  );
}
