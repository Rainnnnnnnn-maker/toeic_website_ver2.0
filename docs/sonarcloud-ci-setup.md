# SonarCloud を CI に追加する手順

> **方針**: 自前サーバー不要の **SonarCloud**（クラウド版・公開リポジトリは無料）を使う。  
> セルフホスト SonarQube より圧倒的に簡単で、GitHub Actions との公式連携もある。

---

## 目次

1. [SonarCloud アカウント作成 & プロジェクト登録](#1-sonarcloud-アカウント作成--プロジェクト登録)
2. [SONAR_TOKEN を GitHub Secrets に登録](#2-sonar_token-を-github-secrets-に登録)
3. [sonar-project.properties を追加](#3-sonar-projectproperties-を追加)
4. [(任意) カバレッジレポートを生成する](#4-任意-カバレッジレポートを生成する)
5. [CI ワークフローに SonarCloud スキャンを追加](#5-ci-ワークフローに-sonarcloud-スキャンを追加)
6. [動作確認](#6-動作確認)
7. [よくあるエラーと対処法](#7-よくあるエラーと対処法)

---

## 1. SonarCloud アカウント作成 & プロジェクト登録

### 1-1. サインアップ
1. [https://sonarcloud.io/](https://sonarcloud.io/) を開く
2. **「Log in with GitHub」** をクリック → GitHub アカウントで認証

### 1-2. Organization を作成（初回のみ）
1. ダッシュボード右上の **「+」→「Create new organization」**
2. **「Import from GitHub」** を選択
3. 対象リポジトリが属する GitHub Organization（または個人アカウント）を選択して **Grant** する
4. Plan は **Free** のまま続行

### 1-3. プロジェクトを登録
1. 「Analyze new project」をクリック
2. `toeic_website_ver2.0` リポジトリにチェックを入れ **「Set Up」**
3. Analysis Method: **「With GitHub Actions」** を選択
4. 画面に表示される **`SONAR_TOKEN`** の値をコピーしておく  
   （次のステップで使う）

---

## 2. SONAR_TOKEN を取得して GitHub Secrets に登録

### 2-1. SONAR_TOKEN の取得

トークンは以下の **3つのルート** のどれかで取得できる。上から順に試すこと。

---

#### ルート A: プロジェクト登録直後に表示される（初回のみ）

プロジェクトの Set Up 画面で Analysis Method を **「With GitHub Actions」** に設定すると、
そのページにそのまま `SONAR_TOKEN` の値が表示される。

> ⚠️ このページを閉じると二度と表示されないため、その場でコピーする。

---

#### ルート B: プロジェクトの Administration から再表示（プロジェクト登録済みの場合）

1. SonarCloud の対象プロジェクト（`toeic_website_ver2.0`）を開く
2. 上部メニュー **「Administration」（歯車アイコン）→「Analysis Method」**
3. **「With GitHub Actions」** を選択すると `SONAR_TOKEN` が再表示される

> ⚠️ **見つからない場合**: `Administration` メニューはプロジェクト画面にあり、Organization のトップ画面にある `Administration` とは別物。プロジェクトを開いた後に探すこと。

---

#### ルート C: Access Tokens ページで新規発行（上記で見つからない場合）

1. SonarCloud 右上のアカウントアイコン → **「My Account」**
2. 左メニュー **「Access Tokens」** をクリック
3. **「Generate Tokens」** セクションで Token Name を入力（例: `github-actions-ci`）→ **「Generate Token」**
4. 表示されたトークン値をコピー

> ⚠️ **「Make sure you copy it now, you won't be able to see it again!」** と表示される通り、**一度しか表示されない**。必ずコピーしてから画面を閉じること。

> **注意**: Personal Access Token は **60日間未使用で期限切れ**になる（Scheduled expiry として表示）。CI が定期的に動いていれば自動延長されるが、期限切れ後は再発行して GitHub Secrets を更新する必要がある。

---

### 2-2. GitHub Secrets に登録

1. GitHub リポジトリの **Settings → Secrets and variables → Actions**
2. **「New repository secret」**
   - Name: `SONAR_TOKEN`
   - Secret: 2-1 で取得したトークン値
3. **「Add secret」** で保存

> **CI ジョブに `environment: Production` がある場合**、リポジトリの Secrets だけでなく、その Environment の Secrets にも同じ `SONAR_TOKEN` を登録する必要がある（Settings → Environments → Production → Add secret）。

---

## 3. sonar-project.properties を追加

リポジトリルートに以下のファイルを作成する。  
`<YOUR_ORG>` と `<YOUR_PROJECT_KEY>` は SonarCloud の画面に表示された値に置き換える。

```properties
# sonar-project.properties

sonar.projectKey=Rainnnnnnnn-maker_toeic_website_ver2.0
sonar.organization=rainnnnnnnn-maker

# スキャン対象
sonar.sources=src
sonar.exclusions=**/*.test.ts,**/*.spec.ts,**/node_modules/**,**/.next/**,**/coverage/**,**/public/**

# テストファイル
sonar.tests=src
sonar.test.inclusions=src/lib/(tests)/**/*.test.ts

# TypeScript
sonar.typescript.tsconfigPath=tsconfig.json

# カバレッジ（手順4を実施した場合のみ有効化）
# sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

> **projectKey の確認方法**  
> SonarCloud の対象プロジェクトページ → **Information（右下）** → Project Key

---

## 4. (任意) カバレッジレポートを生成する

SonarCloud にカバレッジを送ると品質ゲートに活用できる。

> **✅ 実施済み** — 以下は実際に行った手順の記録。

### 4-1. パッケージ追加

```bash
npm install --save-dev @vitest/coverage-v8
```

### 4-2. vitest.config.ts を編集

サーバー依存でテスト不可のファイル（`json-ld.ts` / `og-utils.ts` / `upstash.ts` / `wordCache.ts`）はカバレッジ対象から除外した。

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/lib/(tests)/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text"],
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/(tests)/**",
        "src/lib/json-ld.ts",
        "src/lib/og-utils.ts",
        "src/lib/upstash.ts",
        "src/lib/wordCache.ts",
      ],
    },
  },
});
```

### 4-3. package.json にスクリプト追加

```json
"test:coverage": "vitest run --coverage"
```

実行すると `coverage/lcov.info` が生成される（`coverage/` は `.gitignore` 除外済みのため Git 管理外）。

### 4-4. sonar-project.properties のコメントを外す

手順 3 で作成する `sonar-project.properties` 内の以下の行を有効にする。

```properties
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

---

## 5. CI ワークフローに SonarCloud スキャンを追加

`.github/workflows/ci.yml` の既存ジョブ (`ci`) の末尾に以下のステップを追記する。

```yaml
      # ── SonarCloud ─────────────────────────────────────────────────────────
      # test:coverage で lcov.info を生成してから SonarCloud にアップロードする（手順4実施済み）
      - name: SonarCloud Scan
        uses: SonarSource/sonarqube-scan-action@v5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### 追記後の全体イメージ

```yaml
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run typecheck --if-present
      - run: npm run test:coverage --if-present   # カバレッジ込みテスト（手順4実施済み）
      #- run: npm run build

      # SonarCloud Scan（上記ステップの後に追加）
      - name: SonarCloud Scan
        uses: SonarSource/sonarqube-scan-action@v5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

> `sonarqube-scan-action@v5` は SonarCloud・SonarQube 両対応の公式アクション。  
> `sonar-project.properties` を自動で読み込むため、追加の引数は不要。

---

## 6. 動作確認

1. 変更をプッシュ（または PR を作成）
2. GitHub Actions → CI ワークフローの **SonarCloud Scan** ステップが緑になることを確認
3. SonarCloud ダッシュボードでスキャン結果（Bugs / Vulnerabilities / Code Smells / Coverage）を確認
4. PR の場合、SonarCloud が **PR コメント**と **Checks** に結果を自動投稿する

---

## 7. よくあるエラーと対処法

| エラー | 原因 | 対処 |
|---|---|---|
| `SONAR_TOKEN is not set` | Secrets 未登録 or environment 指定漏れ | 手順 2 を再確認。ジョブに `environment: Production` がある場合、そこにも Secrets を追加 |
| `Project not found` | projectKey / organization が間違い | SonarCloud の Project Information ページと sonar-project.properties を照合 |
| `No coverage report found` | lcov.info が生成されていない | `npm run test:coverage` が実行されているか、`coverage/lcov.info` のパスが合っているか確認 |
| Quality Gate: Failed | コード品質しきい値超過 | SonarCloud → Quality Gates で条件を確認・緩和、またはコードを修正 |

---

## まとめ（最小手順）

```
1. sonarcloud.io でプロジェクト登録 → SONAR_TOKEN 取得
2. GitHub Secrets に SONAR_TOKEN を登録
3. sonar-project.properties をルートに追加（projectKey・organization を記入）
4. ci.yml に SonarCloud Scan ステップを追記
5. プッシュして動作確認
```

カバレッジ連携（手順 4）は実施済み。`npm run test:coverage` で `coverage/lcov.info` が生成され、SonarCloud にカバレッジが送信される。
