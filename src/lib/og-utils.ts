import { cacheLife, cacheTag } from "next/cache";

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
 * Google Fonts から `text` に含まれる字形だけをサブセットしたフォントを取得する。
 *
 * `'use cache'` は必須。`cacheComponents: true` の環境では、キャッシュされていない
 * fetch がひとつでも描画中に走るとルート全体が動的（ƒ）に落ちる。OG 画像ルートは
 * Satori のレイアウト計算と resvg による 1200x630 PNG のラスタライズを伴い、
 * 1 リクエストあたりの Active CPU が非常に大きいため、動的に落ちると Vercel の
 * Active CPU を直接焼く。ここをキャッシュ境界にすることで OG 画像ルートが
 * ビルド時にプリレンダリングされ、実行時の Function 呼び出しがゼロになる。
 *
 * この 'use cache' を外す場合は、`npm run build` のルート表で
 * `/opengraph-image` と `/words/[word]/opengraph-image` が ƒ に戻っていないか必ず確認すること。
 *
 * 注: Satori は woff2 を読めないため、format の照合は opentype / truetype に限定している。
 */
export async function loadGoogleFont(font: string, text: string) {
  "use cache";
  cacheTag("og-font");
  cacheLife("max");

  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const res = await fetch(resource[1]);
    return res.arrayBuffer();
  }

  throw new Error("failed to load font");
}
