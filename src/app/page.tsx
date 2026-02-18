import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import styles from "./page.module.css";
import { getImportantWords, getMediumWords, getHighWords } from "@/data/words";
import WordsListClient from "@/components/features/words/WordsListClient";
import { SnsShareButtons } from "@/components/features/sns/SnsShareButtons";

export const metadata: Metadata = {
  title: {
    absolute: "TOEIC 重要単語【2026年最新】600点・730点・800点突破｜AI解説付き無料単語帳",
  },
  description:
    "【完全無料】TOEIC重要単語をAIが徹底解説！2026年最新の出題傾向（リモートワーク・オンライン会議）を反映。600点・730点・800点レベル別に厳選した頻出単語で効率的にスコアアップ。例文・類義語・発音も完備。",
  keywords: ["TOEIC 重要単語", "TOEIC 単語帳", "TOEIC 頻出単語", "2026年", "最新", "無料", "アプリ", "600点", "730点", "800点"],
  alternates: {
    canonical: "https://www.toeic-words.com/",
  },
};

export default async function Home() {
  const importantWords = await getImportantWords();
  const mediumWords = await getMediumWords();
  const highWords = await getHighWords();

  // WebSite構造化データ
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TOEIC重要単語",
    description: "【完全無料】TOEIC重要単語をAIが徹底解説！頻出単語を効率的に学習してスコアアップ。",
    alternateName: ["TOEIC重要単語", "TOEIC Words", "TOEIC単語帳"],
    url: "https://www.toeic-words.com/",
    inLanguage: "ja-JP",
  };

  // BreadcrumbList構造化データ
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: "https://www.toeic-words.com/",
      },
    ],
  };

  // EducationalOrganization構造化データ
  const educationalJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "TOEIC重要単語",
    description: "TOEIC L&Rテスト対策のための無料オンライン単語学習サービス",
    url: "https://www.toeic-words.com/",
    educationalCredentialAwarded: "TOEIC L&R スコアアップ",
  };

  return (
    <div className={styles.page}>
      <Script
        id="ldjson-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Script
        id="ldjson-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="ldjson-educational"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalJsonLd) }}
      />
      <main className={styles.main}>
        <div className={styles.snsContainer} style={{ display: "flex", justifyContent: "flex-end" }}>
          <SnsShareButtons
            url="https://www.toeic-words.com/"
            title="【2026年最新】TOEIC 重要単語 | 頻出単語を効率よく学習"
          />
        </div>
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
        <WordsListClient importantWords={importantWords} mediumWords={mediumWords} highWords={highWords} />

        <section className={styles.seoSection}>
          <article className={styles.seoArticle}>
            <h2 className={styles.seoTitle}>2026年最新のTOEIC重要単語と出題傾向</h2>
            <p className={styles.seoText}>
              近年のTOEIC L&Rテストでは、ビジネス環境の変化に伴い「リモートワーク」「オンライン会議」「チャットツール」に関連する語彙の出題頻度が増加しています。
              また、従来のオフィスワークだけでなく、ハイブリッドワークや柔軟な働き方を示唆する文脈も増えています。
            </p>
            <p className={styles.seoText}>
              本サイトの「TOEIC重要単語」リストは、こうした最新のトレンドを踏まえ、スコアアップに直結する頻出語彙を厳選しています。
              例えば、<Link href="/words/accommodate">accommodate</Link>（対応する）や<Link href="/words/negotiate">negotiate</Link>（交渉する）、
              <Link href="/words/implement">implement</Link>（実施する）などのビジネス英語の重要単語を、
              古い単語帳ではカバーしきれない現代的なビジネス英語表現とともに、AIによる最新の例文で学習できます。
            </p>
          </article>

          <article className={styles.seoArticle}>
            <h2 className={styles.seoTitle}>TOEIC重要単語の効率的な覚え方</h2>
            <p className={styles.seoText}>
              TOEICスコアアップの鍵は、試験に出る「TOEIC重要単語」を確実にマスターすることです。
              単に英単語と日本語訳を丸暗記するのではなく、実際の例文の中でどのように使われるかを理解することが重要です。
              本サイトでは、AIを活用して各単語の詳細な意味の解説、語形変化、類義語、ニュアンス、そして例文を提供しています。
            </p>
            <ul className={styles.seoList}>
              <li className={styles.seoListItem}>
                <strong>コロケーション（語の組み合わせ）を意識する：</strong> 重要単語は単独ではなく、他の語とセットで使われることが多いです。例文を通じて自然なつながりを学びましょう。
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
            <h2 className={styles.seoTitle}>目標スコア別 TOEIC重要単語の選び方</h2>
            <p className={styles.seoText}>
              現在のスコアや目標に応じて、優先して覚えるべき重要単語は異なります。
              まずは基礎となる「最重要単語」から始め、基礎を固めた上で「中級単語」へとステップアップすることをおすすめします。
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
