# 今日おすすめの5単語 聞き流し機能 Spec

## Why
「今日おすすめの5単語」のエリアにおいて、発音と例文をハンズフリーで連続再生できる「聞き流し（オートプレイ）モード」の需要があるため。ユーザーは画面を逐一操作することなく、耳から英語の音や意味を効率的に学習できるようになり、学習体験が向上します。

## What Changes
- `src/components/features/words/TodayRecommendedWordsClient.tsx` に「聞き流し」ボタンを追加する。
- 新規ページ `src/app/today-words/listen/page.tsx` (Server Component) を作成し、全単語リストを取得してクライアントに渡す。
- 新規クライアントコンポーネント `src/components/features/today-words/TodayWordsListenClient.tsx` を作成し、聞き流し機能のUIと再生ロジックを実装する。
- `src/hooks/useTTS.ts` に、非同期で音声を再生完了まで待機できる機能を追加（例: Promiseを返す `playAudioAsync` など）、もしくは `fetchTTS` をエクスポートしてコンポーネント側で再生制御を行えるようにする。

## Impact
- Affected specs: トップページの「今日おすすめの5単語」セクション。
- Affected code: 
  - `src/components/features/words/TodayRecommendedWordsClient.tsx`
  - `src/hooks/useTTS.ts`
  - `src/app/today-words/listen/page.tsx` (新規作成)
  - `src/components/features/today-words/TodayWordsListenClient.tsx` (新規作成)

## ADDED Requirements
### Requirement: 聞き流し機能（オートプレイモード）
システムは「今日おすすめの5単語」に対して、発音と例文を連続して再生する機能を提供する。

#### Scenario: Success case
- **WHEN** ユーザーが「今日おすすめの5単語」エリアの「聞き流し」ボタンをクリックする
- **THEN** 聞き流し専用ページ（`/today-words/listen`）に遷移し、自動的に（または再生ボタン押下で）5つの単語の発音、英語例文、日本語例文が順番に再生される。画面には現在再生中の単語、英語例文、日本語訳がシンプルに表示される。

## MODIFIED Requirements
### Requirement: TodayRecommendedWordsClient
既存の「今日おすすめの5単語」コンポーネントに、新たに「聞き流しモード」へのリンクボタンを追加する。
