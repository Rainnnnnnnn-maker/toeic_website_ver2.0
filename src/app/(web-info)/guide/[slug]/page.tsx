import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllGuideSlugs,
  getGuideArticleBySlug,
  type ArticleBlock,
  type GuideArticle,
  type GuideSource,
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
    notFound();
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
    case "exercise":
      return (
        <section key={idx} className="my-5 rounded-xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-800 dark:bg-blue-950/20" aria-label="練習問題">
          <h3 className="font-semibold leading-relaxed">{block.question}</h3>
          <ol className="my-3 grid list-none gap-2 sm:grid-cols-2">
            {block.options.map((option, optionIndex) => (
              <li key={optionIndex} className="rounded border border-black/10 bg-white p-2 dark:border-white/20 dark:bg-slate-900">
                <span className="mr-2 font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>{option}
              </li>
            ))}
          </ol>
          <details className="rounded border border-blue-200 bg-white p-3 dark:border-blue-800 dark:bg-slate-900">
            <summary className="cursor-pointer font-semibold text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300">答えと理由を確認</summary>
            <p className="mt-3 leading-relaxed">{block.explanation}</p>
          </details>
        </section>
      );
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
        <div key={idx} className="my-4 overflow-x-auto" tabIndex={0} role="region" aria-label="比較表（横にスクロールできます）">
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
              prefetch={false}
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
      ?.map((s) => getGuideArticleBySlug(s))
      .filter(
        (a): a is GuideArticle => a !== undefined,
      ) ?? [];
  if (related.length === 0) return null;
  return (
    <section className="mt-12 border-t border-black/10 pt-6 dark:border-white/10">
      <h2 className="mb-4 text-lg font-semibold">関連する学習ガイド</h2>
      <ul className="space-y-3">
        {related.map((r) => (
          <li key={r.slug}>
            <Link
              prefetch={false}
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

function ArticleSources({ sources }: { sources: GuideSource[] }) {
  return (
    <section className="mt-12 border-t border-black/10 pt-6 dark:border-white/10">
      <h2 className="mb-4 text-lg font-semibold">参考資料</h2>
      <ul className="space-y-3 text-sm">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {source.title}
            </a>
            <span className="text-black/60 dark:text-white/60">
              {` — ${source.publisher}`}
              {source.note ? `（${source.note}）` : ""}
            </span>
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
    citation: article.sources?.map((source) => source.url),
    publisher: {
      "@type": "Organization",
      name: "TOEIC重要単語",
      url: SITE_URL,
    },
    author: {
      "@type": "Person",
      name: "Rain",
      url: `${SITE_URL}/about#operator`,
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
        <Link prefetch={false} href="/" className="hover:underline">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <Link prefetch={false} href="/guide" className="hover:underline">
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
            <Link
              prefetch={false}
              href="/about#operator"
              className="text-blue-600 underline dark:text-blue-400"
            >
              編集・公開責任者：Rain
            </Link>
          </div>
          <h1 className="text-2xl font-bold leading-snug">{article.title}</h1>
          <p className="mt-3 leading-relaxed text-black/70 dark:text-white/70">
            {article.description}
          </p>

        </header>

        <div>{article.blocks.map((b, i) => renderBlock(b, i))}</div>
      </article>

      {article.sources && article.sources.length > 0 && (
        <ArticleSources sources={article.sources} />
      )}

      <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-semibold">読んだ内容を練習する</h2>
        <p className="mt-2 leading-relaxed">記事で迷った単語を一つ選び、例文を確認してお気に入りへ保存。次に開くときは、意味を見る前に思い出してみましょう。</p>
        <div className="mt-3 flex flex-wrap gap-4">
          <Link href="/words" prefetch={false} className="text-blue-700 underline dark:text-blue-300">単語を探す</Link>
          <Link href="/favorites" prefetch={false} className="text-blue-700 underline dark:text-blue-300">お気に入りを確認</Link>
          <Link href="/about#editorial-policy" prefetch={false} className="text-blue-700 underline dark:text-blue-300">編集・確認方針</Link>
          <Link href="/contact" prefetch={false} className="text-blue-700 underline dark:text-blue-300">内容の誤りを報告</Link>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">記事の作成・改訂にAIを利用しています。専門家による監修済みとは表示していません。例文・練習問題は学習用の自作で、公式の試験問題ではありません。</p>
      </section>

      <RelatedArticles article={article} />

      <div className="mt-10 text-center">
        <Link
              prefetch={false}
          href="/guide"
          className="text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← 学習ガイド一覧に戻る
        </Link>
      </div>
    </>
  );
}
