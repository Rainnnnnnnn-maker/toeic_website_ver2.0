/**
 * 全単語の WordDetails を embedding 化して Upstash Vector に投入するスクリプト。
 *
 * 実行方法:
 *   npm run embed:words                     # 全単語を投入
 *   npm run embed:words -- --dry-run        # 投入せず、キャッシュ状況とサンプルテキストを表示
 *   npm run embed:words -- --limit=20       # 先頭20語のみ（動作確認用）
 *   npm run embed:words -- --only-cached    # Redis にある単語のみ（Gemini 生成をスキップ）
 *   npm run embed:words -- --source=local   # 単語リストの取得元を明示（既定は blob）
 *
 * 単語リストは本番サイトと同じ `src/lib/word-source.ts` 経由で読み込む。
 * 既定は本番と同じ Vercel Blob（NODE_ENV=development のときのみ __words__/*.txt）。
 * ローカルの `__words__/*.txt` が Blob と食い違っていても、投入されるのは
 * 実際に配信されているコーパスなので、本番限定の単語が検索不能になったり
 * 削除済みの単語が 404 リンクとして残ったりしない。
 *
 * データフロー（1単語ごと）:
 *   Redis(L2) から WordDetails を取得 → 無ければ Gemini で生成して Redis に保存
 *   → buildEmbeddingText でドキュメント化 → gemini-embedding-001 で embedding
 *   → Upstash Vector に upsert（メタデータ: slug / term / level / japaneseTranslation）
 *
 * 必要な環境変数（--env-file=.env.local で読み込む）:
 *   GEMINI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN,
 *   UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN,
 *   BLOB_URL_IMPORTANT / BLOB_URL_MEDIUM / BLOB_URL_HIGH もしくは BLOB_READ_WRITE_TOKEN
 *   （--source=local のときは Blob 系は不要）
 *
 * `server-only` は Next.js の Client Component 誤 import を検出するマーカーであり、
 * このファイルは `tsx` で直接動かす Node.js CLI なので import しない。
 * 通常の Node.js 条件で import すると marker package 自体が例外を投げる。
 */
import { GoogleGenAI } from "@google/genai";
import { Redis } from "@upstash/redis";
import { Index, type RangeResult } from "@upstash/vector";
import {
  hasDirectBlobUrls,
  loadWordData,
  resolveDefaultWordSource,
  type WordSource,
} from "../src/lib/word-source";
import { parseStoredWordDetails } from "../src/lib/word-detail-parse";
import { generateWordDetail } from "../src/lib/word-detail-gemini";
import {
  GEMINI_RETRY_POLICY,
  HTTP_TIMEOUT_MS,
  retryWithTimeout,
} from "../src/lib/http-retry";
import { createVectorRequester } from "../src/lib/vector-requester";
import {
  EMBEDDING_DIMENSION,
  EMBEDDING_MODEL,
  SEMANTIC_INDEX_VERSION_KEY,
  buildEmbeddingText,
  normalizeVector,
  type WordVectorMetadata,
} from "../src/lib/semantic-search";
import {
  findStaleWordVectorIds,
  shouldPruneStaleWordVectors,
  type VectorInventoryItem,
} from "../src/lib/semantic-index-sync";
import type { Word } from "../src/data/words";
import type { WordDetails } from "../src/types/word";

const REDIS_MGET_BATCH = 100;
const EMBED_BATCH = 16;
const UPSERT_BATCH = 100;
const VECTOR_RANGE_BATCH = 1000;
const GEMINI_DELAY_MS = 300;
const EMBED_DELAY_MS = 200;

