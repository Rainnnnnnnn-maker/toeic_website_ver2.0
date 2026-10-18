# Blob障害時の単語ページ継続表示（単語コーパスのフォールバック）実装計画

作成日：2026-10-18（JST）  
状態：未着手（設計のみ。実装は未開始）  
確認したコード：Git HEAD `94daf0e`、作業ツリーは変更なし

## 目的

Vercel Blob から単語リストを取得できないときでも、単語詳細ページ（`/words/[word]`）とその周辺を 500 にしない。取得に失敗したら、検証済みの前回コーパスか同梱スナップショットへ切り替える。本番で観測された 2 件の 500 の再発を防ぐ。

## 結論

- 実行時だけ「Blob → 検証 → 前回正常コーパス（Redis）→ 同梱スナップショット → それでも駄目なら例外」の順に試す。
- `next build` 中はフォールバックせず、今どおりビルドを失敗させる。
- 2 段階で実装する。Phase 1（同梱スナップショット＋検証）だけで 500 は止まる。Phase 2（Redis の前回正常コーパスと E2E）は鮮度と回帰テストのための追加分。

| | 内容 | 目安（テスト込み、生成 JSON を除く） |
|---|---|---|
| Phase 1 | 検証、同梱スナップショット、フォールバック時の短いキャッシュ、ビルドは失敗のまま、ユニットテスト、ドキュメント | 約 250 行 |
| Phase 2 | Redis の前回正常コーパス、E2E（Blob を 503 にした回帰テスト） | 約 150〜200 行 |

## 原因の分析

### コードから確定していること

- `src/data/words.ts` の `getWordsData()`（`'use cache'` + `cacheLife('max')`）は、`src/lib/word-source.ts` の `loadWordDataFromBlob()` が失敗すると例外をそのまま投げる。空リストを最大 30 日キャッシュしないための意図的な設計（`docs/architecture.md` 履歴 3.9）。
- `__words__/*` は `.gitignore` 対象。Vercel のビルド・実行環境には、Blob の代わりに読める単語リストが存在しない。
- 実行時に `getWordsData()` まで到達する経路:
  - `/words/[word]` 本文の `WordDetailFetcher`。`getRelatedWords()` が `connection()` を呼ぶため、Suspense 内はリクエストごとに描画される。
  - `/words/[word]/opengraph-image`。Cache Components 環境では常に動的（ファイル内コメント参照）。
  - コーパスに無いスラッグ（`dynamicParams` は既定の `true`）。本来は 404 だが、Blob 障害中は `getWordBySlug()` が例外を投げて 500 になる。
  - ビルド後に追加された単語、`/api/tts` の許可リスト確認、`/api/revalidate/word`、`/api/sitemap`。

### Next.js 16.3 のドキュメントから確定していること

`node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md` の「Runtime caching considerations」による:

- 標準の `'use cache'` はメモリ上の LRU。サーバーレスでは、エントリーがリクエストをまたいで残らないのが普通で、再検証中も残らない。ビルド時のキャッシュは通常どおり使われる。
- このため `word-source.ts` のコメントにある「バックグラウンド再検証の失敗時は直前の正常キャッシュが使われ続ける」は、Vercel の実行時には当てにできない。新しいインスタンスに来たリクエストは毎回 Blob を読みに行く。

### 推定（未確認）

- 観測された 2 件の 500 がどのパスだったかは、まだ確認していない。最有力は「単語ページ本文」と「OG 画像」、または「存在しないスラッグ」。
- PPR の再開（resume）時に、プリレンダー時のキャッシュが `WordDetailFetcher` 内の `getWordsData()` 呼び出しまで覆うかどうかは未検証。覆わない前提で設計する。

## 設計

### フォールバックの順序

```
実行時:   Blob ──検証OK──▶ 採用（cacheLife 'max'）
           │ 失敗 / 検証NG
           ▼
          前回正常コーパス（Redis, Phase 2）──検証OK──▶ 採用（cacheLife 'minutes'）
           │ 無い / 失敗 / 検証NG
           ▼
          同梱スナップショット ──検証OK──▶ 採用（cacheLife 'minutes'）
           │ 検証NG（通常は起きない）
           ▼
          元の Blob のエラーを投げる

ビルド時: Blob ──検証OK──▶ 採用 / 失敗・検証NG ──▶ 例外（ビルド失敗。今と同じ）
```

