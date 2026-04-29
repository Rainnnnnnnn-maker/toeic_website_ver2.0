import { getAllWords } from "@/data/words";
import { GUIDE_ARTICLES } from "@/data/guide-articles";

const BASE_URL = "https://www.toeic-words.com";
const WORD_LIST_LASTMOD = "2026-04-26";
const STATIC_PAGE_LASTMOD = "2026-04-26";

function formatLastmod(date: string): string {
  return new Date(date).toISOString();
}

const wordListLastmod = formatLastmod(WORD_LIST_LASTMOD);
const staticPageLastmod = formatLastmod(STATIC_PAGE_LASTMOD);
const guideLastmod = formatLastmod(
  GUIDE_ARTICLES.reduce(
    (latest, article) => article.updatedAt > latest ? article.updatedAt : latest,
    STATIC_PAGE_LASTMOD
  )
);

export async function GET() {
  const allWords = await getAllWords();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${wordListLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/words</loc>
    <lastmod>${wordListLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/study</loc>
    <lastmod>${wordListLastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/favorites</loc>
    <lastmod>${wordListLastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/today-words</loc>
    <lastmod>${wordListLastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/review</loc>
    <lastmod>${wordListLastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${staticPageLastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/guide</loc>
    <lastmod>${guideLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${BASE_URL}/privacy</loc>
    <lastmod>${staticPageLastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/terms</loc>
    <lastmod>${staticPageLastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <lastmod>${staticPageLastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`;

  for (const article of GUIDE_ARTICLES) {
    xml += `  <url>
    <loc>${BASE_URL}/guide/${article.slug}</loc>
    <lastmod>${formatLastmod(article.updatedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>
`;
  }

  for (const w of allWords) {
    xml += `  <url>
    <loc>${BASE_URL}/words/${w.slug}</loc>
    <lastmod>${wordListLastmod}</lastmod>
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
