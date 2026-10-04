# SEO・コンテンツ改善計画（外部AI評価の検証・旧SEO監査の統合）

作成日：2026-10-02（JST）／最終更新日：2026-10-03（JST）  
対象：TOEIC語彙ラボ／https://www.toeic-words.com  
確認したコード：Git HEAD `b20d3aa`、調査開始時の作業ツリーは変更なし（初回実装は`54318f1`・`826165f`）

## 結論

外部AIの指摘は、品質管理・更新日・SNS表示の改善案として参考になる。ただし、現在の本番では「サイトマップから366語が漏れている」「学習ページのHTMLは読み込み中だけ」という指摘は再現しなかった。この2点を前提に全単語へnoindexを付けたり、既存のサーバー描画を作り直したりする必要はない。

優先するのは、既存の編集・確認基盤を使った人による内容確認と、全単語からの誤り報告導線。その後に実更新日を管理してlastmodを追加する。Upstash Vectorによる意味検索は実装済みであり、質問回答型RAGは別の将来機能として検討する。

2026-07-21のSEO監査（旧`seo-audit-action-plan.md`、本書へ統合して削除）で未解決だったP0「Googlebotにだけ単語詳細の切断HTMLが返る」は、2026-10-03のGooglebot UAによる再検証で再現しなかった（下記「旧P0の再検証」）。このため本書の「P0修正は不要」という判断は、外部AIの指摘と旧P0の両方を確認した結果に基づく。

本書はSEOとコンテンツ品質に関する唯一の計画書であり、検証記録と作業計画を兼ねる。初回実装の進捗は末尾の実施記録に追記する。既存の[AdSense再申請計画](adsense-reapplication-plan.md)と[コンテンツ確認手順](../reviews/README.md)を併用する。

## 調査範囲と証拠

2026-10-02に、本番の公開URLをcurlで取得し、サイトマップXMLとHTMLを解析した。HTML本文の確認ではscript/styleを除外し、JavaScriptの実行は行っていない。HTTP取得にはタイムアウトを設定した。Python標準のHTTPS取得はローカル証明書設定で失敗したため、証明書検証を有効にしたcurlへ切り替えて取得した。

| 対象 | 今回確認した結果 |
|---|---|
| `/sitemap.xml` | HTTP 200。全1,410 URL、単語詳細1,386 URL、単語URLの重複なし、単語のlastmodは0件 |
| `/words` | HTTP 200。表示は全1,386語、HTML内の単語詳細へのリンクもユニーク1,386件 |
| ローカル収録語 | `word.txt` 378語、`word_mid.txt` 791語、`word_high.txt` 217語。slugで重複排除後1,386語。サイトマップのslug集合と完全一致 |
| `/study` | HTTP 200、index/follow。HTMLに「読み込み中...」に加え、学習モードの説明・レベル案内・利用目的・利用シーンあり |
| `/words/approve` | HTTP 200、index/follow。編集済み解説・更新情報と「内容の誤りを報告」リンクあり |
| `/words/confirm`・`/words/zoom` | HTTP 200、index/follow。単語固有の誤り報告リンクなし。共通フッターの問い合わせ先はあり |
| TOP | HTTP 200、index/follow。`og:title`・`twitter:title`は「TOEIC重要単語」 |
| `/robots.txt` | HTTP 200。`Allow: /`、`Disallow: /api/`、Host、Sitemapを出力 |
| 編集・確認記録 | 編集データ15語はすべて`ai-assisted`。既存インベントリ45項目の`humanReviewed`はすべてfalse。人の承認ファイルは存在しない |

ローカル集計は、実際のローダーが使う上記3ファイルだけを対象にした。作業メモ等を含む`__words__/*.txt`全体の件数ではない。本番Blobの内容を直接読み取ったわけではないが、本番一覧件数と本番サイトマップ、ローカル3ファイルは整合した。

単語本文はSuspenseのストリーム領域にも含まれる。初期シェルだけを抜き出す取得方法では本文を見落とす可能性がある。今回のHTTP取得結果はGoogleによるレンダリング成功や全ページのインデックス登録を証明しない。

2026-10-02の取得は通常のcurl（Googlebot以外のUA）で行った。Googlebot UAでの確認は次節に分けて記録する。

### 旧P0の再検証（2026-10-03）

