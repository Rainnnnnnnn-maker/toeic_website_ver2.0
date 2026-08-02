import Script from "next/script";
import { isAdsenseReviewMode } from "@/lib/adsense-review";

export const ADSENSE_CLIENT_ID = "ca-pub-3016015645741811";

/**
 * Google 広告を掲載するページだけで呼び出す。
 *
 * 審査中は ads.txt と google-adsense-account メタタグで所有確認を行い、
 * 広告スクリプト自体は読み込まない。承認後もこのコンポーネントを置いた
 * 編集コンテンツ（TOP / 学習ガイド）だけが広告配信候補になる。
 */
export function AdSenseScript() {
  if (isAdsenseReviewMode()) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