### 設計上の決定

1. **フォールバックはアプリ側（`src/data/`）だけに置き、`src/lib/word-source.ts` は変えない。**
   - `scripts/embed-words.ts` は、Blob を完全に読めたときだけ不要なベクトルを削除する。
   - `scripts/audit-word-content.ts` も Blob の現物を前提にしている。
   - CLI が古いコーパスを黙って読むと、ベクトルの誤削除につながる。
2. **ビルド中は失敗させる。**
   - 古いコーパスで約 1,420 の静的ページを焼き込まないため。失敗しても、前のデプロイが動き続ける。
   - E2E の `fixture.assertUsed()`（Blob を実際に読んだかの確認）も意味を保てる。
   - 判定は `process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD`（`next/constants`）で行う。`next build` は静的生成ワーカーを起動する直前にこの値を設定している（`node_modules/next/dist/build/index.js`）。
3. **フォールバックした結果は短くキャッシュする。**
   - `cacheLife` は分岐ごとに呼び分けられる（cacheLife.md「Conditional cache lifetimes」）。
   - フォールバック時は `cacheLife('minutes')`（stale 5 分、revalidate 1 分、expire 1 時間）を使う。
   - expire が 5 分以上なので、プリレンダーから外れる「短命キャッシュ」には当たらない。
4. **Blob から取れた結果も検証する。**
   - 200 で返ってきた HTML のエラーページや空ファイルが、30 日キャッシュされる穴も一緒に塞ぐ。
5. **スナップショットはリポジトリにコミットする。**
   - ビルド時の生成（`prebuild`）は使えない。E2E の `cypress/scripts/run-ci.mjs` が `next build` を直接起動するため、npm の `prebuild` が走らない。
   - 生成したファイルを `.gitignore` に入れると、typecheck・lint・テストで import 先が無くなる。

### 検証ルール（`validateWordData`）

構造だけを見る。件数の割合チェックは入れない。

| ルール | 理由 |
|---|---|
| 3 レベルすべてが 1 語以上 | 欠損ファイル・空ファイルを弾く |
| どの語にも `<` `>` `{` `}` を含まない | HTML・JSON のエラー本文がそのままパースされたものを弾く |
| どの語も 64 文字以下 | 壊れた本文を弾く。現行の最長語は `state-of-the-art`（16 文字、ローカルの `__words__` で確認） |

割合チェック（例：スナップショットの 50% 以上）を入れない理由は 2 つ。

- E2E のテスト用データは 9 語しかない。割合で弾くと、ビルド時に失敗するか、実行時にスナップショットへ切り替わって E2E が落ちる。
- 正当な大規模削除まで弾いてしまう。

### 状態をログに出す

- フォールバックを採用したら `console.error("[word-list] degraded", { source, version, reason })` を出す。`reason` は元のエラーの `name`、`message`、`status`。環境変数の値は出さない。
- ビルド時に Blob の版とスナップショットの版が違えば `console.warn("[word-list] snapshot is stale", { blobVersion, snapshotVersion })` を出す。失敗にはしない。E2E のビルドはテスト用の 9 語を読むので必ずこの警告が出るが、想定どおりで無視してよい。

## Phase 1：同梱スナップショットと検証

### 変更するファイル

| ファイル | 種別 | 内容 |
|---|---|---|
| `src/lib/word-corpus.ts` | 新規 | 純粋なロジック。`server-only` も `"use client"` も付けない |
| `src/lib/(tests)/word-corpus.test.ts` | 新規 | Vitest |
| `src/data/word-corpus-snapshot.json` | 新規 | 生成物。手で編集しない |
| `src/data/word-corpus-fallback.ts` | 新規 | `import "server-only"`。スナップショットの読み込み（Phase 2 で Redis を追加） |
| `src/data/words.ts` | 変更 | フォールバックの振り分け、`cacheLife` の分岐、ビルド中の判定 |
| `scripts/snapshot-words.ts` | 新規 | スナップショットの生成 CLI（`server-only` は import しない） |
| `package.json` | 変更 | `"snapshot:words": "tsx --env-file=.env.local scripts/snapshot-words.ts"` |
| `src/lib/word-source.ts` | コメントのみ | 58 行目付近の「直前の正常キャッシュが使われ続ける」を、サーバーレスでは成り立たない旨に直す |

