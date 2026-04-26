import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_ARTICLES } from "@/data/guide-articles";

const SITE_URL = "https://www.toeic-words.com";

export const metadata: Metadata = {
  title: "TOEIC 学習ガイド｜スコア別戦略・Part 別対策・語彙集",
  description:
    "TOEIC のスコアアップに役立つ学習ガイド記事一覧。スコア別の必要語彙数、Part 5 攻略法、忘却曲線を活用した暗記法、ビジネス英語頻出語彙などを体系的に解説しています。",
  alternates: {
    canonical: `${SITE_URL}/guide`,
  },
  openGraph: {
    title: "TOEIC 学習ガイド｜スコア別戦略・Part 別対策・語彙集",
    description:
      "TOEIC のスコアアップに役立つ学習ガイド記事を公開しています。語彙数の目安・派生語の覚え方・忘却曲線を踏まえた復習タイミングなど、現場で使えるノウハウをまとめています。",
    url: `${SITE_URL}/guide`,
    type: "website",
  },
};

export default function GuideIndexPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "TOP",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "学習ガイド",
        item: `${SITE_URL}/guide`,
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: GUIDE_ARTICLES.map((article, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/guide/${article.slug}`,
      name: article.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <nav className="mb-8 text-sm text-black/50 dark:text-white/50">
        <Link href="/" className="hover:underline">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <span>学習ガイド</span>
      </nav>

      <h1 className="mb-4 text-2xl font-bold">TOEIC 学習ガイド</h1>
      <p className="mb-10 text-sm leading-relaxed text-black/70 dark:text-white/70">
        TOEIC のスコアアップに直結する学習戦略・Part 別対策・語彙集をまとめた記事一覧です。当サイトの単語学習機能と組み合わせることで、効率的に目標スコアへ到達できる内容を順次公開していきます。
      </p>

      <ul className="space-y-6">
        {GUIDE_ARTICLES.map((article) => (
          <li
            key={article.slug}
            className="rounded-lg border border-black/10 p-5 transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
          >
            <Link href={`/guide/${article.slug}`} className="block">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-black/50 dark:text-white/50">
                <span className="rounded bg-black/5 px-2 py-0.5 dark:bg-white/10">
                  {article.category}
                </span>
                <span>約 {article.estimatedReadingMin} 分で読める</span>
                <span>更新日：{article.updatedAt}</span>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-black hover:underline dark:text-white">
                {article.title}
              </h2>
              <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
                {article.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs text-black/40 dark:text-white/40">
        記事は順次追加・更新しています。リクエストがあれば
        <Link
          href="/contact"
          className="ml-1 text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          お問い合わせ
        </Link>
        からお寄せください。
      </p>
    </>
  );
}
