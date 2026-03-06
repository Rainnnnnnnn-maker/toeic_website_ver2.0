# SEO Enhancement Spec

## Why
現状のSEO対策は基本的（メタデータ、サイトマップ）には実装されていますが、トラッキング（効果測定）と内部リンク構造（クローラビリティ）に改善の余地があります。
特にGoogle Analytics (GA4) の導入によりユーザー行動を可視化し、内部リンクを強化することで検索エンジンのインデックス促進とユーザーの回遊率向上を図ります。

## What Changes
- **Google Analytics (GA4) の導入**: `next/third-parties` を使用してGA4タグを設置。
- **内部リンクの強化**:
  - 単語詳細ページの「詳細な意味」内の類義語にもリンクを適用。
  - 単語詳細ページの最下部に「同じレベルの単語（関連単語）」セクションを追加し、回遊性を向上。
- **構造化データの拡充**:
  - トップページのSEOセクション（Q&A形式に近いコンテンツ）に対して `FAQPage` スキーマを追加。

## Impact
- **Affected specs**: SEO, Analytics
- **Affected code**:
  - `src/app/layout.tsx` (GA4追加)
  - `src/app/page.tsx` (FAQ Schema追加)
  - `src/app/words/[word]/page.tsx` (関連単語取得ロジック追加)
  - `src/components/features/words/WordDetailClient.tsx` (リンク適用、関連単語表示)

## ADDED Requirements
### Requirement: Google Analytics (GA4)
システムはGoogle Analytics 4を用いてページビューとユーザーイベントを計測できなければならない。
- **Config**: 環境変数 `NEXT_PUBLIC_GA_ID` を使用する。IDが未設定の場合はスクリプトを出力しない、またはエラーにならないようにする。

### Requirement: Internal Linking Enhancement
#### Scenario: Detailed Meanings Synonyms
- **WHEN** ユーザーが単語詳細ページで「詳細な意味」内の類義語を見る
- **THEN** その類義語がデータベース内に存在する場合、その単語ページへのリンクとなっていること。

#### Scenario: Related Words Section
- **WHEN** ユーザーが単語詳細ページの最下部までスクロールする
- **THEN** 「同じレベルの単語」または「おすすめの単語」として、3〜5個の他の単語へのリンクが表示されていること。

### Requirement: FAQ Structured Data
#### Scenario: Home Page
- **WHEN** 検索エンジンがトップページをクロールする
- **THEN** ページ内のSEOコンテンツに対応する `FAQPage` 構造化データ（JSON-LD）を検出できること。

## MODIFIED Requirements
### Requirement: Word Detail Page
既存の類義語リンク機能に加え、詳細説明内の類義語にもリンクを適用するよう変更。
