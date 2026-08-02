/**
 * セマンティック検索インデックスを現行単語コーパスへ同期するための純粋ロジック。
 * Upstash Vector への range/delete 自体は CLI 側で行い、削除対象と実行条件だけを
 * このモジュールで決定する。
 */

export type VectorInventoryItem = {
  readonly id: string | number;
  readonly metadata?: Record<string, unknown>;
};

export type VectorPruneContext = {
  readonly source: "local" | "blob";
  readonly limit: number | null;
  readonly onlyCached: boolean;
  readonly corpusCount: number;
  readonly targetCount: number;
  readonly failureCount: number;
};

/**
 * 現行コーパスに存在しない、単語ベクトル形式の ID を返す。
 * ID と metadata.slug が一致するレコードだけを対象にして、同じ Vector
 * インデックスに別用途のデータがあっても誤削除しないようにする。
 */
export function findStaleWordVectorIds(
  inventory: readonly VectorInventoryItem[],
  activeSlugs: readonly string[]
): string[] {
  const active = new Set(activeSlugs);
  const stale = new Set<string>();

  for (const item of inventory) {
    if (typeof item.id !== "string") continue;
    const metadataSlug = item.metadata?.slug;
    if (metadataSlug !== item.id) continue;
    if (!active.has(item.id)) stale.add(item.id);
  }

  return [...stale];
}

/**
 * 破壊的な余剰 ID 削除を許可するのは、Blob の全コーパスを欠落なく投入できた場合だけ。
 * local/件数制限/キャッシュ限定/生成失敗などの部分投入では削除しない。
 */
export function shouldPruneStaleWordVectors(context: VectorPruneContext): boolean {
  return (
    context.source === "blob" &&
    context.limit === null &&
    !context.onlyCached &&
    context.failureCount === 0 &&
    context.corpusCount > 0 &&
    context.targetCount === context.corpusCount
  );
}
