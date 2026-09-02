# Tasks

* [x] Task 1: useTTSフックの非同期拡張

  * `src/hooks/useTTS.ts` に、再生終了を待機するPromise（`playAudioAsync`など）か、`fetchTTS`自体をエクスポートし、外部から連続再生のフローを制御できるようにする。

* [x] Task 2: 今日おすすめ単語 聞き流しページ (`/today-words/listen`) の作成

  * `src/app/today-words/listen/page.tsx` (Server Component) を新規作成する。

  * `getAllWords`を呼び出し、全単語情報を取得する。

* [x] Task 3: 聞き流しクライアントコンポーネント (`TodayWordsListenClient.tsx`) の作成

  * `src/components/features/today-words/TodayWordsListenClient.tsx` (Client Component) を新規作成する。

  * `TodayRecommendedWordsClient`と同様に、当日日付のハッシュから今日おすすめの6単語を計算する。

  * `fetchWordDetail` Server Actionを利用して、各単語のWordDetail（発音や例文の情報）を取得する。

  * 単語(EN) → 例文(EN) → 例文(JA) の順番で再生するオートプレイのロジック（`playNext`などの関数）を実装する。

  * UIはシンプルで、他ページに合わせたデザイン（大きな単語表示、英語例文、日本語訳、Play/Pauseボタン、前/次ボタン）を実装する。

* [x] Task 4: 「聞き流し」ボタンの追加

  * `src/components/features/words/TodayRecommendedWordsClient.tsx` に、`/today-words/listen`への遷移リンク（「聞き流し」ボタン）を追加する。

* [x] Task 5: 動作確認

  * アプリを起動し、聞き流しモードで6つの単語が正常に連続再生されるか、レイアウト崩れがないか確認する。

# Task Dependencies

* \[Task 3] depends on \[Task 1], \[Task 2]

* \[Task 5] depends on \[Task 3], \[Task 4]
