import type { Metadata } from "next";
import Link from "next/link";
import { getLatestGuideArticles } from "@/data/guide-articles";

const SITE_URL = "https://www.toeic-words.com";

export const metadata: Metadata = {
  title: "TOEIC 学習ガイド｜スコア別戦略・Part 別対策・語彙集",
  description:
    "TOEIC 学習の計画づくりに使えるガイド記事一覧。目標別の学習順、Part 5 対策、間隔を空けた復習、ビジネス英語の語彙などを解説しています。",
  alternates: {
    canonical: `${SITE_URL}/guide`,
  },
  openGraph: {
    title: "TOEIC 学習ガイド｜スコア別戦略・Part 別対策・語彙集",
    description:
      "TOEIC 学習の計画づくりに使えるガイドを公開しています。目標別の優先順位、派生語の覚え方、間隔を空けた復習の始め方などをまとめています。",
    url: `${SITE_URL}/guide`,
    type: "website",
  },
};

export default function GuideIndexPage() {
  // 更新日の新しい順（updatedAt desc → publishedAt desc）
  const articles = getLatestGuideArticles();

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
    itemListElement: articles.map((article, i) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
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
        学習計画・Part 別対策・語彙の整理方法をまとめた記事一覧です。当サイトの単語学習機能と組み合わせ、現在の弱点に合う方法を選ぶための参考としてご利用ください。
      </p>

      <ul className="space-y-6">
        {articles.map((article) => (
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
