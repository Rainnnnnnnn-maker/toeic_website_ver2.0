import "server-only";
import {
  SEMANTIC_INDEX_VERSION_KEY,
  parseSemanticIndexVersion,
} from "./semantic-search";
import { getRedis } from "./upstash";

/** 現在の Vector コーパス世代。未作成・不正値は 0 として扱う。 */
export async function getSemanticIndexVersion(): Promise<number> {
  const raw = await getRedis().get<number | string>(SEMANTIC_INDEX_VERSION_KEY);
  return parseSemanticIndexVersion(raw);
}

/**
 * Vector 更新完了後にコーパス世代を進める。
 * 世代を検索キャッシュキーへ含めることで、旧結果を一括で参照不能にする。
 */
export async function bumpSemanticIndexVersion(): Promise<number> {
  const version = await getRedis().incr(SEMANTIC_INDEX_VERSION_KEY);
  return parseSemanticIndexVersion(version);
}
