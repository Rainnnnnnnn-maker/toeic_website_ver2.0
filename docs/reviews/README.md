# コンテンツ確認記録

最終更新日：2026-09-18

[人による確認シート](adsense-human-review.md)から各改訂ページを開けます。

`adsense-content-inventory.json` は公開15記事と標本30語の内容版を記録する。現時点はAIによる照合・修正であり、人による確認済みとは扱わない。標本以外の全単語の正確さを保証しない。

1. `npm run audit:content` で現行Blobの3レベル各10語をRedisから読み取る。生成・更新はしない。元データはgit対象外の `.artifacts/adsense/word-sample.json`。
2. 修正語は `src/data/word-editorial.json` を編集する。語義・品詞・例文と訳・語法・類義語・派生語・発音を照合する。辞書の例文を転載せず自作する。根拠のない語源・頻度は削除する。
3. `npm run review:content` で現在のハッシュを記録する。編集済み語はRedis標本より編集データを優先する。
4. 人が実際に確認した場合だけ `content-approvals.json` にキー（`guide/slug` または `words/slug`）と `{fingerprint, reviewer, reviewedAt: "YYYY-MM-DD", method: "human"}` を記録する。AIに人の確認を代行させない。
5. 内容変更でハッシュが変わると人の確認は失効する。再実行して現行版の状態を確認する。未修正語のレビューは取得時点の標本に対するものなので、本番公開・再申請直前に再取得する。

公開後は対象語の既存revalidation APIに `vector=true` を付けてL1と埋め込みを更新する。トークンは環境変数から読み、URLやコマンド出力に表示しない。

人による最終確認では重点5記事の演習・全選択肢の解説を優先する。単語では、今回見つかった語源の推測、品詞と例文の不一致、類義語の過度な単純化、発音表記を重点的に追加調査する。全語を一括で「確認済み」にしない。
