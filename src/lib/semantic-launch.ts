/**
 * TOP の AI 検索カードと /words の「意味で探す」タブをつなぐ
 * URL パラメータ（?mode=meaning&q=...）の純粋ロジック。
 * クライアントコンポーネントから import されるため、Node 組み込み（crypto 等）に
 * 依存させないこと（`semantic-search.ts` と分離している理由）。
 */

/** 検索クエリの最大文字数。API 側の検証（semantic-search.ts）と共有する。 */
export const SEMANTIC_QUERY_MAX_LENGTH = 100;

export type SemanticLaunchParams = {
  mode: "term" | "meaning";
  query: string;
};

/** `/words` に遷移するための検索 URL を組み立てる。 */
export function buildSemanticSearchUrl(rawQuery: string): string {
  const query = rawQuery.trim().slice(0, SEMANTIC_QUERY_MAX_LENGTH);
  return `/words?mode=meaning&q=${encodeURIComponent(query)}#word-explorer`;
}

/**
 * `location.search` から検索モードと初期クエリを取り出す。
 * `mode=meaning` 以外は常に term モード扱いで、クエリも無視する。
 */
export function parseSemanticLaunchParams(search: string): SemanticLaunchParams {
  const params = new URLSearchParams(search);
  if (params.get("mode") !== "meaning") {
    return { mode: "term", query: "" };
  }
  const query = (params.get("q") ?? "").trim().slice(0, SEMANTIC_QUERY_MAX_LENGTH);
  return { mode: "meaning", query };
}
