# タグ分離対応とISR Writesに関する注意点 (Cache Tag Separation & ISR Writes Considerations)

## 概要 (Overview)
Vercel Blobの単語データ更新時に発生していた大量のISR Writes（関数の連鎖的な再実行）を軽減するための「キャッシュタグの分離対応」と、Next.jsのアーキテクチャ上の注意点について記録します。

This document records the "cache tag separation" implemented to mitigate the massive ISR Writes (chained function re-executions) that occurred when updating word data in Vercel Blob, along with architectural considerations in Next.js.

---

## 1. タグ分離の対応内容 (Implemented Cache Tag Separation)

単語リスト全体と個別の単語詳細データでキャッシュタグを明確に分離しました。
We have explicitly separated the cache tags for the entire word list and individual word details.

### A. 単語リスト (Word List)
- **ファイル**: `src/data/words.ts`
- **変更点**: `word-data` タグを `word-list` に変更。
- **目的**: Blobから取得する全体リストのキャッシュを独立させる。
- **Changes**: Changed `word-data` tag to `word-list`.
- **Purpose**: Isolate the cache for the entire list fetched from Blob.

### B. 単語詳細 (Word Details)
- **ファイル**: `src/data/word-detail.ts`
- **変更点**: `word-detail` に加え、単語固有のタグ `word-detail-${slug}` を追加。
- **目的**: 特定の単語だけをピンポイントでキャッシュパージ可能にする。
- **Changes**: Added a word-specific tag `word-detail-${slug}` alongside `word-detail`.
- **Purpose**: Enable targeted cache purging for specific words.

### C. 再検証API (Revalidation API)
- **ファイル**: `src/app/api/revalidate/words/route.ts`
- **変更点**: パージ対象を `word-list` に変更。
- **Changes**: Changed the purge target to `word-list`.

---

## 2. 重要なアーキテクチャ上の注意点：ISR Writesについて (Important Architectural Note: Regarding ISR Writes)

### 現在の課題 (Current Issue)
今回のタグ分離により論理的な分離は行われましたが、Next.jsの `use cache` の仕様上、**「Blob更新時に全詳細ページが一斉に再生成される」現象を完全に防ぐことはできていません。**

Although logical separation was achieved, due to the behavior of Next.js's `use cache`, **this does not completely prevent the phenomenon where "all detail pages are regenerated at once upon Blob update."**

### 原因 (Cause)
単語詳細ページ (`src/app/words/[word]/page.tsx`) 内で、関連単語や内部リンク生成のために `getAllWords()` や `getRelatedWords()` を呼び出しています。
これらの関数は内部で `word-list` キャッシュに依存しているため、Next.jsの仕様により、**詳細ページ全体に `word-list` タグが伝播（依存）** してしまいます。
結果として、APIで `word-list` をパージすると、それに依存している全ての詳細ページが再生成（stale）の対象となります。

Inside the word detail page, functions like `getAllWords()` and `getRelatedWords()` are called to generate related words and internal links.
Because these functions depend on the `word-list` cache internally, Next.js behavior causes the **`word-list` tag to propagate to the entire detail page**.
Consequently, purging `word-list` via API makes all detail pages that depend on it subject to regeneration (stale).

### 今後の解決案 (Future Solutions)
VercelのISR Writesコストを根本的に削減するには、以下のアーキテクチャ変更を検討する必要があります。
To fundamentally reduce Vercel's ISR Writes costs, consider the following architectural changes:

1. **関連データのクライアントサイドフェッチ (Client-side fetching for related data)**
   - **内容**: 詳細ページ（SSR）では `getWordDetail()` のみに依存させ、リストデータ (`getAllWords`) をSSR時に呼び出さない。関連単語や内部リンクの処理はClient Component内で非同期にフェッチする。
   - **メリット**: サーバーサイドでのキャッシュ依存が切れ、ISR Writesを劇的に削減できる。
   - **デメリット**: 関連リンクがSSRされないため、内部リンクによるSEO効果が低下する可能性がある。
   - **Details**: Make the detail page (SSR) depend only on `getWordDetail()`, and avoid calling list data (`getAllWords`) during SSR. Fetch related words and internal links asynchronously in Client Components.

2. **Next.js `use cache` から外部キャッシュへの移行 (Migrate from Next.js `use cache` to External Cache)**
   - **内容**: `getWordsData()` から Next.js の `use cache` を外し、Node.jsのインメモリキャッシュやUpstash Redis等でリストデータを管理する。
   - **メリット**: Next.jsのキャッシュタグシステム（タグの自動伝播）から外れるため、ページ全体がstaleになるのを防げる。SEOへの影響もない。
   - **デメリット**: 自前でのキャッシュ管理（TTLやパージのロジック）を実装・保守する手間が増える。
   - **Details**: Remove Next.js `use cache` from `getWordsData()` and manage list data using Node.js in-memory cache or Upstash Redis.
