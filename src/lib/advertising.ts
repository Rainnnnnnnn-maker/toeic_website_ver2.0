/** 広告配信だけを制御する。検索公開や記事の公開状態には使わない。 */
export function isAffiliateAdvertisingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AFFILIATE_ADS_ENABLED === "true";
}

// AdSenseはmetaタグとads.txtで所有確認する。
// 承認・コンテンツ確認・配信地域の同意設定が整うまで配信コードは置かない。
