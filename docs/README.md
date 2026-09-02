# Project Documentation

このディレクトリを、プロジェクト文書の正本として使用します。新しい文書を `.trae/` や `__docs__/` に作成しないでください。

## 構成

- `architecture.md` — 現在のアーキテクチャ、データフロー、API、開発規約
- `operations/` — 外部サービスの設定、デプロイ、運用手順、トラブルシューティング
- `specs/` — 機能単位の仕様書とチェックリスト
- `plans/` — 未完了または継続中の改善計画
- `reviews/` — コード・UI・設計レビューの記録
- `archive/` — 実装済み計画や完了した移行計画

## 管理ルール

1. 現行仕様は `architecture.md` に書き、操作手順は `operations/` に分離します。
2. 完了した計画は削除せず `archive/` へ移します。
3. 機能変更時は `README.md` と `architecture.md` の「最終更新日」を同じ変更で更新します。
4. リポジトリ固有のエージェントスキルは `.agents/skills/` を正本とします。
