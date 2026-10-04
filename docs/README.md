# Project Documentation

このディレクトリを、プロジェクト文書の正本として使用します。新しい文書を `.trae/` や `__docs__/` に作成しないでください。

## 構成

- `architecture.md` — 現在のアーキテクチャ、データフロー、API、開発規約
- `operations/` — 外部サービスの設定、デプロイ、運用手順、トラブルシューティング
- `specs/` — 機能単位の仕様書とチェックリスト
- `plans/` — 未完了または継続中の改善計画
- `reviews/` — コード・UI・設計レビューの記録
- `archive/` — 実装済み計画や完了した移行計画

## AdSense 再申請

- [改善計画](plans/adsense-reapplication-plan.md) — 有用性の低いコンテンツへの対応、優先順位、再申請の完了条件
- [再申請・導入手順](operations/google-adsense-guide.md) — 所有確認と広告掲載の運用

## テスト実行

- [Cypress E2E実行手順](operations/cypress-e2e.md) — お気に入り保存と今日おすすめの前後移動

## SEO・コンテンツ改善

- [SEO・コンテンツ改善計画](plans/seo-content-improvement-plan.md) — SEOの唯一の計画書。外部AI評価の検証、旧SEO監査（2026-07-21）の統合、Googlebot切断HTMLの再検証と再発時手順、維持すべき設計判断、優先順位と完了条件

## 管理ルール

1. 設計概要は `architecture.md`、機能の詳細仕様は `specs/`、操作・運用手順は `operations/` に集約し、概要文書からリンクします。同じ詳細を複数文書に転記しません。
2. 完了した計画は削除せず `archive/` へ移します。
3. 変更時は影響する文書を同じコミット・PRで更新します。`README.md` は概要・利用機能・セットアップ・コマンド、`architecture.md` は設計・データフロー・API・データモデル・キャッシュ・サーバー/クライアント境界が変わる場合に更新します。UI文言・見た目・内部リファクタリングは、記載が不正確になる場合だけ概要文書に反映します。`architecture.md` の「最終更新日」は本文変更時に更新し、日付だけの更新や軽微な変更の履歴追記は不要です。日常の変更履歴はGit・PRに残します。文書を追加・移動する場合はこの索引も更新します。ルールの正本は [`AGENTS.md`](../AGENTS.md#document-update-rule) です。
4. リポジトリ固有のエージェントスキルは `.agents/skills/` を正本とします。

- [コンテンツ確認記録と承認の手順](reviews/README.md)
