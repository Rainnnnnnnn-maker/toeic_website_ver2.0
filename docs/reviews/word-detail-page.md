# 単語詳細ページ (`src/app/words/[word]/page.tsx`) 実装レビュー

## 概要
`src/app/words/[word]/page.tsx` および関連ファイルのコードレビューを行いました。
全体的にNext.jsのApp Routerの機能（Server Components, GenerateMetadata, SSG）を活用した構成になっていますが、パフォーマンスと設計の観点でいくつか改善の余地があります。

## 改善点まとめ

### 1. パフォーマンス・レンダリング最適化（重要）

**課題: `Suspense` が機能していない（ブロッキングレンダリング）**
`WordPage` コンポーネント内で `await getWordDetail(word)` を実行しているため、このデータ取得が完了するまでページ全体のレンダリングがブロックされます。その結果、子コンポーネントである `WordDetailFetcher` を囲んでいる `<Suspense>` は、初期表示時にはすでにデータが揃っているため、ローディング状態（`loading.tsx`）を表示する機会がほとんどありません（または全くありません）。

*   **現状:**
    ```typescript
    export default async function WordPage({ params }: PageProps) {
      // ここで待機してしまうため、レンダリングがブロックされる
      let detail = null;
      try {
        detail = await getWordDetail(word);
      } catch ...

      return (
        // データ取得済みなのでSuspenseの意味が薄れている
        <Suspense fallback={<Loading />}>
          <WordDetailFetcher word={word} />
        </Suspense>
      );
    }
    ```
*   **改善案:**
    *   **方針A（推奨 - SEO重視）:** 現在のブロッキング挙動を維持し、`Suspense` を削除するか、あるいは「ストリーミングしたい部分」と「即座に表示したい部分」を明確に分ける。JSON-LDのために詳細データが必要なため、SSG/ISRとしては現在の「データ取得後にレンダリング」が正しい姿です。その場合、`Suspense` は不要かもしれません。
    *   **方針B（UX重視 - ストリーミング）:** `WordPage` でのデータ待機をやめ、JSON-LDには基本情報（`getWordBySlug`の結果）のみを使用するか、別途非同期で注入する（ただしSEO的に不利になる可能性あり）。

### 2. データ取得の効率化

**課題: データの二重取得**
1.  `WordPage` で `await getWordDetail(word)` を実行。
2.  `WordDetailFetcher` で再度 `await getWordDetail(word)` を実行。

Next.js の Request Memoization（同一リクエスト内での重複排除）や `getWordDetail` のキャッシュ機能により、実際のリソース消費は最小限に抑えられていますが、関数呼び出しとキャッシュルックアップのオーバーヘッドが発生しています。

*   **改善案:**
    `WordPage` で取得した `detail` データを `WordDetailFetcher` にプロップスとして渡すことで、子コンポーネントでの再取得を回避できます。
    ```typescript
    // WordPage
    <WordDetailFetcher word={word} initialData={detail} />

    // WordDetailFetcher
    function WordDetailFetcher({ word, initialData }: { word: string, initialData: WordDetails | null }) {
      const detailData = initialData || await getWordDetail(word);
      // ...
    }
    ```

### 3. コード設計・保守性

**課題: ロジックの混在**
`WordPage` 内に JSON-LD の生成ロジックが直接記述されており、コンポーネントが肥大化しています。

*   **改善案:**
    JSON-LD 生成ロジックを別関数または別ファイル（例: `utils/json-ld.ts`）に切り出すことで、可読性を向上させます。

**課題: クライアントコンポーネントの動的インポート**
`WordDetailClient` を `dynamic(() => ..., { ssr: true })` でインポートしていますが、これが本当に必要か検討が必要です。
*   巨大なライブラリを含まない限り、標準の `import` の方が初期表示（Hydration）のオーバーヘッドが少なくなる場合があります。
*   もし `WordDetailClient` が非常に大きい場合は現状維持で構いません。

### 4. その他

*   **内部リンク生成ロジックの最適化**:
    `WordDetailFetcher` 内で `candidates.forEach` と `allWords.find` を使用してリンク判定を行っています。
    `allWords` は配列であるため、計算量は `O(M * N)` です。単語数が増えた場合、`Map` を使用した `O(1)` ルックアップに変更することを推奨します。現状の規模であれば問題ありません。

## 推奨される改修ステップ

1.  **JSON-LD生成の分離**: コードの見通しを良くするため、ロジックを分離。
2.  **Propsバケツリレーの導入**: `WordPage` で取得したデータを `WordDetailFetcher` へ渡すように変更。
3.  **Suspenseの検討**: SSG/ISR構成であれば、`WordDetailFetcher` の `Suspense` は削除しても良い（または、意図をコメントに残す）。

以上について、修正を進めてよろしいでしょうか？
