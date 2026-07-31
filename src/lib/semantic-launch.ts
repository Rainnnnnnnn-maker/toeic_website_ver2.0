/**
 * TOP の AI 検索カードと /words の「意味で探す」タブをつなぐ
 * URL パラメータ（?mode=meaning&launch=...）の純粋ロジック。
 * クライアントコンポーネントから import されるため、Node 組み込み（crypto 等）に
 * 依存させないこと（`semantic-search.ts` と分離している理由）。
 */

/** 検索クエリの最大文字数。API 側の検証（semantic-search.ts）と共有する。 */
export const SEMANTIC_QUERY_MAX_LENGTH = 100;
const SEMANTIC_LAUNCH_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export type SemanticLaunchParams = {
  mode: "term" | "meaning";
  launchId: string;
};

/** TOP から受け渡す検索語を API と同じ上限へ正規化する。 */
export function normalizeSemanticLaunchQuery(rawQuery: string): string {
  return rawQuery.trim().slice(0, SEMANTIC_QUERY_MAX_LENGTH);
}

/** URL に載せてもよい不透明な起動 ID かを検証する。 */
export function isValidSemanticLaunchId(launchId: string): boolean {
  return SEMANTIC_LAUNCH_ID_PATTERN.test(launchId);
}

/** `/words` に遷移するための検索 URL を組み立てる。 */
export function buildSemanticSearchUrl(rawLaunchId = ""): string {
  const launchParam = isValidSemanticLaunchId(rawLaunchId)
    ? `&launch=${encodeURIComponent(rawLaunchId)}`
    : "";
  return `/words?mode=meaning${launchParam}#word-explorer`;
}

/**
 * URL から検索モードと不透明な起動 ID を取り出す。
 * 検索語そのものは URL に含めず、同一タブの sessionStorage から別途取得する。
 */
export function parseSemanticLaunchParams(search: string): SemanticLaunchParams {
  const params = new URLSearchParams(search);
  if (params.get("mode") !== "meaning") {
    return { mode: "term", launchId: "" };
  }
  const launchId = params.get("launch") ?? "";
  return {
    mode: "meaning",
    launchId: isValidSemanticLaunchId(launchId) ? launchId : "",
  };
}