### `src/lib/word-corpus.ts`（純粋なロジック）

```ts
export type WordCorpusSource = "blob" | "last-good" | "snapshot";

/** コミット・Redis 保存に使う形。語順は Blob と同一に保つ（前後ナビが allWords の順序を使うため）。 */
export type WordCorpusSnapshot = {
  schemaVersion: 1;
  version: string;          // getWordListVersion(allWords)
  generatedAt: string;      // ISO 8601
  important: string[];      // term（表記そのまま）
  medium: string[];
  high: string[];
};

export type WordCorpusValidation = { ok: true } | { ok: false; reason: string };

export function validateWordData(data: WordData): WordCorpusValidation;

/** WordData → スナップショット。term を Blob の順序のまま並べる。 */
export function createWordCorpusSnapshot(data: WordData, generatedAt: string): WordCorpusSnapshot;

/**
 * unknown（JSON / Redis の値）→ WordData。形が違う、版が一致しない、検証 NG なら null。
 * 再構築には既存の parseWords(terms.join("\n"), level) と buildWordData を使い、正規化を Blob 経路と揃える。
 */
export function parseWordCorpusSnapshot(value: unknown): WordData | null;

/**
 * 読み込み関数を注入して順に試す。I/O を持たないのでユニットテストできる。
 * primary が失敗・検証 NG で、allowFallback が false なら primary のエラーを投げる。
 */
export async function resolveWordCorpus(options: {
  loadPrimary: () => Promise<WordData>;
  fallbacks: ReadonlyArray<{ source: Exclude<WordCorpusSource, "blob">; load: () => Promise<WordData | null> }>;
  allowFallback: boolean;
}): Promise<{ data: WordData; source: WordCorpusSource; primaryError?: unknown }>;
```

- `getWordListVersion()` と `parseWords()`・`buildWordData()` は `src/lib/word-select.ts` の既存の関数を使う。同じ処理を書き直さない。
- 型だけを import する。`WordData` は `@/lib/word-select` から、`Word` は `@/data/words` から型として。

### `src/data/word-corpus-fallback.ts`

```ts
import "server-only";
import snapshotJson from "./word-corpus-snapshot.json";
// 初回呼び出し時に parseWordCorpusSnapshot して、モジュールのスコープでメモ化する。
export async function loadSnapshotWordData(): Promise<WordData | null>;
```

- JSON の import は `src/data/word-editorial.ts` と同じやり方（`resolveJsonModule` は有効）。
- サーバーのバンドルに約 20KB 増える。クライアントから届かないことを `server-only` で保証する。

### `src/data/words.ts` の変更

```ts
async function getWordsData(): Promise<LoadedWordData> {
  'use cache';
  cacheTag('word-list');

  const source = resolveDefaultWordSource();
  const result = await resolveWordCorpus({
    loadPrimary: () => loadWordData(source),
    fallbacks: [{ source: "snapshot", load: loadSnapshotWordData }],   // Phase 2 で last-good を先頭に追加
    allowFallback: source === "blob" && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD,
  });

  if (result.source === "blob") {
    cacheLife('max');
    // ビルド時だけ、スナップショットとの版のずれを警告する
  } else {
    cacheLife('minutes');
    console.error("[word-list] degraded", { ... });
  }
  return { ...result.data, source: result.source };
}
```

- 戻り値は `WordData & { source: WordCorpusSource }`。シリアライズできる値だけにする。`getAllWords()` などの公開 API の形は変えない。
- 開発時（`source === "local"`）はフォールバックしない。今の挙動のまま。
- `getTodayRecommendedSelection()` も、`data.source !== "blob"` のときは `cacheLife('minutes')` にする。1 回の呼び出しで `cacheLife` が 1 回だけ実行されるよう、データ取得の後に分岐させる。

### `scripts/snapshot-words.ts`