type Args = {
  dryRun: boolean;
  onlyCached: boolean;
  limit: number | null;
  source: WordSource | null;
};

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false, onlyCached: false, limit: null, source: null };
  for (const arg of argv) {
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--only-cached") args.onlyCached = true;
    else if (arg.startsWith("--limit=")) {
      const n = Number(arg.slice("--limit=".length));
      if (Number.isFinite(n) && n > 0) args.limit = Math.floor(n);
    } else if (arg.startsWith("--source=")) {
      const value = arg.slice("--source=".length);
      if (value !== "local" && value !== "blob") {
        console.error(`Invalid --source: ${value} (expected "local" or "blob")`);
        process.exit(1);
      }
      args.source = value;
    } else {
      console.warn(`Unknown argument ignored: ${arg}`);
    }
  }
  return args;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

/**
 * 本番サイトと同じローダー（src/lib/word-source.ts）でコーパスを読み込む。
 * Blob 取得元では認証情報が必須なので、失敗を後段まで引きずらないよう先に検証する。
 */
async function loadAllWords(source: WordSource): Promise<Word[]> {
  if (source === "blob" && !hasDirectBlobUrls()) {
    requireEnv("BLOB_READ_WRITE_TOKEN");
  }
  const data = await loadWordData(source);
  return data.allWords;
}

function redisKey(slug: string): string {
  return `word:${slug}`;
}

function redisTtlSeconds(): number {
  const days = Number(process.env.WORD_CACHE_TTL_DAYS ?? "30");
  const validDays = Number.isFinite(days) && days > 0 ? days : 30;
  return validDays * 24 * 60 * 60;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCachedDetails(
  redis: Redis,
  words: Word[]
): Promise<Map<string, WordDetails>> {
  const detailsBySlug = new Map<string, WordDetails>();
  for (let i = 0; i < words.length; i += REDIS_MGET_BATCH) {
    const batch = words.slice(i, i + REDIS_MGET_BATCH);
    const values = await redis.mget<(string | WordDetails | null)[]>(
      ...batch.map((w) => redisKey(w.slug))
    );
    values.forEach((value, index) => {
      const detail = parseStoredWordDetails(value);
      if (detail) detailsBySlug.set(batch[index].slug, detail);
    });
  }
  return detailsBySlug;
}

async function embedTexts(genai: GoogleGenAI, texts: string[]): Promise<number[][]> {
  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH) {
    const batch = texts.slice(i, i + EMBED_BATCH);
    const response = await retryWithTimeout(
      (signal) =>
        genai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: batch,
          config: {
            taskType: "RETRIEVAL_DOCUMENT",
            outputDimensionality: EMBEDDING_DIMENSION,
            abortSignal: signal,
          },
        }),
      { ...GEMINI_RETRY_POLICY.embedding, label: "gemini embedding batch" }
    );
    const embeddings = response.embeddings ?? [];
    if (embeddings.length !== batch.length) {
      throw new Error(
        `Embedding count mismatch: expected ${batch.length}, got ${embeddings.length}`
      );
    }
    for (const embedding of embeddings) {
      const values = embedding.values;
      if (!values || values.length !== EMBEDDING_DIMENSION) {
        throw new Error(`Unexpected embedding dimension: ${values?.length ?? 0}`);
      }
      vectors.push(normalizeVector(values));
    }
    console.log(`  embedded ${Math.min(i + EMBED_BATCH, texts.length)}/${texts.length}`);
    if (i + EMBED_BATCH < texts.length) await sleep(EMBED_DELAY_MS);
  }
  return vectors;
}

async function readVectorInventory(
  index: Index<WordVectorMetadata>
): Promise<VectorInventoryItem[]> {
  const inventory: VectorInventoryItem[] = [];
  const visitedCursors = new Set<string>();
  let cursor: string | number = 0;

  while (true) {
    const cursorKey = String(cursor);
    if (visitedCursors.has(cursorKey)) {
      throw new Error(`Vector range returned a repeated cursor: ${cursorKey}`);
    }
    visitedCursors.add(cursorKey);

    const page: RangeResult<WordVectorMetadata> = await index.range({
      cursor,
      limit: VECTOR_RANGE_BATCH,
      includeVectors: false,
      includeMetadata: true,
    });
    inventory.push(...page.vectors);

    if (page.nextCursor === "") break;
    cursor = page.nextCursor;
  }

  return inventory;
}