旧監査と同じGooglebot desktop／mobileのUA（「旧SEO監査から引き継ぐ事項」に記載）で、本番の単語詳細を取得した。対象は旧監査で切断を観測した語（former・handful・capable・subsequent・vicinity）と、収録語から無作為に選んだ15語を含む。

| 対象 | UA | 結果 |
|---|---|---|
| 収録語23件（旧監査の切断語5件を含む） | Googlebot desktop／mobile | すべてHTTP 200、`x-vercel-cache: PRERENDER`、約163〜176 KB、h1・`</html>`・`DefinedTerm`あり |
| `/words/former` | ブラウザ | HTTP 200、HIT、h1・`</html>`あり（Googlebot応答とほぼ同サイズ） |
| `/study` | Googlebot desktop | HTTP 200、PRERENDER、`</html>`あり、h1なし |
| `/today-words` | Googlebot desktop | HTTP 200、STALE、h1・`</html>`あり |

旧監査で原因とされた「Googlebotへの`BYPASS`動的レンダリングで本文が途中で切れる」挙動は観測されず、Googlebotにもビルド時のプリレンダーが返っていた。Next.js・Vercel側の変更で解消した可能性が高いが、原因の特定はしていない。Googlebotのレンダリング結果とインデックス状況の確認は、引き続きSearch ConsoleのURL検査で行う。

副次的な発見：未収録slug（例：`/words/ledger`・`/words/premise`・`/words/outskirts`・`/words/zzzz-not-a-word`）はHTTP 200で「単語が見つかりません」を返す。`noindex`は出力されるため索引される心配は小さい。ただし、`index, follow`と`noindex`のrobots metaが重複し、titleのサイト名も二重になっている。ストリーミング中の`notFound()`でステータスが200のまま確定するソフト404と考えられる（作業11）。

未確認：Search Consoleの現在の表示回数・クリック数・URL検査結果、全1,386ページのHTTP状態とrobots、全解説の言語的正確性、今回のブラウザ実操作。過去の1,020件という観測の取得日時・URL・取得方法も不明であり、当時の原因は断定できない。

## 外部AIの指摘ごとの判定

| 指摘 | 判定 | 根拠・対応 |
|---|---|---|
| 1,386語に対してサイトマップ1,020件 | 現在は不一致なし | 本番は1,386件。`src/app/api/sitemap/route.ts`も`getAllWords()`を全件ループしている。未確認語を選別する条件なし |
| サイトマップにないindexページは指示の矛盾 | 表現の修正が必要 | サイトマップは発見・正規URLのヒント。掲載されていないだけでindex許可と矛盾するわけではない。noindexページを掲載する場合の方針不整合とは区別する |
| 単語のlastmodがない | 事実。改善は段階的に可能 | 実更新日がないため意図的に省略している。ガイドは`updatedAt`を使用。編集済み15語には`updatedAt`がある |
| `/study`のHTMLが読み込み中だけ | 現在は該当しない | `src/app/study/page.tsx`が説明sectionをサーバー描画しており、本番HTMLにもある（Googlebot UAでも同様）。カード部分は読み込み表示から開始する。h1はない |
| AI解説の品質管理が重要 | 妥当。最優先の継続課題 | 正規化・AI照合は意味の正確さを保証しない。編集データと確認ハッシュの仕組みは既存、人の確認と公開バッジは未完了 |
| 「確認済み」バッジ・人の確認・誤り報告を追加 | 妥当。ただし部分実装済み | 人の確認ハッシュ判定は既存。誤り報告は編集済み語にだけある。全語への導線と公開表示が必要 |
| この3施策でE-E-A-Tが上がる | 効果の断定は避ける | 実際の編集・確認を伴えば信頼性向上に役立つ。バッジ設置自体による順位上昇は保証できない |
| TOPのOGタイトルが短い | 事実。優先度は低め | TOPのtitleと異なり、ルートlayoutの短いOGタイトルを継承。SNSで内容が伝わる文言へ改善できる |
| robotsのHostはGoogleで不要 | 妥当。軽微な整理 | GoogleがサポートするフィールドにHostはない。残っているだけでSEO障害とは判断しない |
| zoomの収録を見直す | 調査提案として妥当 | `word_mid.txt`に収録。本番詳細も存在する。語があるだけではTOEICとの関連性・頻度・レベルの誤りは判定できない |
| Upstash Vectorは検討中 | 現行実装と異なる | `/api/search/semantic`と埋め込みCLI、意味検索UIは実装済み。質問回答型RAGは未実装の別機能 |

