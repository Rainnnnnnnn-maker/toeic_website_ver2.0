import { createHash } from "crypto";
import type { WordDetails } from "@/types/word";
import { WORD_LEVEL_ORDER } from "@/lib/word-level";
import type { WordLevel } from "@/lib/word-level";

/**
 * セマンティック検索の純粋ロジック。
 * `server-only` や Gemini SDK / Upstash SDK に依存しないため単体テスト可能。
 * `src/lib/embeddings.ts` / `src/lib/word-embedding.ts` /
 * `/api/search/semantic` / `scripts/embed-words.ts` から利用される。
 */

/** embedding モデル。Upstash Vector 側のインデックス次元数と揃えること。 */
export const EMBEDDING_MODEL = "gemini-embedding-001";
/**
 * embedding の出力次元数。Upstash Vector のインデックス作成時の次元数と一致させる。
 * gemini-embedding-001 は 3072 以外の次元では正規化済みベクトルを返さないため、
 * 必ず normalizeVector を通してから投入・検索する。
 */
export const EMBEDDING_DIMENSION = 768;
/** 近傍検索で返す件数。 */
export const SEMANTIC_SEARCH_TOP_K = 10;
/** 無関係な近傍候補を除外する既定の最低類似度。 */
export const DEFAULT_SEMANTIC_MIN_SCORE = 0.82;
/** 検索クエリの最大文字数（正規化後）。定義はクライアント安全な semantic-launch.ts 側。 */
export { SEMANTIC_QUERY_MAX_LENGTH } from "./semantic-launch";
/** 検索結果の Redis キャッシュ TTL（秒）。 */
export const SEMANTIC_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60;
/** Vector コーパス更新時に増分する Redis キー。 */
export const SEMANTIC_INDEX_VERSION_KEY = "semsearch:index-version";

/** Upstash Vector に保存するメタデータ。結果表示に必要な最小限の情報を持つ。 */
export type WordVectorMetadata = {
  slug: string;
  term: string;
  level: WordLevel;
  japaneseTranslation: string;
};

/** `/api/search/semantic` が返す 1 件分の検索結果。 */
export type SemanticSearchResult = {
  slug: string;
  term: string;
  level: WordLevel;
  japaneseTranslation: string;
  /** Upstash Vector のコサイン類似度スコア（0〜1、高いほど関連が強い）。 */
  score: number;
};

/**
 * 検索クエリを正規化する。
 * NFKC 正規化（全角英数→半角など）→ 空白の圧縮 → 前後空白除去 → 小文字化。
 * 同一クエリのキャッシュヒット率を上げるために使う。
 */