async function pruneStaleWordVectors(
  index: Index<WordVectorMetadata>,
  corpusWords: readonly Word[]
): Promise<{ scanned: number; stale: number; deleted: number }> {
  const inventory = await readVectorInventory(index);
  const staleIds = findStaleWordVectorIds(
    inventory,
    corpusWords.map((word) => word.slug)
  );

  if (staleIds.length === 0) {
    return { scanned: inventory.length, stale: 0, deleted: 0 };
  }

  const { deleted } = await index.delete(staleIds);
  if (deleted !== staleIds.length) {
    throw new Error(
      `Stale vector deletion mismatch: expected ${staleIds.length}, deleted ${deleted}`
    );
  }

  return { scanned: inventory.length, stale: staleIds.length, deleted };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  requireEnv("UPSTASH_REDIS_REST_URL");
  requireEnv("UPSTASH_REDIS_REST_TOKEN");
  if (!args.dryRun) {
    // embedding 生成にも Gemini API を使うため、--only-cached でも必須
    requireEnv("GEMINI_API_KEY");
    requireEnv("UPSTASH_VECTOR_REST_URL");
    requireEnv("UPSTASH_VECTOR_REST_TOKEN");
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    retry: { retries: 1, backoff: () => 200 },
    signal: () => AbortSignal.timeout(HTTP_TIMEOUT_MS.redis),
  });

  const source = args.source ?? resolveDefaultWordSource();
  console.log(`Word source: ${source}${args.source ? "" : " (default)"}`);

  const corpusWords = await loadAllWords(source);
  if (corpusWords.length === 0) {
    console.error(
      `No words loaded from ${source === "local" ? "__words__/" : "Vercel Blob"}. Aborting.`
    );
    process.exit(1);
  }
  const words =
    args.limit === null ? corpusWords : corpusWords.slice(0, args.limit);
  console.log(`Target words: ${words.length}`);

  // Phase 1: WordDetails の収集（Redis 優先 → Gemini 生成）
  console.log("Phase 1: collecting WordDetails from Redis...");
  const detailsBySlug = await fetchCachedDetails(redis, words);
  const missing = words.filter((w) => !detailsBySlug.has(w.slug));
  console.log(`  cached: ${detailsBySlug.size}, missing: ${missing.length}`);

  if (args.dryRun) {
    const sample = words.find((w) => detailsBySlug.has(w.slug));
    if (sample) {
      console.log(`\n--- Sample embedding text (${sample.term}) ---`);
      console.log(buildEmbeddingText(sample.term, detailsBySlug.get(sample.slug)!));
      console.log("---");
    }
    if (missing.length > 0) {
      console.log(`\nWords that would be generated by Gemini (${missing.length}):`);
      console.log(missing.slice(0, 20).map((w) => w.term).join(", ") + (missing.length > 20 ? ", ..." : ""));
    }
    console.log("\nDry run finished. No embeddings were created.");
    return;
  }

  const failures: { slug: string; error: string }[] = [];

  if (!args.onlyCached && missing.length > 0) {
    console.log(`Generating ${missing.length} missing WordDetails with Gemini...`);
    // タイムアウトを切っておかないと、1 単語の応答待ちでバッチ全体が止まりうる。
    // 失敗した単語は failures に記録して次へ進む。
    const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    let processed = 0;
    for (const word of missing) {
      try {
        const detail = await generateWordDetail(genai, word.term);
        await redis.set(redisKey(word.slug), JSON.stringify(detail), { ex: redisTtlSeconds() });
        detailsBySlug.set(word.slug, detail);
      } catch (e) {
        failures.push({ slug: word.slug, error: e instanceof Error ? e.message : String(e) });
      }
      processed += 1;
      if (processed % 25 === 0 || processed === missing.length) {
        console.log(`  generated ${processed}/${missing.length} (failed: ${failures.length})`);
      }
      await sleep(GEMINI_DELAY_MS);
    }
  }

  const targets = words.filter((w) => detailsBySlug.has(w.slug));
  if (targets.length === 0) {
    console.error("No WordDetails available to embed. Aborting.");
    process.exit(1);
  }

  // Phase 2: embedding 生成
  console.log(`Phase 2: embedding ${targets.length} documents with ${EMBEDDING_MODEL} (dim=${EMBEDDING_DIMENSION})...`);
  const genai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const texts = targets.map((w) => buildEmbeddingText(w.term, detailsBySlug.get(w.slug)!));
  const vectors = await embedTexts(genai, texts);

  // Phase 3: Upstash Vector へ upsert
  console.log("Phase 3: upserting into Upstash Vector...");
  const index = new Index<WordVectorMetadata>(
    createVectorRequester({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
      timeoutMs: HTTP_TIMEOUT_MS.vector,
      retries: 2,
    })
  );
  for (let i = 0; i < targets.length; i += UPSERT_BATCH) {
    const batch = targets.slice(i, i + UPSERT_BATCH).map((word, offset) => ({
      id: word.slug,
      vector: vectors[i + offset],
      metadata: {
        slug: word.slug,
        term: word.term,
        level: word.level,
        japaneseTranslation: detailsBySlug.get(word.slug)!.japaneseTranslation ?? "",
      },
    }));
    await index.upsert(batch);
    console.log(`  upserted ${Math.min(i + UPSERT_BATCH, targets.length)}/${targets.length}`);
  }

  // Phase 4: Blob の全件投入が成功した場合だけ、現行コーパス外の旧単語ベクトルを削除する。
  // local / --limit / --only-cached / 生成失敗時は部分コーパスを正と誤認しないよう削除しない。
  const canPruneStaleVectors = shouldPruneStaleWordVectors({
    source,
    limit: args.limit,
    onlyCached: args.onlyCached,
    corpusCount: corpusWords.length,
    targetCount: targets.length,
    failureCount: failures.length,
  });
  let pruneResult = { scanned: 0, stale: 0, deleted: 0 };
  let pruneError: unknown = null;

  if (canPruneStaleVectors) {
    console.log("Phase 4: pruning stale word vectors...");
    try {
      pruneResult = await pruneStaleWordVectors(index, corpusWords);
      console.log(
        `  scanned: ${pruneResult.scanned}, stale: ${pruneResult.stale}, deleted: ${pruneResult.deleted}`
      );
    } catch (error) {
      // upsert は既に完了しているため、結果キャッシュを旧世代へ固定しないよう
      // 世代を進めてから失敗終了する。
      pruneError = error;
      console.error("  stale vector pruning failed");
    }
  } else {
    console.log("Phase 4: stale vector pruning skipped (partial or non-Blob run).");
  }

  // 全 upsert（および可能なら削除同期）後に世代を進め、旧検索結果を参照不能にする。
  const semanticIndexVersion = await redis.incr(SEMANTIC_INDEX_VERSION_KEY);

  if (pruneError) {
    throw pruneError;
  }

  const info = await index.info();
  console.log("\n=== Summary ===");
  console.log(`upserted: ${targets.length}`);
  console.log(`stale vectors deleted: ${pruneResult.deleted}`);
  console.log(`semantic index version: ${semanticIndexVersion}`);
  console.log(`generation failures: ${failures.length}`);
  for (const f of failures) console.log(`  - ${f.slug}: ${f.error}`);
  console.log(`index vector count: ${info.vectorCount} (dimension: ${info.dimension})`);
  if (info.dimension !== EMBEDDING_DIMENSION) {
    console.warn(
      `WARNING: index dimension ${info.dimension} != EMBEDDING_DIMENSION ${EMBEDDING_DIMENSION}. Recreate the index with ${EMBEDDING_DIMENSION} dims.`
    );
  }
  if (failures.length > 0) {
    console.log("Re-run the script to retry failed words (cached words are skipped automatically).");
  }
}

main().catch((e) => {
  console.error("embed-words failed:", e);
  process.exit(1);
});
