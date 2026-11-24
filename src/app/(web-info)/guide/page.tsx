import Link from "next/link";
import { getLatestGuideArticles } from "@/data/guide-articles";
import { serializeJsonLd } from "@/lib/json-ld";
import { createPublicPageMetadata } from "@/lib/public-page-metadata";

const SITE_URL = "https://www.toeic-words.com";

export const metadata = createPublicPageMetadata({
  pathname: "/guide",
  title: "TOEIC学習ガイド｜スコア別の単語学習・Part別対策",
  description:
    "TOEICの目標スコア別に単語を学ぶ順序、Part 5の自作例題、ビジネス英語の語彙、間隔を空けた復習の進め方を確認できる学習ガイドです。",
});

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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }}
      />

      <nav className="mb-8 text-sm text-black/50 dark:text-white/50">
        <Link prefetch={false} href="/" className="hover:underline">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <span>学習ガイド</span>
      </nav>

      <h1 className="mb-4 text-2xl font-bold">TOEIC 学習ガイド</h1>
      <p className="mb-10 text-sm leading-relaxed text-black/70 dark:text-white/70">
        目標スコア別の単語学習、Part 5の練習問題、間隔を空けた復習の進め方をまとめました。気になる語は
        <Link href="/words" prefetch={false} className="text-blue-600 underline dark:text-blue-400">TOEIC単語一覧</Link>
        で調べ、覚えた語は
        <Link href="/study" prefetch={false} className="text-blue-600 underline dark:text-blue-400">フラッシュカード</Link>
        で確認できます。
      </p>

      <ul className="space-y-6">
        {articles.map((article) => (
          <li
            key={article.slug}
            className="rounded-lg border border-black/10 p-5 transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
          >
            <Link prefetch={false} href={`/guide/${article.slug}`} className="block">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-black/50 dark:text-white/50">
                <span className="rounded-sm bg-black/5 px-2 py-0.5 dark:bg-white/10">
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
          prefetch={false}
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