Googleはサイトマップ提出をヒントと説明しており、取得・クロールを保証しない。lastmodは任意で、主内容等の重要な実更新を正確に反映する場合に利用される。[サイトマップ公式資料](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

noindexを採用するときはGooglebotがその指示を取得できる必要がある。robots.txtでクロールを禁止してnoindexも読ませない構成にしない。[noindex公式資料](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

E-E-A-Tそのものは単独のランキング要因ではない。確認者・根拠・範囲を正しく示すことを目的とする。[有用で信頼できるコンテンツの公式資料](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

Hostの削除は整理として扱う。[robots.txtのサポート項目](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)

## 優先順位と実施単位

P0は現在確認できる重大な障害、P1は次に着手する品質・運用改善、P2はその後の改善、P3は将来機能。今回、サイトマップ漏れを理由とするP0修正は不要。旧監査のGooglebot切断HTMLも再現しなかったためP0から外す。再発を検出した場合はP0へ戻す。既知の重大な誤解説が新たに確認された場合は、その訂正をP0へ繰り上げる。工数は設計・確認を含む概算で、人による監修時間と外部管理画面の待ち時間は別。

| 順序 | 優先度 | 作業 | 工数目安 | 依存・判断 |
|---|---|---|---|---|
| 1 | P1 | 人による内容確認と訂正の運用を開始 | 初期設定半日、以後継続 | 運営者が確認担当・対象を決める。実際の確認は人が行う |
| 2 | P1 | 全単語に誤り報告導線を設置 | 半日〜1日 | 既存問い合わせ先を利用する小さな変更から開始可能 |
| 3 | P1 | 現行内容に結び付く確認済み表示 | 1〜2日＋人の確認 | 既存ハッシュを活用。AI修正だけではバッジを出さない |
| 4 | P2 | 編集済み語の正確なlastmodを追加 | 半日〜1日 | 編集本文と更新日の管理・サイトマップ配信反映を一緒に設計 |
| 5 | P2 | サイトマップの集合一致確認を定着 | 半日〜1日 | 新しいデータ取得経路を増やさず既存ローダーを使用 |
| 6 | P2 | TOPのOG・Twitterタイトルを改善 | 数時間 | TOP固有のmetadataで設定し、SNS表示を確認 |
| 7 | P2 | 収録基準とレベルのレビュー | 1〜2日で基準策定、以後継続 | zoomを含む標本を根拠で評価。印象だけで削除しない |
| 8 | P3 | `/study`の初期表示の使いやすさを改善 | 半日〜1日 | 本文追加済み。h1がないため見出し構造と合わせて判断 |
| 9 | P3 | robotsのHostを整理 | 数時間以内 | 必要なAllow/Disallow/Sitemapを維持 |
| 10 | P3 | 質問回答型RAGの実験 | 要件確定後に見積もり | 品質管理と既存検索の評価を先に進める |
| 11 | P3 | 未収録slugのソフト404とrobots meta重複を整理 | 半日 | `noindex`は出ているため緊急性は低い。Suspense外で存在確認して404を返せるか検証する |

### 1〜3：品質管理・報告・確認済み表示

- Search Consoleの直近28日／90日の単語URL別表示回数・クリック数を確認し、露出の多い語を優先する。データがない場合は既存標本30語・編集済み15語・多義語・報告が届いた語から開始する。既知の誤りは閲覧数にかかわらず優先する。
- 確認項目：語義・品詞・文型・英文の自然さ・和訳・類義語との差・派生語・発音・出典・頻度の根拠。辞書の例文を転載せず、自作例文を確認する。
- 既存の`src/data/word-editorial.json`に修正を残し、Redis期限切れ後も訂正が失われない構成を維持する。
- `src/lib/content-review.ts`の`hasCurrentHumanReview()`を使い、人の承認記録`docs/reviews/content-approvals.json`を新設する（現在は未作成で、`scripts/content-review-report.ts`は不在時に空として扱う）。現在のレポートは標本中心なので、全語の公開表示に使う場合は対象を広げる。
- バッジは実際に確認した本文のfingerprintと人の承認が一致したときだけ表示する。確認範囲・確認日を示し、専門家の資格が確認できない限り「専門家監修」と表示しない。本文変更・再生成で承認を失効させる。
- 誤り報告は全語で同じ位置に置く。まず既存contact／メール／GitHub Issueを利用し、slug・正規URL・問題箇所を利用者が記載できるようにする。自動送信はしない。専用フォームは別途要件を決める。
- メール報告リンクでは、運営者のメールアドレスが全単語ページのHTMLに載る。問い合わせページより露出が大きく、収集されてスパムが増える可能性を運営者が許容するか判断する。許容しない場合は、問い合わせページへの導線だけに戻すか、専用アドレスへ切り替える。
- 本番反映後は既存revalidation APIの`vector=true`で対象語のL1とVectorを同期する。トークンを文書・URL例・ログへ残さない。

主な対象：`src/app/words/[word]/page.tsx`、`src/lib/content-review.ts`、`src/data/word-editorial.ts`、`scripts/content-review-report.ts`、`docs/reviews/`。

完了条件：編集語／非編集語の双方から報告でき、人の確認がない語にはバッジが出ず、確認後の本文変更でバッジが消える。確認記録と公開内容が一致する。既存の今日・復習由来のナビゲーションを維持する。

### 4：lastmodを段階的に追加

- 第1段階は編集済み15語の`updatedAt`を使う。更新日を確認できない語は省略を維持する。
- 単語以外も見直す。現行サイトマップは`/`・`/words`・`/study`に固定値`WORD_LIST_LASTMOD`（2026-04-26）、about等に`STATIC_PAGE_LASTMOD`を出している。実際の主内容の更新とずれている場合は、実更新日へ直すか省略する。
- 読み取り時刻・ビルド時刻・Redis TTL更新・キャッシュ無効化日を本文更新日として扱わない。再生成して同一内容なら内容版と日付を維持する設計にする。
- 第2段階で生成語にも内容fingerprintと実更新日を永続管理する。現在の`WordDetails`とRedis保存形式には更新日がないため、履歴の保存先・既存データの互換性・キャッシュ期限切れ時の扱いを決める。過去の日付を推測して埋めない。
- サイトマップで全語の`getWordDetail()`を呼んで生成・Redis照会を行わない。単語一覧と軽量な更新メタデータだけで組み立てる。
- 現行サイトマップは24時間のHTTPキャッシュを指定する。本文の再検証だけではサイトマップ即時反映を保証しないため、許容遅延と配信キャッシュ更新手順を決める。

主な対象：`src/app/api/sitemap/route.ts`、`src/data/word-editorial.ts`。生成語へ広げる場合は`src/data/word-detail.ts`と`src/lib/wordCache.ts`も対象。

完了条件：編集した対象語だけlastmodが実更新日になり、未知の更新日を出力せず、本文・更新情報・サイトマップの反映を確認できる。再クロールや順位上昇を完了条件にしない。

### 5〜9：SEO運用・表示・選定の整理

- 件数固定の「1,386件である」だけではなく、収録slugとサイトマップslugの集合一致を確認する。本番`/words`のリンク集合も照合すれば、同数の入れ替わりを検出できる。Search Consoleの最終取得・処理結果は別に確認する。
- index/noindexは品質・公開方針に基づいて決める。サイトマップに載っていないことだけを理由にnoindexを付けない。将来noindexを導入するならsitemap除外、canonical、本文表示、広告設定を別々に検証する。
- TOPの`src/app/page.tsx`にページ固有のOG・Twitterタイトルを設定する案を優先する。ルートlayoutの共通値を変えると他のページにも波及する。例：「TOEIC語彙ラボ｜例文・音声付き無料単語帳」。既存画像とdescriptionも整合させる。
- zoomは一般語の語義と固有サービス名を区別し、学習上の用途・レベルの根拠を確認する。「TOEIC頻出」を裏付ける資料がなければ表現を見直す。収録変更は専用スキルを読み、Blob・一覧・詳細・Vectorの同期を計画する。
- `/study`はすでにサーバー説明を持つ。読み込み画面が上部を占める状況や見出しの順序はブラウザで追加確認する。検索除外を先に実施する必要はない。
- Host削除は小さな整理としてまとめて実施できる。`/sitemap.xml`は`/api/sitemap`への内部rewriteなので、`Disallow: /api/`だけで公開sitemapが取得不能とは判断しない。本番公開URLの取得とSearch Consoleで確認する。

完了条件：収録集合と掲載集合を比較でき、TOPのOG/Twitter表示に目的が伝わり、選定基準と公開説明に裏付けがある。studyとrobotsを変更する場合は既存の学習・クロール導線を確認する。

### 10：RAGは品質管理を前提に検討

既存の意味検索はGemini埋め込みとUpstash Vectorで候補語を返す機能。回答文を生成するRAGでは、参照する教材の品質、出典の提示、答えられない場合の応答、誤回答の評価、費用とレート制限、質問文の保存・プライバシーを別途設計する。未確認の解説を検索しても正確性は保証されない。

まず「approveとapprove ofの違い」等の少数の質問で、確認済み教材を参照した回答を評価する。差別化の仮説として検証し、必須機能として先行実装しない。

## 旧SEO監査から引き継ぐ事項（2026-07-21）

2026-07-21に「TOEIC重要単語」での上位表示を目的として行ったSEO監査のうち、現在も有効な判断・未完了作業・再発時の手順をここに残す。監査の全文は削除前のGit履歴（`docs/plans/seo-audit-action-plan.md`）で参照できる。

### Googlebot切断HTML（旧P0）の経緯と再発時の手順

- 2026-07-21の観測：キャッシュ未生成（`x-vercel-cache: BYPASS`）の単語詳細で、Googlebot desktop／mobileにだけ`<Suspense>`未解決の切断HTML（約46 KB、h1・`DefinedTerm`・`</html>`なし）が返った。BingbotとSlackbotは同じBYPASSでも完全なHTMLを受信した。`/study`も同様だった。
- 却下した対策：`next.config.ts`の`htmlLimitedBots`に`Googlebot`を追加しても効果はない。Next.jsソースで確認したところ、この設定はメタデータのストリーミング可否だけを制御する。`Googlebot`のbotTypeはハードコードで`'dom'`に固定されており、本体を待つ`shouldWaitOnAllReady`は両botですでにtrueだった。同じ対策を再提案しない。
- 2026-10-03：Googlebotにもプリレンダー済みの完全HTMLが返り、再現しなかった（上記「旧P0の再検証」）。原因は特定していない。
- 再発時は次の順に進める。
  1. 本番での確認：`__words__/*.txt`から、まだ取得していない収録語を選んで確認する。一度取得したページはエッジキャッシュに載り、次回からHITになるため。
  2. ローカルでの切り分け：`npm run build && npm run start`の後、Googlebot UAで取得する。ローカルで再現すればNext.js起因、再現しなければVercel配信層起因と判断する。
  3. 恒久対策の候補：`src/app/words/[word]/page.tsx`の`next/dynamic`と`<Suspense>`による動的な境界を撤去する。`getWordDetail()`（`"use cache"`）を直接awaitし、単語本体を静的プリレンダーに含める。トレードオフとして、コールド遷移時はスケルトン表示ではなく待ち時間になる。
- Search ConsoleのライブテストはUAが`Google-InspectionTool`で、実際の`Googlebot`とは描画経路が異なる可能性がある。ライブテストの結果だけで解消を判断せず、下記のcurlでも確認する。

```bash
W=<未取得の収録語>
curl -s -m 30 -D /tmp/h.txt -o /tmp/b.html \
  -A "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  "https://www.toeic-words.com/words/$W"
grep -i "x-vercel-cache" /tmp/h.txt   # PRERENDER／HIT／BYPASS。BYPASSでも下の3つが通れば可
grep -c "<h1" /tmp/b.html              # 期待値 1
grep -c "</html>" /tmp/b.html          # 期待値 1
grep -c "DefinedTerm" /tmp/b.html      # 期待値 1
```

Googlebot desktopのUAは`Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)`。比較用のBingbotは`Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0 Safari/537.36`。

### 維持する設計判断（変更しないこと）

- **サイト名の使い分けは意図的な設計。** `applicationName`・`og:site_name`・`WebSite.name`は「TOEIC語彙ラボ」とする。一方、`educationalJsonLd.name`・ガイド記事の`publisher`／`author`・DefinedTermSetは「TOEIC重要単語」のまま維持する。主要キーワードを構造化データに残し、既存の順位を守るため。「不統一」に見えても一括置換しない（`docs/architecture.md`変更履歴4.7）。
- ホームと`/words`は同じクエリで両方ランクインしている。統合やリダイレクトはしない。
- トップのFAQとFAQPage JSON-LDは、リッチリザルトの対象外でも本文としての価値があるため削除しない。
- sitemapには`noindex`ページ（`/favorites`・`/review`）を載せない。実更新日を管理していないURL（単語詳細・`/today-words`）にlastmodを出さない。robotsは`src/app/robots.ts`だけで生成する（旧`public/robots.txt`は削除済み）。

### 旧監査の残作業

| 作業 | 状態 | メモ |
|---|---|---|
| `/study`の見出し | 未完了 | h1は`StudyClient`がクライアント側で描画するだけで、初期HTML（Googlebot応答を含む）には出ていない。サーバー描画の説明sectionに見出しを持たせる（作業8と一緒に扱う） |
| `EducationalOrganization`→`Organization`、SearchActionの削除 | 対応済み | 2026-10-03時点で`src`に該当する記述はない |
| ホームからの単語直リンク強化 | 任意 | レベル別の代表単語（各10語程度）へ静的なアンカーを設ける。`/words`がハブとして全語へリンクしているため優先度は低い |
| ガイドのauthor補強とCLS確認 | 任意 | author（Organization）に`/about`の`url`を持たせる。Search ConsoleのCore Web Vitalsで広告枠のCLSを確認する |
| Search Consoleでの経過観察 | 継続 | 単語ページのインデックス数と表示回数を2〜4週間ごとに確認する |

## 次の着手チェックリスト

- [x] 現行コードと本番のサイトマップ・HTML・robots・OGを照合する。
- [x] 全収録slugと本番サイトマップslugの集合一致を確認する。
- [ ] 運営者が人による確認担当と最初の対象語を決める。
- [ ] Search Consoleの現在の単語URL別データを確認し、レビュー対象を並べる。
- [x] 第1実装として、全単語の誤り報告リンクと報告時の対象語情報を追加する（本番公開は別途）。
- [ ] 実際の人の確認記録を作り、内容ハッシュに結び付いたバッジ表示を実装する。
- [ ] 第2実装として、編集済み語のlastmodとサイトマップ反映手順を追加する。
- [x] TOPのOG/Twitterタイトルを改善する（本番公開は別途）。
- [x] 旧監査P0（Googlebot切断HTML）をGooglebot UAで再検証する（2026-10-03、再現せず）。
- [ ] Search ConsoleのURL検査で、単語詳細のGooglebotレンダリング結果を確認する。
- [ ] 運営者が、全単語ページへのメールアドレス掲載を許容するか決める。
- [ ] `/study`の初期HTMLに見出しを含める（旧監査の残作業）。
- [ ] 生成語の更新日管理と収録基準レビューの仕様を決める。

## 今後の実装時の検証・文書更新

機能変更ごとに`README.md`、`docs/architecture.md`の最終更新日と関連仕様・運用文書を更新する。

純粋ロジックの変更はVitestで検証し、人の承認の失効・更新日選択・slug集合比較を対象にする。外部APIへの実アクセスやReact描画を単体テストに追加しない。実装時は`npm run lint`、`npm run test`、`npm run build`と対象画面の手動スモークテストを行い、ビルドの再試行はAGENTS.mdの上限に従う。

公開後はHTTPステータス・canonical・robots・本文・sitemapの反映を再確認し、Search Consoleで主要対象URLのレンダリングと取得状況を確認する。初回の文書作成ではlint・test・buildを実行していない。

## 初回実装（2026-10-02）

- 編集済み・非編集語の双方へ、対象語と正規URLを事前入力したメール報告リンク、問い合わせページへの代替導線を追加。
- TOPのOG/Twitter title・descriptionをページの値に統一し、画像・サイト名等を維持。
- robots.txtのHostを削除。クロールルールとSitemapは維持。
- 人の承認と更新日の永続管理が必要なバッジ・lastmodは次回以降に扱う。本番デプロイは未実施（2026-10-03時点で`main`はoriginより先行）。`main`へのpushでVercelが本番へ自動デプロイするため、push後にこの記述と公開後の確認結果を更新する。
- コミット：`54318f1`（誤り報告リンク、TOPのOG/Twitter）、`826165f`（robotsのHost削除）。
- 検証：lint成功、Vitest 23ファイル318件成功、通常Turbopackの本番ビルド成功（1,432静的ページ）。開発サーバーのブラウザでapprove／confirmの報告欄、対象語・正規URLを含むmailto、編集済み語の更新欄との共存、問い合わせページへの遷移とキーボード移動を確認。メール送信・メールアプリの起動は行っていない。
- 開発サーバーのHTTP応答でもTOPのOG/Twitter title・description・画像・サイト名、robotsのHost削除とクロールルール・Sitemap維持を確認。SNS側の既存キャッシュ更新と本番公開後の配信確認は未実施。
