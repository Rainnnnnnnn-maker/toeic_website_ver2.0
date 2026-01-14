import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { getImportantWords, getMediumWords } from "@/data/words";
import WordsListClient from "./WordsListClient";

export const metadata: Metadata = {
  title: {
    absolute: "TOEIC重要単語【2026年最新】600点・730点・800点レベル別",
  },
  description:
    "【2026年最新】TOEIC重要単語・Web単語帳。600点突破に必須の頻出単語から730点・800点レベルの中級単語までを網羅。AIによる詳細な解説と例文で、効率よくスコアアップを目指せます。",
  alternates: {
    canonical: "https://www.toeic-words.com/",
  },
};

export default async function Home() {
  const importantWords = await getImportantWords();
  const mediumWords =  await getMediumWords();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TOEIC重要単語集",
    description: "TOEIC頻出の重要単語をAI解説、AI例文で効率よく学べる",
    alternateName: ["TOEIC重要単語", "TOEIC Words", "TOEIC単語帳"],
    url: "https://www.toeic-words.com/",
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
            <h1 className={styles.title}>【2026年最新】TOEIC 重要単語</h1>
            <p className={styles.subtitle}>
              頻出単語を効率よく学習して、スコアアップを目指しましょう。
            </p>
          </div>
          <div className={styles.ctaGroup}>
            <Link href="/study" className={styles.ctaButton}>
              <span className={styles.ctaButtonLabel}>学習モード開始</span>
            </Link>
            <Link href="/favorites" className={styles.secondaryButton}>
              <span className={styles.ctaButtonLabel}>お気に入り単語</span>
            </Link>
          </div>
        </header>
        <WordsListClient importantWords={importantWords} mediumWords={mediumWords} />
        
        <section className={styles.seoSection}>
          <article className={styles.seoArticle}>
            <h2 className={styles.seoTitle}>TOEIC単語の効率的な覚え方</h2>
            <p className={styles.seoText}>
              TOEICスコアアップの鍵は、頻出単語（重要単語）を確実にマスターすることです。
              単に英単語と日本語訳を丸暗記するのではなく、実際の例文の中でどのように使われるかを理解することが重要です。
              本サイトでは、AIを活用して各単語の詳細な意味の解説、語形変化、類義語、ニュアンス、そして例文を提供しています。
            </p>
            <ul className={styles.seoList}>
              <li className={styles.seoListItem}>
                <strong>コロケーション（語の組み合わせ）を意識する：</strong> 単語は単独ではなく、他の語とセットで使われることが多いです。例文を通じて自然なつながりを学びましょう。
              </li>
              <li className={styles.seoListItem}>
                <strong>類義語との違いを理解する：</strong> 似た意味の単語の使い分けが問われることがあります。微妙なニュアンスの違いを押さえましょう。
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
              まずは「重要単語」から始め、基礎を固めた上で「中級単語」へとステップアップすることをおすすめします。
            </p>
            <p className={styles.seoText}>
              TOEIC 600点を目指す方は、頻繁に使われる基本的な最重要単語を確実に抑えましょう。
              600点以上を目指す方は、より難しい単語をAIの解説を活用して、理解を深めながら覚えましょう。
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
