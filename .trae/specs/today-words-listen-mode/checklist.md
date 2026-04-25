* [x] `useTTS`フックがPromise等で非同期の音声再生完了を扱えるように拡張されているか

* [x] `src/app/today-words/listen/page.tsx` がServer Componentとして正常に作成されているか

* [x] `src/components/features/today-words/TodayWordsListenClient.tsx` で、日替わり5単語の発音・例文（英語）・例文（日本語）が順にオートプレイ再生されるか

* [x] UIがシンプルで、他ページ（`/study` や `/words/[word]` など）にマッチするデザインになっているか

* [x] `TodayRecommendedWordsClient.tsx` 内に「聞き流しモード」へのリンクボタンが設置されているか

* [x] エラー時（音声生成失敗など）のハンドリングが適切に行われているか

* [x] Next.jsのServer Action (`fetchWordDetail`) で単語詳細データを取得できているか