export function normalizeSemanticQuery(raw: string): string {
  return raw.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Redis 値を安全な非負整数のコーパス世代へ変換する。 */
export function parseSemanticIndexVersion(raw: unknown): number {
  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string" && /^\d+$/.test(raw)
        ? Number(raw)
        : Number.NaN;
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

/** 正規化済みクエリと Vector コーパス世代から Redis キャッシュキーを生成する。 */
export function semanticQueryCacheKey(normalizedQuery: string, indexVersion: number): string {
  const hash = createHash("sha256").update(normalizedQuery).digest("hex").slice(0, 16);
  return `semsearch:v3:${parseSemanticIndexVersion(indexVersion)}:${hash}`;
}

/** 環境変数の最低類似度を 0〜1 の範囲で解決する。 */
export function resolveSemanticMinScore(raw: string | undefined): number {
  if (!raw?.trim()) return DEFAULT_SEMANTIC_MIN_SCORE;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= 1
    ? value
    : DEFAULT_SEMANTIC_MIN_SCORE;
}

/** ベクトルを L2 正規化する。ゼロベクトルはそのまま返す。 */
export function normalizeVector(values: number[]): number[] {
  let sumOfSquares = 0;
  for (const v of values) sumOfSquares += v * v;
  const norm = Math.sqrt(sumOfSquares);
  if (norm === 0) return values;
  return values.map((v) => v / norm);
}

function pushIfPresent(lines: string[], label: string, value: string | undefined): void {
  const trimmed = value?.trim();
  if (trimmed) lines.push(`${label}: ${trimmed}`);
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

/**
 * WordDetails から embedding 用のドキュメントテキストを組み立てる。
 * 1語 = 1ドキュメント。日本語の意味・定義・類義語・例文をまとめて
 * 「日本語の意味ベース検索」にヒットしやすい形にする。
 */
export function buildEmbeddingText(term: string, detail: WordDetails): string {
  const lines: string[] = [`単語: ${term}`];

  pushIfPresent(lines, "日本語訳", detail.japaneseTranslation);
  pushIfPresent(lines, "英語定義", detail.englishDefinition);
  pushIfPresent(lines, "ニュアンス", detail.nuance);

  for (const meaning of detail.meanings) {
    const partOfSpeech = meaning.partOfSpeech.trim();
    const summary = meaning.meaning.trim();
    if (partOfSpeech || summary) {
      lines.push(`品詞: ${[partOfSpeech, summary].filter(Boolean).join(" — ")}`);
    }
    for (const dm of meaning.detailedMeanings) {
      pushIfPresent(lines, "定義", dm.definition);
      pushIfPresent(lines, "使用場面", dm.context);
    }
  }

  const synonyms = dedupeStrings([
    ...detail.synonyms,
    ...detail.meanings.flatMap((m) => m.detailedMeanings.flatMap((dm) => dm.synonyms)),
  ]);
  if (synonyms.length > 0) lines.push(`類義語: ${synonyms.join(", ")}`);

  const collocations = dedupeStrings(detail.collocations ?? []);
  if (collocations.length > 0) lines.push(`コロケーション: ${collocations.join(", ")}`);

  for (const ex of detail.toeicExamples) {
    const english = ex.english.trim();
    const japanese = ex.japanese.trim();
    if (english || japanese) {
      lines.push(`例文: ${[english, japanese].filter(Boolean).join(" / ")}`);
    }
  }

  return lines.join("\n");
}

function isWordLevel(value: unknown): value is WordLevel {
  return typeof value === "string" && (WORD_LEVEL_ORDER as readonly string[]).includes(value);
}

/** Upstash Vector の query 結果 1 件分（SDK 型に依存しない最小の形）。 */
export type VectorMatch = {
  id: string | number;
  score: number;
  metadata?: Record<string, unknown>;
};

/**
 * Upstash Vector の query 結果を SemanticSearchResult の配列へ変換する。
 * メタデータが欠損・不正な match は除外する。
 */
export function toSemanticSearchResults(matches: VectorMatch[]): SemanticSearchResult[] {
  const results: SemanticSearchResult[] = [];
  for (const match of matches) {
    const meta = match.metadata;
    if (!meta) continue;
    const { slug, term, level } = meta;
    if (typeof slug !== "string" || !slug) continue;
    if (typeof term !== "string" || !term) continue;
    if (!isWordLevel(level)) continue;
    results.push({
      slug,
      term,
      level,
      japaneseTranslation:
        typeof meta.japaneseTranslation === "string" ? meta.japaneseTranslation : "",
      score: typeof match.score === "number" ? match.score : 0,
    });
  }
  return results;
}

/** 最低類似度未満の候補を除外する。入力順（関連度順）は維持する。 */
export function filterSemanticSearchResults(
  results: SemanticSearchResult[],
  minScore: number
): SemanticSearchResult[] {
  return results.filter((result) => Number.isFinite(result.score) && result.score >= minScore);
}

/**
 * `/api/search/semantic` のレスポンス（またはその Redis キャッシュ値）から
 * 結果配列を安全に取り出す。形が不正なら null。
 */
export function parseSemanticSearchResults(raw: unknown): SemanticSearchResult[] | null {
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  if (!Array.isArray(value)) return null;

  const results: SemanticSearchResult[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    if (typeof record.slug !== "string" || !record.slug) return null;
    if (typeof record.term !== "string" || !record.term) return null;
    if (!isWordLevel(record.level)) return null;
    results.push({
      slug: record.slug,
      term: record.term,
      level: record.level,
      japaneseTranslation:
        typeof record.japaneseTranslation === "string" ? record.japaneseTranslation : "",
      score: typeof record.score === "number" ? record.score : 0,
    });
  }
  return results;
}
