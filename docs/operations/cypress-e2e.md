# Cypress E2Eテスト

最終更新日: 2026-09-08

## CIと同じ構成で実行（シークレット不要）

```bash
npm ci
npm run typecheck:e2e
npm run test:e2e:ci
```

サーバー起動もこのコマンドが行う。`.env.local`・ローカル単語ファイル・外部サービスのキーは不要。通常の開発環境のファイルとキャッシュは変更しない。既定ブラウザは同梱Electron。Chromeがインストール済みなら `E2E_BROWSER=chrome npm run test:e2e:ci` でCIと同じブラウザを使える。

`cypress/scripts/run-ci.mjs` はアプリを一時ディレクトリへコピーし、許可したOS変数だけを引き継ぐ。共有node_modulesシンボリックリンクに対応するWebpackで本番ビルドし、空きポートで本番サーバーを起動、テスト終了後は停止・一時コピーを削除する。

`cypress/fixtures/words.json` の固定9語をテスト用HTTPから既存のBlob直接URL経路へ渡し、Redis SDKのGETへ固定解説を返す。未知のテスト用HTTP要求は失敗扱い。実際の単語ローダー・キャッシュ・日次選定・保存・画面遷移を使い、Gemini生成・本物のRedis／Blobへの接続を必要としない。ゲスト認証用URLもローカルを指定する。広告・解析の外部ホストはCI実行時のCypress設定で遮断する。

GitHub Actionsの `nodejs-e2e` はPR・push・手動実行時にChromeで実行し、15分でタイムアウトする。workflow全体の既存 `paths-ignore` は引き継ぐ。Cypress本体をキャッシュし、他ジョブではバイナリのダウンロードを省略する。失敗時は `cypress/results/` のビルド／サーバーログ・スクリーンショット・動画をartifactとして7日保存する。実サービスの接続確認とSupabase同期はこのCIの対象外。

## 実データを使うローカル実行

Node.js 24以上で `npm ci` を実行する（初回はCypress本体もダウンロードされる）。
既存の `.env.local` と `__words__/word.txt`・`word_mid.txt`・`word_high.txt` を準備する。
単語詳細は通常の `getWordDetail` 経由で取得するためRedis接続が必要で、未キャッシュの単語はGemini生成が発生する。ブラウザの `cy.intercept` でサーバー側の外部呼び出しは置き換えていない。

ターミナル1:

```bash
npm run dev -- --hostname 127.0.0.1
```

ターミナル2:

```bash
npm run typecheck:e2e
npm run test:e2e
```

画面を見ながらデバッグする場合は `npm run test:e2e:open`。
ポートが違う場合は `CYPRESS_BASE_URL=http://127.0.0.1:3001 npm run test:e2e`。
サーバーの起動・停止は実行者が行う。本番ビルドの確認には `npm run build` → `npm run start` でも同じテストを実行できる（単語一覧はBlobになる）。
Next.jsのdevサーバーは `localhost` と `--hostname` で指定したホスト以外のOriginからの `/_next` 開発リソースを既定で403にする。上記の `--hostname 127.0.0.1` を付けずに起動した `npm run dev`（エディタのプレビュー等）が3000番を使っていても動くよう、`next.config.ts` の `allowedDevOrigins` に `127.0.0.1` を登録している。これが無いとSSRだけで済む `today-navigation.cy.ts` は通るが、ハイドレーションが必要な `favorites.cy.ts` が失敗する。

## 検証範囲

- `favorites.cy.ts`: 未ログインの空状態から画面の星ボタンで追加し、再読み込み後も登録済みであることと一覧掲載を確認。一覧から詳細へ戻って削除し、詳細・一覧の再読み込み後も削除が維持されることを確認。別テストで、フィクスチャの3語を未ログインのお気に入りとしてlocalStorageに用意し、一覧の前方一致検索（大文字入力・完全一致・部分一致しないこと・0件時の空状態と検索クリア）を確認。
- `today-navigation.cy.ts`: `/today-words` に表示された順序を取得し、先頭から末尾、末尾から先頭へリンクで移動。各ページの見出し・URL・`from=today`・`picks` を確認し、先頭に前リンク、末尾に次リンクが存在しないこと、末尾で再読み込みしても順序が保持されることを確認。

Cypress標準のtest isolationで各テストのCookie・localStorage・sessionStorageを初期化する。テスト中のreloadでは保存を消さない。Cookie同意のみ「同意しない」を設定する。ログイン操作は行わず、Supabaseアカウントの同期・別端末確認は対象外。

Vitestの純粋ロジックテストとは分離し、通常のlint・unit test・typecheckも継続する。

## デプロイとの関係

`vercel.json` の `git.deploymentEnabled: true` によりGit連携は有効で、Production Branchへのpushで本番を自動デプロイする。手動Production workflowも併存する。今回追加したCIは独立したチェックであり、本番公開を自動で待機・停止させるものではない。必要な場合はGitHubのrequired checksやVercel Deployment Checksを別途設定する。

参考: [Vercel Git設定](https://vercel.com/docs/project-configuration/git-configuration)、[Deployment Checks](https://vercel.com/docs/deployment-checks)。

## 失敗時

`cypress/screenshots/` に失敗時の画面を保存する（Git管理対象外）。ページ取得や見出し表示で失敗した場合は、Next.jsターミナルでRedis／Gemini接続や単語ファイルを確認する。未処理例外の一律無視、固定秒数待ち、自動再試行による失敗の隠蔽は行わない。
