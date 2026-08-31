import { cacheLife, cacheTag } from "next/cache";
import { HTTP_TIMEOUT_MS, fetchWithRetry } from "@/lib/http-retry";

/**
 * OG 画像レスポンスに付ける Cache-Control。
 *
 * `cacheComponents: true` の環境では metadata image route（opengraph-image）が
 * ビルド時にプリレンダリングされず、動的（ƒ）のままになる。データアクセスを一切持たない
 * 最小構成でも ƒ になることを実測で確認済み（prerender-manifest 上の OG ルートは 0 件）。
 * OG 画像 1 枚の生成は Satori のレイアウト計算 + resvg のラスタライズで Active CPU を大きく消費するため、
 * 何も対策しないとリクエスト数に比例して CPU が焼かれる。
 *
 * そこで CDN 側でレスポンスを保持し、Function 実行を「エッジごとに一度」まで畳む。
 * s-maxage は単語詳細キャッシュ（WORD_CACHE_TTL_DAYS 既定 30 日 / cacheLife("max")）と歩調を合わせ、
 * 期限切れ後も stale-while-revalidate で配信を止めない。
 */
export const OG_IMAGE_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400";

/**
 * Google Fonts から Satori が読める TTF を1件だけ取得し、全 OGP で共有する。
 *
 * Google Fonts の `text=` URL は指定文字列ごとに異なる一方、このサーバー向け
 * truetype レスポンスは実測上どの `text` でも同じフルフォントだった。そのため
 * `text` をキャッシュ引数にすると、約7MBの同一レスポンスが単語数ぶん Next.js の
 * fetch cache に複製され、Vercel の静的生成が OOM になる。
 *
 * `text` を送らない安定URLを `'use cache'` で共有し、全字形を含むフルフォントを
 * 1エントリだけ保持する。Satori は woff2 を読めないため、format の照合は
 * opentype / truetype に限定する。
 */
export async function loadGoogleFont(font: string) {
  "use cache";
  cacheTag("og-font");
  cacheLife("max");

  const url = `https://fonts.googleapis.com/css2?family=${font}`;
  const css = await fetchWithRetry<string>(url, {
    timeoutMs: HTTP_TIMEOUT_MS.font,
    label: "google fonts css",
    consume: (response) => response.text(),
  });
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    return await fetchWithRetry<ArrayBuffer>(resource[1], {
      timeoutMs: HTTP_TIMEOUT_MS.font,
      label: "google fonts binary",
      consume: (response) => response.arrayBuffer(),
    });
  }

  throw new Error("failed to load font");
}
