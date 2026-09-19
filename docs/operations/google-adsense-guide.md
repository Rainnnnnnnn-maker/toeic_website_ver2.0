# Google AdSense 再申請・導入の手順

最終更新日：2026-09-19

現在の却下理由は「有用性の低いコンテンツ」。まず[改善計画](../plans/adsense-reapplication-plan.md)のチェックリストを完了する。タグ設置やデプロイだけを理由に再申請しない。

## 現在の実装

- `src/app/layout.tsx` に所有確認用 `google-adsense-account` メタタグがある。
- `public/ads.txt` は設置済み。管理画面のパブリッシャーIDとの一致を確認する。
- Google広告スクリプトは撤去済み。承認後に確認済みページへの配置を設計・検証する。
- `NEXT_PUBLIC_ADSENSE_REVIEW` は廃止。広告停止による単語noindex・sitemap除外は行わない。
- A8は `NEXT_PUBLIC_AFFILIATE_ADS_ENABLED=true` の場合だけ表示（既定OFF）。
- 下書きガイドは公開lookupから除外し、直接URLでもnotFound。
- [確認記録の運用](../reviews/README.md)でAI照合と人による確認を区別する。

## 再申請

1. 改善計画の内容確認・検証を完了し、本番に反映する。
2. [AdSense](https://www.google.com/adsense) の「サイト」で `toeic-words.com` を開く。
3. 画面で提示される所有確認方法を選ぶ。広告コード以外にmetaタグ・ads.txtによる確認があるため、実際の案内に従う。
4. 所有確認、必要なアカウント設定、本番のコンテンツ表示を確認する。
5. 再申請可能日の表示があれば従い、審査をリクエストする。実施日と変更内容を記録する。
6. 管理画面で結果を確認する。通常数日、場合によって2〜4週間かかる。[Google公式手順](https://support.google.com/adsense/answer/7584263?hl=en)

## 承認後

確認済みの編集コンテンツを中心に広告を配置する。自動広告は無条件にONにせず、対象・除外ページ・モバイル表示・操作ボタン付近の配置を確認する。直接アクセスとSPA遷移の両方で、学習画面、ログイン画面、確認待ち記事、エラー画面に意図しない広告が出ないか確認する。

noindexは検索公開の制御であり、AdSense審査からの除外指定ではない。承認後に品質・公開方針を元に戻す運用は行わない。

## 現在の進捗

2026-09-19確認時点で改訂版の本番反映と修正15語のL1／Vector更新は完了。lint・307件のテスト・本番ビルド成功。再申請はまだ行っていない。残項目は[人による内容確認](../reviews/adsense-human-review.md)、Google公開URLテストの結果確認、AdSense管理画面の所有確認状態と再申請。詳細は改善計画の実施記録を参照。