- `loadWordData("blob")` → `validateWordData` → `createWordCorpusSnapshot` → `src/data/word-corpus-snapshot.json` に書き出す（2 スペースインデント、末尾に改行）。
- 既存ファイルと `version` が同じなら書き換えない。`generatedAt` だけの差分を作らないため。
- `--check`：書き込まず、ずれていれば終了コード 1。CI にはシークレットが無く Blob を読めないので、CI には組み込まない。
- `scripts/embed-words.ts` と同じく、Blob の認証情報を事前に確認する。

### ユニットテスト（`src/lib/(tests)/word-corpus.test.ts`）

- `validateWordData`：正常、空のレベル、HTML の行、`{` を含む行、長すぎる語。
- `createWordCorpusSnapshot` → `parseWordCorpusSnapshot` の往復で、語順・レベル・`allWords` が元と一致する。
- `parseWordCorpusSnapshot`：`schemaVersion` 違い、版の不一致、配列でない、検証 NG → `null`。
- `resolveWordCorpus`：
  - primary が成功
  - primary が例外 → 最初の有効なフォールバック
  - primary が検証 NG → フォールバック
  - フォールバックが `null` や例外を返す → 次へ
  - すべて失敗 → primary のエラーを投げる
  - `allowFallback: false` → フォールバックを呼ばずに primary のエラーを投げる

## Phase 2：前回正常コーパス（Redis）と E2E

### 前回正常コーパス

- キー：`wordlist:lkg`（`WordCorpusSnapshot` の JSON）と `wordlist:lkg:version`（版の文字列）。期限なし。
- 書き込み：実行時に Blob の取得と検証が成功したら、`wordlist:lkg:version` を GET する。違っていればパイプラインで 2 キーを SET する。失敗しても無視する（`console.warn`）。
  - ビルド時は書かない。本番の実行時の初回読み込みで入るので十分。
  - E2E のビルドでテスト用 Redis に予期しないコマンドを送らないため。
- 読み込み：`fallbacks` の先頭に `{ source: "last-good", load: loadLastGoodWordData }` を入れる。`getRedis()` のタイムアウト（3 秒）と再試行の方針（AGENTS.md「Outbound Timeouts and Retries」）に従う。
- コスト：新しいインスタンスでの読み込み 1 回ごとに GET 1 回。SET はコーパスが変わったときだけ。

### E2E

- `cypress/scripts/fixture-server.mjs`
  - Blob を 503 に切り替える `failBlob()` を足す。
  - `wordlist:lkg*` の GET と SET（パイプライン）を受け付け、SET された値をメモリに保持して GET で返す。今は `word:` 以外の GET で例外を投げ、`assertUsed()` が失敗する。
- `cypress/scripts/run-ci.mjs`：通常の Cypress 実行の後に `failBlob()` を呼ぶ。続けて、新しい `next start` に対して次の 3 つを確認する。
  - `/words/<固定語>/opengraph-image` → 200
  - `/words/<固定語>` → 200（本文あり）
  - `/words/not-a-real-word` → 404
- 期待値：
  - 通常の Cypress 実行中、実行時の初回読み込みでテスト用の 9 語がテスト用 Redis の `wordlist:lkg` に保存される。
  - Blob を落とした後の新しい `next start` は、その 9 語を前回正常コーパスとして復元する。
  - 誤ってスナップショット（本番の語）が使われたら、固定語の不一致で検出できる。
- `docs/operations/cypress-e2e.md` を更新する。

## 実装の手順

0. **修正前に再現する（推奨）。** 下の「手動確認の手順」を今の `main` で行い、どのパスが 500 になるかを記録する。観測された 2 件のパスかログの文言が分かれば、ここで突き合わせる。
1. `src/lib/word-corpus.ts` とテストを書く（`npm run test`）。
2. `scripts/snapshot-words.ts` と `package.json` のスクリプトを足し、`npm run snapshot:words` で JSON を生成してコミットする。
3. `src/data/word-corpus-fallback.ts` を書き、`src/data/words.ts` を変更する。`word-source.ts` のコメントを直す。
4. `npm run lint`、`npm run test`、`npm run build`。ビルドで約 1,420 ページ生成されることと、版のずれの警告が出ないことを確認する。
5. 手動確認（下記）。
6. ドキュメントを更新する（下記）。
7. （Phase 2）Redis の前回正常コーパスと E2E。

