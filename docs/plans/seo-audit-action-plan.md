# SEO 監査レポート & 対応アクションプラン

> 対象サイト: `https://www.toeic-words.com`（Rainnnnnnnn-maker/toeic_website_ver2.0）
> 目標: 検索クエリ **「TOEIC 重要単語」で Google 上位表示**
> 監査日: 2026-07-21 (JST)
> 監査方法: 本番サイトへの curl による User-Agent A/B テスト（計 15 ページ以上）+ ソースコード精査 + SERP サンプル調査
> 前提環境: Next.js 16.2.6 (`cacheComponents: true`) + React 19 + Vercel

---

## 0. エグゼクティブサマリ

on-page SEO（タイトル・meta description・構造化データ・コンテンツ量・内部リンク）は**すでに競合と戦える高水準**にある。SERP サンプル調査でも `/words` が 4 位相当、トップページが 7 位相当に既にランクインしている。

しかし本番サイトの実測で、**致命的な配信レイヤーの問題**を発見した:

> **Googlebot（desktop / mobile 両方）だけが、単語詳細ページ約 1,369 件で「h1・単語解説・構造化データが一切ない、`</html>` すら欠けた切断 HTML」を受信している。**

ビルド時の SSG プリレンダーは健全で、ブラウザにも Bingbot にも完全な HTML が返る。壊れているのは Googlebot 向けのレンダリング経路だけ。これが解消されない限り、メタデータや文言の微調整をいくら重ねても効果は限定的。**P0 を最優先で対応すること。**

| 優先度 | 項目 | 期待効果 |
|---|---|---|
| 🔴 P0 | Googlebot への切断 HTML 配信の解消 | 1,369 ページのインデックス品質が正常化。最大のレバー |
| 🟡 P1 | sitemap の noindex 除外・lastmod 省略 / robots.txt 残骸削除 | クロール効率・シグナル整合の改善 |
| 🟢 P2 | /study の h1 追加、構造化データの型修正、内部リンク強化 | 積み上げ改善 |

> **実装ステータス（2026-07-21）**
> - ❌ **P0 Phase A（`htmlLimitedBots` 上書き）は撤回・リバート済み**。Next.js ソース精査で**本問題に無効**と判明（詳細は §1-5a）。P0 は**未修正・調査中**。
> - ✅ **P1（確定・反映済み）** sitemap から `noindex` ページ除外（`/favorites`・`/review`）/ 実更新日不明 URL の `lastmod` 省略（全単語・`/today-words`）/ `public/robots.txt` 削除
> - ⏸️ **サイト名統一は撤回**（§2-2 参照。既存順位保護の意図的設計と判明したため実施しない）
> - ⬜ **P0 の次の一手 = ローカル再現（§1-5b Phase B）**で Next.js 起因か Vercel 起因かを切り分け → 恒久対応（§1-5c Phase C）。**P2** も未着手

---

## 1. 🔴 P0: Googlebot だけがコンテンツ空の切断 HTML を受信している

### 1-1. 実測エビデンス（2026-07-21）

同一ページに対して UA だけを変えて本番を取得した結果:

