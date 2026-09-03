# Tasks

- [x] Task 1: Google Analytics (GA4) Integration
  - [x] SubTask 1.1: Install `@next/third-parties` package (if not installed) or use `GoogleAnalytics` component.
  - [x] SubTask 1.2: Add `GoogleAnalytics` component to `src/app/layout.tsx` with `gaId` from environment variable `NEXT_PUBLIC_GA_ID`.
  - [x] SubTask 1.3: Verify no errors in build.

- [x] Task 2: Internal Linking Enhancement - Logic
  - [x] SubTask 2.1: Add `getRelatedWords` function to `src/data/words.ts` to fetch random words from the same level.
  - [x] SubTask 2.2: Update `WordDetailFetcher` in `src/app/words/[word]/page.tsx` to fetch related words.

- [x] Task 3: Internal Linking Enhancement - UI
  - [x] SubTask 3.1: Update `WordDetailClient` to accept `relatedWords` prop.
  - [x] SubTask 3.2: Render "関連単語" (Related Words) section at the bottom of the word detail page.
  - [x] SubTask 3.3: Ensure synonyms in `detailedMeanings` (inside `WordDetailClient`) are also linked using `linkedWords` map.

- [x] Task 4: FAQ Schema & Content Update
  - [x] SubTask 4.1: `src/app/page.tsx` にユーザーの検索意図（総単語数、目標別学習法など）に直接回答するアコーディオン形式のFAQを追加する。
  - [x] SubTask 4.2: `src/app/page.tsx` に `FAQPage` スキーマ（JSON-LD）を生成するロジックを実装し、拡充したFAQ内容を反映させる。
  - [x] SubTask 4.3: SEOキーワード「TOEIC重要単語」を意識した見出し・テキストに調整する。

- [x] Task 5: Words Index Page Creation
  - [x] SubTask 5.1: `src/app/words/page.tsx` を新規作成する。
  - [x] SubTask 5.2: 全1,300単語をレベル別（最重要・中級・上級）およびアルファベット順にグループ化して表示するUIを実装する。
  - [x] SubTask 5.3: `ItemList` と `BreadcrumbList` の構造化データ（JSON-LD）を追加する。
  - [x] SubTask 5.4: メタデータ（title, description, canonical）を「TOEIC重要単語」に最適化して設定する。

- [x] Task 6: Final Review
  - [x] SubTask 6.1: GA4のスクリプトが出力されているか確認する。

# Task Dependencies
- Task 3 depends on Task 2.
