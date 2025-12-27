import styles from "./word-detail.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.detailContainer}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>単語データを読み込み中...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
