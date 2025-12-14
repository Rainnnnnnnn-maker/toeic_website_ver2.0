## 目的
- 初回クリック時にGeminiから単語詳細JSONを生成し、表示と同時にUpstashへ保存
- 2回目以降はUpstashから即取得してGemini呼び出しを回避（30日TTL）
- 失敗時のフェイルセーフ（Gemini/Upstashの各失敗に対するリカバリ）と整合性維持

## 変更対象
- `src/app/api/words/[word]/route.ts`：Gemini呼び出し前にUpstashキャッシュ参照→ヒットなら即返却／ミス時は生成して保存
- 新規：`src/lib/upstash.ts`：Upstash Redisクライアント初期化（環境変数読取）
- 新規：`src/lib/wordCache.ts`：キャッシュI/Oのユーティリティ（取得・保存・キー生成・TTL設定）
- 新規：ユニットテスト（Vitest導入）：`src/__tests__/wordCache.test.ts` 他
- `package.json`：`@upstash/redis` と `vitest` を追加、`test`スクリプト定義
- `.env.local`：Upstash接続情報とTTL設定を追加

## 環境変数（.env.local）
- `UPSTASH_REDIS_REST_URL`：Upstash REST URL
- `UPSTASH_REDIS_REST_TOKEN`：Upstash REST Token
- `WORD_CACHE_TTL_DAYS=30`（任意、未設定なら30日をデフォルト）

## Upstashクライアント初期化（`src/lib/upstash.ts`）
- `import { Redis } from '@upstash/redis'`
- `const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })`
- サーバー専用モジュールとしてエクスポート

## キャッシュユーティリティ（`src/lib/wordCache.ts`）
- キー方針：`word:<lowercased-term>`（例：`word:increase`）。英字以外や空白は`trim().toLowerCase()`、Unicodeはそのまま保持
- TTL：`ex = 60 * 60 * 24 * (WORD_CACHE_TTL_DAYS || 30)`
- API：
  - `getWordDetails(word: string): Promise<WordDetails | null>`：`redis.get(key)`→文字列なら`JSON.parse`して型ガード
  - `setWordDetails(word: string, data: WordDetails): Promise<void>`：`JSON.stringify(data)`して`redis.set(key, json, { ex })`
- ヘッダー用フラグ返却も可能（HIT/MISS）

## APIルート改修（`src/app/api/words/[word]/route.ts`）
- 現行のGemini呼び出し前に`getWordDetails(entry.term)`を実行
  - ヒット時：`Response.json(cached, { headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=3600' } })`
  - ミス時：既存ロジックでGemini生成→正規化→`setWordDetails(entry.term, data)`→`X-Cache: MISS`で返却
- Upstash障害時（接続失敗/パース失敗）：ログヘッダー`X-Cache: BYPASS`を付与し、Gemini生成にフォールバック
- Gemini失敗時：現行のエラーハンドリングを踏襲（500返却）。Upstashに不完全データは保存しない
- 追加ヘッダー：`X-Cache`（HIT/MISS/BYPASS）、既存`X-Generation-Time`はMISS時のみ付与

## エラーハンドリング
- Upstash：接続エラー/タイムアウト時は例外をキャッチしてBYPASS、リクエストは継続
- データ整合性：キャッシュ取得時に必須フィールドの型チェック（最低限`word`, `meanings`の配列など）。不正なら破棄してMISS扱い
- Gemini：JSON抽出/正規化は既存関数で統一し、保存前に同じ構造に整形

## ユニットテスト（Vitest）
- 対象：`wordCache.ts` と ルートのキャッシュ分岐ロジック
- ケース：
  - ヒット時にGemini呼び出しが行われない（モックで検証）
  - ミス時に保存が行われる（`redis.set`呼び出し）
  - 不正キャッシュ（型不整合）はMISS扱い
  - Upstash例外はBYPASS扱いで成功応答を維持
- セットアップ：`vitest` + `ts`、`package.json`に`"test": "vitest run"`

## 成功基準の検証
- 同一単語2回目以降のアクセスで`X-Cache: HIT`かつ`X-Generation-Time`が付与されない（Gemini未実行）
- 計測：`X-Generation-Time`比較でレスポンス時間50%以上短縮（HIT時はほぼ0ms〜数ms）
- データ整合性：正規化後の`WordDetails`のみを保存・返却してUI描画が同一（`WordDetailClient.tsx`での表示変化なし）

## 影響範囲
- クライアント側（`WordDetailClient.tsx`）の変更不要。APIのJSONスキーマは維持
- 依存追加：`@upstash/redis`/`vitest`。ランタイムはサーバー関数のみで使用

## ロールアウト手順
1. 依存追加・環境変数設定（本番/開発）
2. `upstash.ts`/`wordCache.ts`作成
3. ルート改修・ヘッダー付与
4. ユニットテスト作成・実行
5. 実測確認（HIT/MISS、時間短縮）

## 注意点
- 秘密情報（API/Token）はリポジトリに含めない
- TTLは環境変数で調整可能にし、将来の運用変更に対応
- キーの正規化で同義語や大文字違いによるキャッシュミスを防止