import Link from "next/link";
import Script from "next/script";
import styles from "./page.module.css";
import { getImportantWords, getMediumWords } from "@/data/words";
import WordsListClient from "./WordsListClient";

export default function Home() {
  const importantWords = getImportantWords();
  const mediumWords = getMediumWords();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TOEIC重要単語",
    url: "https://toeic-words.com/",
    inLanguage: "ja-JP",
  };

  return (
    <div className={styles.page}>
      <Script
        id="ldjson-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <p className={styles.tagline}>LEVEL UP YOUR SCORE</p>
            <h1 className={styles.title}>2026年版 TOEIC 重要単語集</h1>
            <p className={styles.subtitle}>
              頻出単語を効率よく学習して、スコアアップを目指しましょう。
            </p>
          </div>
          <div className={styles.ctaGroup}>
            <Link href="/study" className={styles.ctaButton}>
              <span className={styles.ctaButtonLabel}>学習モード</span>
            </Link>
            <Link href="/favorites" className={styles.secondaryButton}>
              <span className={styles.ctaButtonLabel}>お気に入り</span>
            </Link>
          </div>
        </header>
        <WordsListClient importantWords={importantWords} mediumWords={mediumWords} />
        
        <section className={styles.seoSection}>
          <article className={styles.seoArticle}>
            <h2 className={styles.seoTitle}>TOEIC単語の効率的な覚え方</h2>
            <p className={styles.seoText}>
              TOEICスコアアップの鍵は、頻出単語を確実にマスターすることです。
              単に英単語と日本語訳を丸暗記するのではなく、実際の文脈（コンテキスト）の中でどのように使われるかを理解することが重要です。
              本サイトでは、AIを活用して各単語の詳細な解説、例文、類義語、そしてニュアンスの違いを提供しています。
            </p>
            <ul className={styles.seoList}>
              <li className={styles.seoListItem}>
                <strong>コロケーション（語の組み合わせ）を意識する：</strong> 単語は単独ではなく、他の語とセットで使われることが多いです。例文を通じて自然なつながりを学びましょう。
              </li>
              <li className={styles.seoListItem}>
                <strong>類義語との違いを理解する：</strong> TOEICのPart 5やPart 6では、似た意味の単語の使い分けが問われることがあります。微妙なニュアンスの違いを押さえましょう。
              </li>
              <li className={styles.seoListItem}>
                <strong>音声とセットで覚える：</strong> リスニング対策も兼ねて、正しい発音とアクセントを確認しながら学習を進めることが効果的です。
              </li>
            </ul>
          </article>

          <article className={styles.seoArticle}>
            <h2 className={styles.seoTitle}>目標スコア別重要単語の選び方</h2>
            <p className={styles.seoText}>
              現在のスコアや目標に応じて、優先して覚えるべき単語は異なります。
              まずは「最重要単語」から始め、基礎を固めた上で「中級単語」へとステップアップすることをおすすめします。
            </p>
            <p className={styles.seoText}>
              TOEIC 600点を目指す方は、ビジネスシーンで頻繁に使われる基本的な動詞や名詞（会議、予約、注文など）を確実に抑えましょう。
              800点以上を目指す方は、より抽象的な概念を表す語や、フォーマルな表現、派生語への理解を深める必要があります。
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
