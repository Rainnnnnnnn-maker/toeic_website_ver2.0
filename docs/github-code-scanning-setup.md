# GitHub Code Scanning（CodeQL）導入手順

このプロジェクト（Next.js / TypeScript）に GitHub Code Scanning を導入し、CI で自動化するための手順をまとめる。

Code Scanning（CodeQL）は GitHub ネイティブの SAST。検出結果はリポジトリの **Security → Code scanning alerts** タブに集約され、Pull Request 上にもインラインでアラート表示される。すでに導入済みの SonarCloud とは別系統で、両立して問題ない。

---

## 方法A: Default setup（UI だけで完結・最速）

リポジトリ管理者権限があれば、ワークフローを書かずに有効化できる。

1. GitHub のリポジトリ → **Settings** → **Code security and analysis**（または **Advanced Security**）
2. **Code scanning** の項目で **Set up** → **Default** を選択
3. 言語（JavaScript/TypeScript）が自動検出されるので **Enable CodeQL** をクリック

これで `push`（main）と `pull_request` で自動的にスキャンが走る。**パブリックリポジトリは無料**、プライベートは GitHub Advanced Security のライセンスが必要。

> まず試すならこれが最速。後から Advanced に切り替え可能。

---

## 方法B: Advanced setup（ワークフローで制御・推奨）

スキャン対象パス・スケジュール・クエリスイートを細かく制御したい場合はワークフローファイルを置く。既存の `ci.yml` とは**別ファイル**にするのが定石（CodeQL は専用の権限・実行モデルを使うため）。

`.github/workflows/codeql.yml` を新規作成する。

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 22 * * 1'  # 毎週月曜 JST 7:05 付近、定期フルスキャン

jobs:
  analyze:
    name: Analyze (${{ matrix.language }})
    runs-on: ubuntu-latest
    permissions:
      security-events: write   # SARIF アップロードに必須
      actions: read
      contents: read
    strategy:
      fail-fast: false
      matrix:
        language: [javascript-typescript]

    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: security-and-quality   # 既定より厳しめ。security-extended でも可

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

JS/TS はインタープリタ言語なのでビルド不要。`autobuild` ステップは事実上スキップされるので、外して `init` → `analyze` だけにしても動く。

---

## 導入後の運用設定

1. **必須チェック化（任意）**: Settings → **Branches** → main の保護ルールで *Require status checks* に `CodeQL` を追加すると、アラートのある PR をマージブロックできる。
2. **アラート確認**: **Security** タブ → **Code scanning** で重大度別に一覧表示。PR には差分行へインラインコメントが付く。
3. **誤検知の抑制**: 各アラートから *Dismiss*（false positive / won't fix）を選択。

---

## このプロジェクトでの注意点

- **`paths-ignore` は付けない**: 既存 `ci.yml` は `**.md` を除外しているが、CodeQL はコード全体を解析するので除外不要。
- **SonarCloud との関係**: Sonar も脆弱性を見るが、CodeQL は GitHub の Security タブ／PR アラートに統合される点が強み。両立可能で、用途が重複しても害はない。Sonar の SAST 結果を SARIF で Code Scanning に流すことも可能だが、まずは CodeQL を独立で入れるのが素直。
- `package.json` に lockfile があるので CodeQL の依存解決もスムーズ。

---

## クエリスイートの選択肢

`queries:` に指定できる主なスイート。

| 値 | 内容 |
|---|---|
| （未指定） | デフォルトの security クエリのみ。誤検知少なめ |
| `security-extended` | デフォルト + 精度がやや低いが網羅性の高いセキュリティクエリ |
| `security-and-quality` | security-extended + コード品質クエリ。最も網羅的 |

最初は `security-and-quality` で始め、ノイズが多ければ `security-extended` や未指定に下げる運用が扱いやすい。
