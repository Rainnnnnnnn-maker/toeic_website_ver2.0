---
alwaysApply: true
---

# プロジェクトルール（toeic_website_ver2.0）

本ファイルは、本プロジェクトで開発・修正を行う際に必ず守るべきルールを定義します。
作業を開始する前に、必ず本ファイルを読み、関連ドキュメントを確認してから着手してください。

## 1. 着手前に必ず確認するドキュメント

修正・実装を開始する前に、以下のドキュメントを順に確認してください。

1. `.trae/documents/技術ドキュメント.md`
   - プロジェクト全体のアーキテクチャ・技術スタック・キャッシュ戦略・データフローを記載した一次資料。
   - 修正対象が触れる範囲を必ず先に把握すること。
2. `README.md`
   - 機能一覧・環境変数・API エンドポイント・ディレクトリ構成のサマリ。
3. `.trae/specs/`
   - 機能ごとの仕様書（例: `ga4-event-tracking`, `seo-enhancement`, `today-words-listen-mode`）。
   - 該当機能を触る場合は仕様書を必ず参照する。
4. `.trae/todo/` および `.trae/TODO_Refactoring1.md`
   - 進行中の TODO・リファクタリング計画。重複作業を避けるため必ず確認する。
5. `docs/review/` および `.trae/cache-tag-separation-and-isr-considerations.md`
   - 過去のレビュー結果・キャッシュ設計の検討メモ。

## 2. 技術スタックと前提

- **フレームワーク**: Next.js 16.2 (App Router, `reactCompiler: true`, `cacheComponents: true`)
- **言語**: TypeScript 5 系
- **UI**: React 19, Tailwind CSS 3.4, Lucide React
- **AI**: Google Gemini (`@google/genai`, モデル: `gemini-2.5-flash-lite`)
- **キャッシュ**: Upstash Redis（L2）+ Next.js Data Cache（L1）+ オンデマンド生成（L3）
- **ストレージ**: Vercel Blob（本番の単語リスト配信元）
- **音声**: Google Cloud Text-to-Speech（HTTP API）
- **デプロイ**: Vercel

詳細・バージョンは `.trae/documents/技術ドキュメント.md` を一次情報として参照すること。

## 3. ディレクトリ構成（要点）

- `src/app` … App Router のページ・API ルート・`opengraph-image.tsx` 等
- `src/actions` … Server Actions
- `src/components` … 機能別 (`features/words` 等) と共通 (`common/`)
- `src/lib` … Upstash クライアント、JSON-LD、OG 等のユーティリティ
- `src/data` … `words.ts`（ローカル/Blob 切替）、`word-detail.ts`（多層キャッシュ + Gemini）
- `src/hooks` … `useTTS` など
- `src/context` … `FavoritesContext`, `ShareTargetContext`
- `src/types` … 型定義（`WordDetails` 等）
- `__words__/` … 開発時の単語リスト（`word.txt` / `word_mid.txt` / `word_high.txt`）
- `public/` … 静的アセット
- `scripts/` … 補助スクリプト（例: `vercel-ignore.sh`）

## 4. コーディング・実装ルール

### 4.1 サーバ／クライアント境界
- サーバ専用モジュールには `import "server-only"` を付与し、誤って Client Component から import されないようにする。
- 環境変数（`GEMINI_API_KEY`・`TTS_API_KEY`・`UPSTASH_*`・`BLOB_*`・`REVALIDATION_TOKEN` 等）は必ずサーバ側でのみ参照する。`NEXT_PUBLIC_` 接頭辞を持つもののみクライアントで使用可。

### 4.2 キャッシュ戦略
- 単語詳細の取得は `getWordDetail`（多層キャッシュ）経由で行う。直接 Gemini を呼び出さない。
- Cache Component (`'use cache'` + `cacheLife(...)`) を採用しているため、引数のシリアライズ可能性・依存関係に注意する。
- キャッシュ無効化は `tag`（例: `word-list`）と既存の `/api/revalidate/*` エンドポイントの方針に従う。新規タグを追加する場合は技術ドキュメントを更新する。

### 4.3 単語データの取り扱い
- ローカルでは `__words__/*.txt`、本番では Vercel Blob を参照する分岐は `src/data/words.ts` に集約する。新たな取得経路を増やさない。
- 単語ファイルを更新する際は、対応する skill（`sort-words-alphabetically`, `deduplicate-high-mid-words`, `sync-words-from-blob`, `word-cleanup-expert`）を活用すること。

### 4.4 UI / アクセシビリティ
- Tailwind v3.4 を前提にユーティリティクラスで実装する。任意 CSS は最小限に留める。
- React Compiler が有効なため、不要な `useMemo` / `useCallback` は追加しない。
- ナビゲーションは `prefetch={false}` 方針（Vercel Edge Request 削減）を維持する。`WordLinkPending` などの既存パターンを踏襲すること。
- 詳細な UI/UX 設計は `ui-ux-expert` skill を活用する。

### 4.5 TTS / レート制限
- `/api/tts` のアロウリスト（単語キュレーション、`WordDetails` 上の例文一致）と Upstash Ratelimit（30 req/min/IP）を必ず維持する。
- Referer 偽装による Google Cloud TTS の不正消費を防ぐ責務がある点を理解した上で改修すること。

## 5. テスト方針

- 変更後は以下を必ずローカルで確認する：
  - `npm run lint`
  - `npm run build`（型チェックとプロダクションビルドの確認）
  - `npm run test`（Vitestによる自動テストの実行）
  - `npm run dev` で対象画面の動作確認

## 6. ドキュメント更新ルール

機能修正・追加・削除を行った場合は、以下を**同一コミットまたは同一 PR 内で**最新化する。

1. `README.md`（公開向けサマリ）
2. `.trae/documents/技術ドキュメント.md`（内部一次資料 / 「最終更新日」も更新）
3. 必要に応じて `.trae/specs/<feature>/` の仕様書

ドキュメント更新を伴わない機能変更は原則禁止。

## 7. Skills の活用

`.trae/skills/` 配下に登録された専門 skill を、対応するタスクで積極的に活用する。

- `toeic-app-expert` … 本アプリのアーキテクチャ・データフロー・開発ルールに関する質問・支援
- `nextjs-expert` … Next.js 16+ の実装相談・ベストプラクティス
- `ui-ux-expert` … UI/UX 設計・コンポーネント生成・アクセシビリティ
- `word-cleanup-expert` / `sort-words-alphabetically` / `deduplicate-high-mid-words` / `sync-words-from-blob` … 単語ファイルの整備・同期

## 8. Git / ブランチ運用

- コミットメッセージのスタイルは `.trae/rules/git-commit-message.md` に従う。
- 破壊的操作（`reset --hard`, `push --force`, ブランチ削除等）はユーザの明示指示がない限り行わない。

## 9. 秘密情報の取り扱い

- API キー・トークン類はコード／ドキュメント／コミットに含めない。`.env.local` でのみ管理する。
- ログ出力に環境変数の値を含めない。

## 10. 実装時の進め方（AIアシスタントの行動指針）

- **随時確認の徹底**: 毎回実装時、要件や仕様に不明点・曖昧な点がある場合は、独断で推測して進めるのではなく、**随時ユーザーに確認しながら実装を進める**ことを習慣化してください。
