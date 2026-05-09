import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GUIDE_ARTICLES,
  getAllGuideSlugs,
  getGuideArticleBySlug,
  type ArticleBlock,
  type GuideArticle,
} from "@/data/guide-articles";

const SITE_URL = "https://www.toeic-words.com";

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getGuideArticleBySlug(slug);
  if (!article) {
    return { title: "記事が見つかりません" };
  }
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `${SITE_URL}/guide/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${SITE_URL}/guide/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

function renderBlock(block: ArticleBlock, idx: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={idx}
          className="mt-10 mb-3 border-b border-black/10 pb-1 text-xl font-bold dark:border-white/10"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={idx} className="mt-6 mb-2 text-base font-semibold">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={idx} className="my-3 leading-relaxed">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={idx} className="my-3 list-inside list-disc space-y-1">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={idx} className="my-3 list-inside list-decimal space-y-1">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      );
    case "callout": {
      const toneClass =
        block.tone === "warning"
          ? "border-amber-400 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
          : block.tone === "tip"
            ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
            : "border-blue-400 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10";
      return (
        <div
          key={idx}
          className={`my-4 rounded border-l-4 p-4 text-sm ${toneClass}`}
        >
          {block.text}
        </div>
      );
    }
    case "table":
      return (
        <div key={idx} className="my-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/20 dark:border-white/20">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-black/10 dark:border-white/10"
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "wordLinks":
      return (
        <div key={idx} className="my-4 text-sm">
          {block.intro && (
            <p className="mb-2 text-black/70 dark:text-white/70">
              {block.intro}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {block.words.map((w) => (
              <Link
                key={w}
                href={`/words/${w}`}
                className="rounded border border-black/15 px-2 py-1 font-mono text-xs hover:border-blue-500 hover:text-blue-600 dark:border-white/20 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                {w}
              </Link>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

function RelatedArticles({ article }: { article: GuideArticle }) {
  const related =
    article.relatedSlugs
      ?.map((s) => GUIDE_ARTICLES.find((a) => a.slug === s))
      .filter((a): a is GuideArticle => Boolean(a)) ?? [];
  if (related.length === 0) return null;
  return (
    <section className="mt-12 border-t border-black/10 pt-6 dark:border-white/10">
      <h2 className="mb-4 text-lg font-semibold">関連する学習ガイド</h2>
      <ul className="space-y-3">
        {related.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/guide/${r.slug}`}
              className="block rounded border border-black/10 p-3 hover:border-blue-500 dark:border-white/10 dark:hover:border-blue-400"
            >
              <p className="text-sm font-semibold">{r.title}</p>
              <p className="mt-1 text-xs text-black/60 dark:text-white/60">
                {r.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getGuideArticleBySlug(slug);
  if (!article) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TOP", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "学習ガイド",
        item: `${SITE_URL}/guide`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/guide/${article.slug}`,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}/guide/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: "TOEIC重要単語",
      url: SITE_URL,
    },
    author: {
      "@type": "Organization",
      name: "TOEIC重要単語 編集チーム",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <nav className="mb-8 text-sm text-black/50 dark:text-white/50">
        <Link href="/" className="hover:underline">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <Link href="/guide" className="hover:underline">
          学習ガイド
        </Link>
        <span className="mx-2">/</span>
        <span className="line-clamp-1">{article.title}</span>
      </nav>

      <article className="text-sm text-black/85 dark:text-white/85">
        <header className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-black/50 dark:text-white/50">
            <span className="rounded bg-black/5 px-2 py-0.5 dark:bg-white/10">
              {article.category}
            </span>
            <span>約 {article.estimatedReadingMin} 分で読める</span>
            <span>公開日：{article.publishedAt}</span>
            {article.updatedAt !== article.publishedAt && (
              <span>更新日：{article.updatedAt}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold leading-snug">{article.title}</h1>
          <p className="mt-3 leading-relaxed text-black/70 dark:text-white/70">
            {article.description}
          </p>
        </header>

        <div>{article.blocks.map((b, i) => renderBlock(b, i))}</div>
      </article>

      <RelatedArticles article={article} />

      <div className="mt-10 text-center">
        <Link
          href="/guide"
          className="text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← 学習ガイド一覧に戻る
        </Link>
      </div>
    </>
  );
}
