# TODO: セマンティック検索（意味で探す）リリース手順

`feature/semantic-search` ブランチの実装は完了しています。以下は **Rain さんの作業** が必要な項目です。上から順に進めてください。

## 1. Upstash Vector インデックスの作成（必須・最初にやる）

- [ ] [Upstash Console](https://console.upstash.com/) → Vector → **Create Index**
  - **Dimensions: `768`**（後から変更不可。`gemini-embedding-001` の出力次元と一致させる）
  - **Metric: `Cosine`**
  - リージョンは既存の Redis と同じ（またはVercelのリージョンに近い場所）を推奨
- [ ] 作成後に表示される REST URL / Token を控える

## 2. 環境変数の設定

- [ ] `.env.local` に追加:

  ```
  UPSTASH_VECTOR_REST_URL=<作成したインデックスのREST URL>
  UPSTASH_VECTOR_REST_TOKEN=<作成したインデックスのREST Token>
  ```

- [ ] Vercel のプロジェクト設定（Production / Preview 両方）にも同じ2変数を追加

## 3. embedding の初回投入（バックフィル）

- [ ] まず dry-run でキャッシュ状況とドキュメントテキストを確認:

  ```bash
  npm run embed:words -- --dry-run
  ```

- [ ] 少数で動作確認（Vector Console の Data Browser で20件入ることを確認）:

  ```bash
  npm run embed:words -- --limit=20
  ```

- [ ] 全量投入（2026-07-30 の dry-run 時点で **全1,369語が Redis キャッシュ済み（missing: 0）** だったため、Gemini 生成は走らず embedding のみ。数分で完了する見込み。失敗した単語は再実行で自動リトライされます）:

  ```bash
  npm run embed:words
  ```

- [ ] 最後に表示される `index vector count` が単語数（約1,300）と一致することを確認

## 4. ローカルでの手動スモークテスト（`npm run dev` は Rain さんが起動）

- [ ] `/words` で「意味で探す」タブに切り替え、「延期する」で postpone / delay 系がヒットする
- [ ] 「謝罪メールで使う単語」のような場面クエリでもそれらしい結果が出る
- [ ] 結果カードから `/words/[slug]` に遷移できる
- [ ] 同じクエリを2回検索し、2回目が速い（DevTools でレスポンスの `cached: true` を確認）
- [ ] 「英単語で探す」タブに戻して既存の前方一致・`*` 検索が壊れていない
- [ ] （任意）`UPSTASH_VECTOR_REST_URL` を一時的に外して「準備中」表示（503）になることを確認

## 5. マージ & デプロイ

- [ ] `npm run build` をローカルで実行して成功を確認（CI では build は走らない）
- [ ] PR 作成 → Vercel Preview でも動作確認（Preview に env が入っていること）
- [ ] 本番デプロイ（manual workflow_dispatch）

## 6. 運用ルール（覚えておく）

- **単語詳細を再生成したら embedding も更新する**: 今後 `/api/revalidate/word` を叩くときは `&vector=true` を付けると、パージ後の最新内容で embedding が再upsertされる（`upstash=true` と併用すると Gemini 完全再生成 → その内容で embedding 更新）:

  ```
  GET /api/revalidate/word?token=<TOKEN>&slug=<slug>&upstash=true&vector=true
  ```

- **単語リストに単語を追加/削除したら**: 追加分は `npm run embed:words` を再実行（キャッシュ済みはスキップされ、差分だけ生成・upsert される）。削除した単語のベクトルは Upstash Console から手動削除するか、当面は残っていても検索結果のリンク先が404になるだけなので後回しでも可。

## 検討事項（今回は見送り・様子見）

- **スコア閾値**: 現状は topK=10 を全件返している（閾値なし）。実データで「無関係な結果が混ざる」と感じたら `src/lib/semantic-search.ts` に最低スコアのフィルタを追加する（Upstash の cosine スコアは 0〜1）。
- **検索結果キャッシュの寿命**: 現在7日（`SEMANTIC_CACHE_TTL_SECONDS`）。単語リストを大きく変えた直後は古い結果が返り得る。気になる場合は Redis の `semsearch:v1:*` キーを削除。
- **クエリの embedding コスト**: 1検索 = embedding 1回（キャッシュミス時のみ）。無料枠で十分だが、GA4 の `semantic_search` イベントで利用量をウォッチする。
