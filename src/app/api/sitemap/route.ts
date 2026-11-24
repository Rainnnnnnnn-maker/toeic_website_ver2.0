import { getAllWords } from "@/data/words";
import { getLatestGuideArticles, getPublishedGuideArticles } from "@/data/guide-articles";

const BASE_URL = "https://www.toeic-words.com";
const publishedGuideArticles = getPublishedGuideArticles();

function formatLastmod(date: string): string {
  return new Date(date).toISOString();
}

// /guide は公開記事を更新日の新しい順に並べ、各記事の更新日も表示する。
// 記事を更新すると一覧の内容も変わるため、最新記事の updatedAt を一覧の lastmod にする。
const latestGuideUpdatedAt = getLatestGuideArticles(1)[0]?.updatedAt;
const guideIndexLastmodTag = latestGuideUpdatedAt
  ? `\n    <lastmod>${formatLastmod(latestGuideUpdatedAt)}</lastmod>`
  : "";

export async function GET() {
  const allWords = await getAllWords();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/words</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/study</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/today-words</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/today-words/listen</loc>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/guide</loc>${guideIndexLastmodTag}
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${BASE_URL}/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`;

  for (const article of publishedGuideArticles) {
    xml += `  <url>
    <loc>${BASE_URL}/guide/${article.slug}</loc>
    <lastmod>${formatLastmod(article.updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>
`;
  }

  // 単語ページは <lastmod> を出力しない。
  // 全 1,300 語で同一かつ固定の lastmod を出すと、Google は lastmod 自体を信用しなくなり
  // クロール効率に悪影響が出る。単語詳細の実更新日を管理する仕組みが無いため、
  // 誤った日付を出すより省略するほうが正しい（lastmod は sitemap の任意項目）。
  for (const w of allWords) {
    xml += `  <url>
    <loc>${BASE_URL}/words/${w.slug}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate",
    },
  });
}