| テスト対象 | UA | x-vercel-cache | 応答 | h1 | `</html>` |
|---|---|---|---|---|---|
| /words/complex | ブラウザ (Chrome) | **PRERENDER** | 168 KB 完全 | ✅ | ✅ |
| /words/former | **Googlebot desktop** | **BYPASS** | **46 KB 切断** | ❌ | ❌ |
| /words/former（直後） | ブラウザ | HIT | 159 KB 完全 | ✅ | ✅ |
| /words/handful | **Googlebot mobile**（主クローラー） | **BYPASS** | **47 KB 切断** | ❌ | ❌ |
| /words/capable, subsequent, vicinity ほか | Googlebot desktop | BYPASS | 46〜47 KB 切断 | ❌ | ❌ |
| /words/phase | Bingbot | BYPASS | 162 KB 完全 | ✅ | ✅ |
| /words/fabric | Slackbot | BYPASS | 155 KB 完全 | ✅ | ✅ |
| /words/zoology, walk-in | ブラウザ | PRERENDER | 完全 | ✅ | ✅ |
| /study | Googlebot | BYPASS | 40 KB 切断 | ❌ | ❌ |
| /（ホーム）, /words, /guide, /guide/*, /about | Googlebot | HIT | 完全 | ✅ | ✅ |

ランダム抽出 10 単語の Googlebot テストでは **8/10 が切断**（残り 2 件は直近アクセスでエッジキャッシュが温かく HIT だっただけ）。

### 1-2. 挙動の整理

1. **ビルド時 SSG プリレンダーは健全**（ブラウザの初回アクセスは `PRERENDER` で完全 HTML）。
2. **bot からのアクセスはプリレンダーをバイパスして動的レンダリングになる**（`BYPASS`）。これは PPR/cacheComponents の「bot には完全な HTML を一発で返す」仕様に由来する挙動。
3. その動的レンダリングが、**Googlebot 向けだけ約 1 秒で途中終了**する。静的シェル（ヘッダー・meta・スケルトン）のみ送信され、Suspense 境界の中身（h1、単語解説、`DefinedTerm` / `BreadcrumbList` JSON-LD、関連単語への内部リンク）が届かない。RSC フライトデータも含まれない。
4. **Bingbot / Slackbot は同じ BYPASS でも完全な HTML を受信できる**。両者は Next.js の `htmlLimitedBots` 既定リストに含まれ「ブロッキング（非ストリーミング）レンダリング」経路に入るため。Googlebot は JS 実行可能 bot としてリスト外 → ストリーミング経路 → そこが壊れている。
5. ホーム・`/words`・`/guide` が無事なのは**人気ページでエッジキャッシュが温かい（HIT）だけ**。ロングテールの単語ページはクロール時ほぼ確実にコールド。

### 1-3. 原因の切り分け（済み）

- アプリコードに UA 分岐は**存在しない**（grep 済み。`src/proxy.ts` の matcher は `/login`, `/auth/:path*` のみで単語ページに無関係）。
- よって **Next.js 16.2.6 `cacheComponents` のストリーミング bot 経路 × Vercel 配信層**の問題と推定。
- `src/app/words/[word]/page.tsx` の構造的特徴: `next/dynamic(..., { ssr: true })` + `<Suspense>` + 非同期 Fetcher。この組み合わせが動的レンダリング時の「穴」を作っている。

### 1-4. SEO への影響

- Google の第一波（HTML）インデックスに単語コンテンツが渡らない。第二波（JS レンダリング）での回復は不確実（切断応答には RSC ペイロードも無く、クライアント側の追加フェッチ頼み）。
- 1,369 ページ分の評価（コンテンツ品質・内部リンクグラフ・構造化データ）が毀損されている可能性が高い。
- `/today-words` も bot 向け HTML に「今日の 5 単語」リンクが欠落（同根の部分症状）。

### 1-5. 対応プラン

#### 1-5a. ❌ 却下した対策: `htmlLimitedBots` 上書き（Next.js ソース精査で無効と確定）

> **2026-07-21 追記（重要）**: 当初この監査は「`next.config.ts` の `htmlLimitedBots` に `Googlebot` を追加すれば
> Bingbot と同じ完全 HTML 経路に載る」と提案し、実装もした。しかしレビュー指摘を受けて Next.js 16.2.6 の
> 実ソースを精査した結果、**この対策は本問題に対して完全に無効**と判明し、**リバート済み**。

根拠（`node_modules/next` 実装）:

1. **`htmlLimitedBots` の全消費箇所はメタデータ限定**。設定値は `shouldServeStreamingMetadata()`（`server/lib/streaming-metadata.js:24`）にしか渡らず、`<title>`/`<meta>` を**ストリーミングするかブロッキングするか**だけを制御する。`<Suspense>` 本体のバッファリングには一切関与しない（`base-server.js:1041` / `build/index.js:1897` / `app-page.js:349` の全経路を確認）。
2. **`Googlebot` の botType は設定で変えられない**。`shared/lib/router/utils/is-bot.js:36` の `HEADLESS_BROWSER_BOT_UA_RE = /Googlebot(?!-)|Googlebot$/i` により、素の `Googlebot` は既定で botType `'dom'`。この判定はハードコードで、`htmlLimitedBots` 設定は `getBotType` に影響しない。
3. **本体を待つフラグは既に true**。`build/templates/app-page.js:372` の `shouldWaitOnAllReady = Boolean(botType) && isRoutePPREnabled` は **Googlebot（dom）でも Bingbot（html）でも true**。さらに `app-page.js:349` は PPR ページの bot に対し `serveStreamingMetadata` を `htmlLimitedBots` を見る前に `false` へ短絡する。→ 設定変更は Googlebot の描画経路を1ビットも変えない。

**結論**: オープンソースのコード上は Googlebot も Bingbot も `shouldWaitOnAllReady=true` で完全 HTML になるはず。にもかかわらず本番で Googlebot だけ切断される以上、**原因はこの設定で変えられる層ではなく、Vercel の配信層かビルド成果物の挙動**にある。よって次は「設定を当てる」ではなく「**再現して層を特定する**」ことが必要。

#### 1-5b. Phase B（現在の最優先）: ローカル再現で Next.js 起因か Vercel 起因かを切り分ける

- [ ] **ローカル production 再現**: `npm run build && npm run start` 後に、未取得の単語で Googlebot UA 取得。

  ```bash
  curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
    http://localhost:3000/words/zoology | grep -c "<h1"   # 期待 1 / 0 なら切断再現
  ```

  - **再現する（h1=0）→ Next.js 起因**。→ Phase C の構造修正を実施し、同じ手順でローカル検証してからデプロイ。あわせて Next.js の GitHub issue 検索 / パッチ更新確認（`npm outdated next`）。
  - **再現しない（h1=1）→ Vercel 配信層起因**。→ コード修正では直らない可能性。Vercel サポートへ §1-1 のエビデンス表を添えて報告。並行して Phase C（動的ホール撤去）を「Vercel の bot ストリーミング挙動に依存しない静的化」として実施する価値あり。
  - 注意: ローカル production ビルドは全 1,300+ ページを SSG するため Blob / Redis /（未キャッシュ分は Gemini）を実際に叩く。時間とクォータに留意。
- [ ] **Search Console URL 検査**: 「公開 URL をテスト → クロール済み HTML」で Google 視点の取得内容を確認。※ライブテストの UA は `Google-InspectionTool`（既定リストで既にブロッキング側）で、実 `Googlebot` とは経路が違い得るため、これ単体を「直った」証拠にしない。判定は必ず実 `Googlebot` UA の curl（§1-6）で行う。

#### 1-5c. Phase C（有力な恒久対策候補・要 Phase B 後）: 動的ホールを撤去して単語本体を静的化

- [ ] `src/app/words/[word]/page.tsx` の `next/dynamic(..., { ssr: true })` を**通常 import に戻す**（App Router では不要なラッパーで、動的レンダリング時の複雑性だけを増やしている）。
- [ ] `WordDetailFetcher` の `<Suspense>` 越し取得をやめ、ページ内で直接 `await getWordDetail(word)` する。`getWordDetail` は `"use cache"` 済みなので**単語本体がプリレンダー（静的シェル）に含まれる**ようになり、bot 向けの動的レンダリング／ストリーミング再開の「切れる余地」自体が無くなる——これが本問題の最も確度の高い構造的対策。
  - トレードオフ: 実ユーザーのコールド遷移でスケルトンではなく待ち（Redis 取得 100〜300ms）になる。ただし全単語ビルド時生成のため実害は僅少。かつ `prefetch={false}` 運用では元々 `loading.tsx` は出ないため UX 差はほぼ無い。
- [ ] `/today-words` の「今日の N 単語」セクションも bot 向け HTML に含まれるか同手順で確認。欠落するなら同様に境界構造を見直す。
- [ ] Next.js のパッチ / マイナー更新確認（16.2.6 → 最新）。ストリーミング / bot 対応のリグレッション修正が入っていないか changelog を確認。

### 1-6. 検証手順（デプロイ後・毎回この手順で）

**⚠️ 重要な落とし穴: 一度 curl したページはバックグラウンドでレンダリング完了 → エッジキャッシュに載り、次回から HIT（完全 HTML）になる。検証のたびに「まだ誰も触っていない単語」を使うこと。** 過去の検証で使用済み: implement, negotiate, obsolete(リスト外語), zoology, yearning, walk-in, vicinity, videography, capable, handful, phase, subsequent, complex, former, fabric, accounting, figure, proposal, aisle, custodian, historical, occur, recipient, tenure, entitled。

```bash
# 1) 未使用の単語を __words__/*.txt から選ぶ（例: word_high.txt の任意の行）
W=<未使用の単語>

# 2) Googlebot mobile(主クローラー) で取得し、h1 と </html> を確認
curl -s -m 30 -D /tmp/h.txt \
  -A "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  "https://www.toeic-words.com/words/$W" -o /tmp/b.html
grep -i "x-vercel-cache" /tmp/h.txt          # BYPASS でも下 2 つが通れば OK
grep -c "<h1" /tmp/b.html                     # 期待値: 1
tail -c 20 /tmp/b.html | grep -c "</html>"    # 期待値: 1
grep -c "DefinedTerm" /tmp/b.html             # 期待値: 1 (JSON-LD が届いている)

# 3) 別の未使用単語で Googlebot desktop でも同様に確認
```

- [ ] 合格後: Search Console で sitemap を再送信（`https://www.toeic-words.com/sitemap.xml`）。
- [ ] 主要単語ページ数件を URL 検査から「インデックス登録をリクエスト」。
- [ ] 2〜4 週間、Search Console の「検索パフォーマンス」と「ページのインデックス登録」レポートで、単語ページのインデックス数・表示回数の回復を監視。

---

## 2. 🟡 P1: 中程度の改善

### 2-1. sitemap の lastmod が全単語で固定値

- 現状（対応前）: `src/app/api/sitemap/route.ts` の `WORD_LIST_LASTMOD = "2026-04-26"` が全 1,369 単語 + 主要ページに一律適用。約 3 ヶ月前のまま。
- 問題: 全 URL 同一・更新されない lastmod を Google は学習して**無視する**ようになる。信頼できない lastmod はクロール効率に悪影響。
- [x] **対応済み（2026-07-21）**: 実更新日を管理していない URL（全単語詳細 + 日次ローテーションの `/today-words`）の `<lastmod>` を**出力しない**。ガイド記事は `article.updatedAt` ベースで正確なので現状維持。
- [x] **あわせて `noindex` ページを sitemap から除外（2026-07-21）**: `/favorites`・`/review`（ともに `robots index:false` を実測確認）を削除。sitemap 掲載と `noindex` は矛盾シグナルのため。
- 参考: `changefreq`/`priority` は Google では無視されるが、他検索エンジン向けに残置（害はない）。

### 2-2. サイト名の「不統一」— 調査の結果、これは意図的な設計。対応不要（対応済みとして確定）

> **2026-07-21 更新**: 当初この監査はブランド名の「TOEIC語彙ラボ」統一を提案したが、実装時に
> `README.md` および `docs/architecture.md`（変更履歴 4.7, 2026-07-14）を精査した結果、
> **この分離は既存順位を保護するための意図的な設計判断**であることが判明した。
> ユーザー確認のうえ、**統一はしない**方針で確定。以下は現状仕様（＝維持すべき正）の記録。

現状の名前の使い分けは仕様として正しい:

| 箇所 | 値 | 区分 |
|---|---|---|
| `src/app/layout.tsx` `applicationName` / `openGraph.siteName` | TOEIC語彙ラボ | Google のサイト名候補 → ブランド名 |
| `src/app/page.tsx` `websiteJsonLd.name` | TOEIC語彙ラボ | 同上（初期 HTML へ直接出力） |
| `src/app/page.tsx` `educationalJsonLd.name` | TOEIC重要単語 | **意図的に維持**（キーワード保護） |
| `src/app/(web-info)/guide/[slug]/page.tsx` Article `publisher.name` / `author.name` | TOEIC重要単語 | **意図的に維持**（キーワード保護） |
| `src/lib/json-ld.ts` DefinedTermSet name | TOEIC重要単語 | 「単語集の名前」なので妥当 |

- 方針の根拠（既存ドキュメントより）: Google 検索結果の**サイト名**は `WebSite.name` / `og:site_name` / `application-name` から決まるため、そこだけ「TOEIC語彙ラボ」にすればブランド表示は達成できる。一方 publisher/author を「TOEIC重要単語」のまま残すのは、主要キーワード文字列を構造化データから消さないための保護措置。
- **やってはいけないこと**: publisher/author/`educationalJsonLd.name` を「TOEIC語彙ラボ」に一括置換すること（この節の当初提案は撤回済み）。将来別のAI/開発者が「不統一」と見て直さないよう、この判断は README と技術ドキュメントにも明記されている。

### 2-3. `public/robots.txt` の残骸削除

- 現状: `public/robots.txt`（`Sitemap: .../api/sitemap` を指す旧版）と `src/app/robots.ts`（`/sitemap.xml` を指す現行版）が併存。**本番では robots.ts が勝っている**ことを実測確認済みだが、混乱と将来の事故の元。
- [ ] `public/robots.txt` を削除する。
- [ ] 削除後、本番 `https://www.toeic-words.com/robots.txt` が現行内容（`Disallow: /api/`, `Sitemap: .../sitemap.xml`）のままであることを確認。

---

## 3. 🟢 P2: 積み上げ改善

### 3-1. `/study` に h1 がない

- 実測: `/study` の完全版 HTML（119 KB, HIT）にも `<h1>` が 0 件。
- [ ] `src/app/study/page.tsx` にページ見出しの h1（例: 「TOEIC 単語 学習モード」）を追加。既存の装飾テキストの格上げで可。

### 3-2. 構造化データの型の整理

- [ ] `src/app/page.tsx` の `EducationalOrganization` → `Organization` に変更（当サイトは資格付与機関ではないため型が不正確。リッチリザルト対象外の型なので実害は小さいが、正確性を上げる）。名前は §2-2 に合わせ「TOEIC語彙ラボ」。
- [ ] 同ファイルの `potentialAction`（SearchAction）は削除可。`urlTemplate` が検索結果ページではなく単語詳細 URL を指しており仕様不適合、かつサイトリンク検索ボックス自体が 2024 年に廃止済み。
- 情報として: **FAQPage リッチリザルトは 2023-08 以降、政府・医療系サイト以外では表示されない**。ただしトップページの FAQ セクション + JSON-LD はコンテンツ / AI Overviews 対策として価値があるので**削除しないこと**。

### 3-3. ホームからの単語直リンク強化

- 現状: ホームの初期 HTML に含まれる単語詳細への直リンクは 23 件のみ（本文内 3 語 + 今日の 5 単語 + リスト先頭部）。`/words` がハブ（全 1,369 リンク SSR 済み・実測確認済み）として機能しているため致命的ではない。
- [ ] 余力があれば: ホームに「レベル別 代表単語」等の**静的なキーワード入りアンカーリンク枠**（各レベル 10 語程度）を追加し、ホームのリンクエクイティを重要単語へ直接流す。

### 3-4. E-E-A-T の補強（任意）

- [ ] ガイド記事の `author` が汎用的な「編集チーム」Organization のみ。運営者情報ページ（/about）への導線を記事フッターに付け、author に `url` を持たせると信頼性シグナルが向上。
- [ ] Search Console の「ウェブに関する主な指標」で CLS を確認（AdSense / A8 バナーはレイアウトシフトの典型要因。枠の高さ予約があるか確認）。

---

## 4. すでに良くできている点（変更時に壊さないこと）

| 項目 | 状態 |
|---|---|
| タイトル設計 | ホーム: `TOEIC 重要単語【2026年最新】…`（ターゲット KW 前方配置）/ 単語: `implement \| TOEIC重要単語` |
| meta description | 単語ごとにユニーク生成（訳・品詞・例文入り、158 字制御）— `generateMetadata` 実装は優秀 |
| canonical | 全主要ページ設定済み |
| OGP / Twitter Card | 設定済み。`/opengraph-image`・`/words/{slug}/opengraph-image` とも 200 / image/png を実測確認 |
| 構造化データ | WebSite / BreadcrumbList / FAQPage / Article / DefinedTerm 実装済み |
| sitemap | `/sitemap.xml`（rewrite → `/api/sitemap`）1,391 URL、robots.ts から参照。正常配信を実測確認 |
| 内部リンク | `/words` に全 1,369 語 SSR、単語間の類義語リンク、ガイド ⇄ 単語の相互リンク |
| noindex 運用 | /login, /favorites, /review 等のプライベートページに設定済み |
| コンテンツクラスター | ガイド長文記事 12 本 + FAQ + ホーム解説セクション |
| インデックス状況 | SERP サンプル（US インデックス）で `/words` 4 位相当・`/` 7 位相当。競合はレアジョブ English Lab / STUDYing / toiguru / QQEnglish などの記事型ページ |

- ホームと `/words` が同一クエリで共にランクインしているのは現状プラス（ダブル表示）。タイトルの差別化（ホーム=総合、/words=一覧）が効いているため、**統合やリダイレクトはしないこと**。順位変動時のみ再検討。

---

## 5. 実施チェックリスト（着手順）

1. [x] ~~**P0 Phase A**: `htmlLimitedBots` 追加~~ → **却下・リバート済み**（§1-5a。Next.js ソース精査で無効と確定）
2. [ ] **P0 Phase B（最優先）**: `npm run build && npm run start` + 実 Googlebot UA でローカル再現し、Next.js 起因か Vercel 起因かを切り分け（§1-5b）
3. [ ] **P0 Phase C**: 切り分け結果を踏まえ、`words/[word]/page.tsx` の `next/dynamic`＋`<Suspense>` 動的ホールを撤去して単語本体を静的化 → ローカル検証 → デプロイ → §1-6 の実 Googlebot UA 検証 → sitemap 再送信 + インデックス登録リクエスト（§1-5c）
4. [x] **P1**: sitemap から `noindex` ページ除外（`/favorites`・`/review`）/ 実更新日不明 URL の `lastmod` 省略（全単語・`/today-words`）/ `public/robots.txt` 削除（2026-07-21 実装済み。※サイト名統一は §2-2 のとおり撤回）
5. [ ] **P2**: /study h1、Organization 型修正、SearchAction 削除
6. [ ] 2〜4 週間の Search Console 監視（インデックス数・表示回数・平均掲載順位）

**ドキュメント更新ルール（必須)**: 上記を実装する各 PR で `README.md` と `docs/architecture.md`（最終更新日含む）を同時更新すること。

---

## 付録: 検証に使った UA 文字列

```
# Googlebot desktop
Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)

# Googlebot mobile（モバイルファーストインデックスの主クローラー）
Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)

# Bingbot（比較用・正常経路の実証に使用）
Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0 Safari/537.36

# Slackbot（htmlLimitedBots 既定リスト内の比較用）
Mozilla/5.0 (compatible; Slackbot-LinkExpanding 1.0; +https://api.slack.com/robots)
```
