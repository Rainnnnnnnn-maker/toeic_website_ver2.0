# TODO: セマンティック検索（意味で探す）リリース手順

`feature/semantic-search` ブランチの実装は完了しています。以下は **Rain さんの作業** が必要な項目です。上から順に進めてください。

## 1. Upstash Vector インデックスの作成（必須・最初にやる）

- [X] [Upstash Console](https://console.upstash.com/) → Vector → **Create Index**
  - **Dimensions: `768`**（後から変更不可。`gemini-embedding-001` の出力次元と一致させる）
  - **Metric: `Cosine`**
  - リージョンは既存の Redis と同じ（またはVercelのリージョンに近い場所）を推奨
- [X] 作成後に表示される REST URL / Token を控える

## 2. 環境変数の設定

- [X] `.env.local` に追加:

  ```
  UPSTASH_VECTOR_REST_URL=<作成したインデックスのREST URL>
  UPSTASH_VECTOR_REST_TOKEN=<作成したインデックスのREST Token>
  ```
- [X] Vercel のプロジェクト設定（Production / Preview 両方）にも同じ2変数を追加

## 3. embedding の初回投入（バックフィル）

- [X] まず dry-run でキャッシュ状況とドキュメントテキストを確認:

  ```bash
  npm run embed:words -- --dry-run
  ```
- [X] 少数で動作確認（Vector Console の Data Browser で20件入ることを確認）:

  ```bash
  npm run embed:words -- --limit=20
  ```
- [X] 全量投入（2026-07-30 の dry-run 時点で **全1,369語が Redis キャッシュ済み（missing: 0）** だったため、Gemini 生成は走らず embedding のみ。数分で完了する見込み。失敗した単語は再実行で自動リトライされます）:

  ```bash
  npm run embed:words
  ```
- [X] 最後に表示される `index vector count` が単語数（約1,300）と一致することを確認

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

- **スコア閾値の調整**: 既定値 `0.82`（`SEMANTIC_SEARCH_MIN_SCORE` で変更可能）。全量インデックスの実検索ログと目視評価を基に、再現率を落としすぎない範囲で調整する。
- **検索結果キャッシュ**: TTLは7日だが、Vector更新後は `semsearch:index-version` が増分され、旧世代の `semsearch:v3:*` は即時参照されなくなる。top-K候補へ現在の閾値を毎回適用するため、閾値変更時の手動パージも不要。旧キーはTTLで自然削除される。
- **クエリの embedding コスト**: 1検索 = embedding 1回（キャッシュミス時のみ）。GA4 の `semantic_search` は検索語本文を送らず、`query_length` と `result_count` だけで利用量をウォッチする。
