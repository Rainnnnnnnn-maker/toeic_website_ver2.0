// AdSense審査モード。有効化すると以下がまとめて切り替わる:
//   1. 単語詳細ページ (/words/[word]) に robots noindex を付与
//   2. sitemap.xml から単語詳細URLを除外
//   3. A8アフィリエイトバナーを非表示
//   4. TOP・学習ガイドでAdSenseスクリプトを読み込まない
// Server Component / Client Component / Route Handler のどこからでも
// 同じ値を参照できるよう NEXT_PUBLIC_ プレフィックスを使う(秘密情報ではない)。
// 値はビルド時にインライン化されるため、切り替えには再デプロイが必要。
export function isAdsenseReviewMode(): boolean {
  const value = process.env.NEXT_PUBLIC_ADSENSE_REVIEW;
  return value === "1" || value === "true";
}