## 手動確認の手順

```bash
npm run build
```

```bash
BLOB_URL_IMPORTANT=http://127.0.0.1:9/important BLOB_URL_MEDIUM=http://127.0.0.1:9/medium BLOB_URL_HIGH=http://127.0.0.1:9/high npm run start
```

- ポート 9 への接続はすぐ拒否されるので、Blob 障害を素早く再現できる。シェルの環境変数は `.env.local` より優先される。
- 本番で `BLOB_URL_*` を使わず `list()` を使っている場合は、`BLOB_READ_WRITE_TOKEN` を無効な値にして同じ確認をする。

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/words/approve/opengraph-image
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/words/not-a-real-word
```

```bash
curl -s http://localhost:3000/words/approve | grep -c "内容の誤りを報告"
```

| 確認項目 | 修正前（予想） | 修正後（期待） |
|---|---|---|
| OG 画像 | 500 | 200 |
| 存在しないスラッグ | 500 | 404 |
| 既存単語のページ本文 | 500、または本文が出ない | 200 で本文あり |
| サーバーログ | `word list blob (...)` の失敗 | `[word-list] degraded { source: "snapshot" }` |

あわせて、Blob が落ちたまま `npm run build` するとビルドが失敗すること（今と同じ）も確認する。ビルドには Blob へのネットワーク接続が必要で、AGENTS.md「Build Troubleshooting」の再試行の上限に従う。

## 完了条件

- [ ] 実行時に Blob が失敗しても、既存単語のページ・OG 画像が 200、存在しないスラッグが 404 になる。
- [ ] フォールバック中は `[word-list] degraded` がログに出て、`cacheLife('minutes')` で 1 分後に Blob を再試行する。
- [ ] Blob が落ちていると `next build` は今どおり失敗する。
- [ ] `embed:words` と `audit:content` の挙動は変わらない。
- [ ] `npm run lint`、`npm run test`、`npm run build`、CI の E2E が通る。
- [ ] 下記のドキュメントが更新されている。

## 更新するドキュメント

- `AGENTS.md`
  - 「Word List Data Flow」：「do not add any other data loading path」の例外として、実行時のフォールバック、ビルド時は失敗させること、スナップショットの更新ルールを書く。
  - 「Commands」：`snapshot:words` を足す。
  - 「Testing」のテスト一覧：`word-corpus` を足す。
- `docs/architecture.md`：単語リストのデータの流れとキャッシュの方針。
- `README.md`：コマンドの一覧に `snapshot:words` を足す。
- `.agents/skills/sync-words-from-blob/SKILL.md`：同期の後に `npm run snapshot:words` を実行してコミットする手順を足す。
- 完了したら、本書を `docs/archive/plans/` へ移し、`docs/README.md` の索引を直す。

## 未決事項

1. **観測された 2 件の 500 のパスとログの文言。** Vercel のログで確認できれば、手順 0 の再現結果と突き合わせる。
2. **本番の取得方式。** `BLOB_URL_*` の直接 URL か `list()` か。手動確認の手順が変わる。
3. **実行時の再試行回数。**
   - 今は 1 回あたり 8 秒のタイムアウトで計 3 回試すため、フォールバックまで最大約 25 秒かかる（`/words/[word]` の `maxDuration` は 60 秒）。
   - 実行時だけ 1 回に減らすなら、`loadWordData` に再試行回数のオプションを足す必要がある。`word-source.ts` に手が入るので、Phase 1 では見送る案を既定とする。
4. **Phase 2 に着手する時期。**
   - Phase 1 だけで困るのは、「Blob の単語リストを更新したのにスナップショットを更新し忘れ、さらにその間に Blob が落ちた」場合だけ。
   - そのときは、新しく足した単語が一時的に 404 になる。

## 意図的に対象外とするもの

- 開発時（`NODE_ENV=development`）に `__words__/*.txt` が無いときの挙動。今は警告を出して空リストになる。
- 単語詳細（Gemini・Redis）の障害対策。別の経路で、`WordDetailFetcher` はすでに失敗時のメッセージを出している。
- 標準の `'use cache'` から `'use cache: remote'` への移行。課金と遅延が増えるため、本計画では採らない。
