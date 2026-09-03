---
name: "toeic-app-expert"
description: "toeic_website_ver2.0 固有の設計・実装・デバッグを、現行ドキュメントとコードに沿って支援します。キャッシュ、単語データ、認証・お気に入り、復習、TTS、意味検索を扱うときに使用してください。"
---

# TOEIC App Expert

`toeic_website_ver2.0` 専用の開発支援スキルです。固定された知識だけで判断せず、最初にリポジトリ直下の `AGENTS.md` を読み、必要に応じて `docs/README.md` から現行仕様・運用手順へ進んでください。ドキュメントと実装が食い違う場合は、関連コードとテストを確認して差分を明示します。

## 現行アーキテクチャ

- Next.js 16.2 App Router、React 19、TypeScript strict、Tailwind CSS 3.4。React Compiler が有効なため、手動の `useMemo` / `useCallback` は原則追加しません。
- 単語一覧は `src/lib/word-source.ts` に集約されています。開発時は `__words__/word*.txt`、本番は Vercel Blob を読み、`src/data/words.ts` が `cacheTag('word-list')` と `cacheLife('max')` でキャッシュします。
- 単語詳細の入口は `src/data/word-detail.ts:getWordDetail()` のみです。L1 Next.js Data Cache → L2 Upstash Redis → Gemini 生成の順で、L1 は `cacheLife('max')`、L2 は `WORD_CACHE_TTL_DAYS` を使います。Client Component からは `src/actions/word.ts:fetchWordDetail()` を利用します。
- 今日の6単語は `getTodayRecommendedSelection()` が JST 日付キーとコーパス版を含めて決定し、Vercel Cron が更新します。静的生成される `/words/[word]` の到達経路から日次選定関数を呼んではいけません。
- 認証とユーザーデータは Supabase を使います。ゲストのお気に入りは `localStorage`、ログイン中は RLS で保護した Supabase が正本です。`/mypage`、お気に入り復習、聞き流しの認証・同期条件は `AGENTS.md` の現行ルールを確認してください。
- 復習ルールは `src/lib/review-schedule.ts`、永続化は `src/lib/review-progress-repo.ts` と `src/hooks/useReviewProgress.ts`、再送制御は `src/lib/review-progress-outbox.ts` に分離されています。
- TTS API は登録単語または単語詳細内の完全一致例文だけを許可します。`TTS_API_KEY` は `x-goog-api-key` ヘッダーでのみ送信し、キャッシュ・レート制限・上流エラー処理の既存境界を維持します。
- 意味検索は Gemini Embedding（768次元・L2正規化）と Upstash Vector を使用します。純粋ロジックは `src/lib/semantic-search.ts`、API は `src/app/api/search/semantic/route.ts` です。
- 外部HTTPのタイムアウト・再試行・エラー分類は `src/lib/http-retry.ts` が唯一の方針です。429は再試行せず、Route Handler では上流エラーを `classifyUpstreamFailure()` で変換します。

## 実装時の重要ルール

- 単語詳細生成で Gemini を直接呼ばず、必ず `getWordDetail()` 系の既存入口を使います。
- secrets やサーバー専用APIに触れるアプリ側モジュールには `import "server-only"` を付けます。ただし `scripts/` から使う共有CLIモジュールには付けません。
- Supabase の service-role key をクライアント、`NEXT_PUBLIC_*`、ログ、コミットへ出しません。認可境界は RLS です。
- 単語ファイルを変更する前に、該当する同期・整列・重複除去スキルを読みます。
- 純粋ロジックは `src/lib/` に置いて Vitest で検証し、外部サービスや React UI は手動スモークテストで確認します。
- 機能変更では `README.md` と `docs/architecture.md`（最終更新日を含む）を同時に更新し、影響する仕様書・運用ガイドも同期します。

## 検証

通常は `npm run lint`、`npm run test`、`npm run build`、対象機能の手動確認を行います。ビルドが停止・失敗した場合の再試行上限や Blob ネットワーク依存は、必ず `AGENTS.md` の Build Troubleshooting に従ってください。
