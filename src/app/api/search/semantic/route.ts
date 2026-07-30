import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/upstash";
import { isSameHost } from "@/lib/tts-utils";
import { embedText } from "@/lib/embeddings";
import { getVectorIndex, isVectorConfigured } from "@/lib/vector";
import {
  SEMANTIC_CACHE_TTL_SECONDS,
  SEMANTIC_QUERY_MAX_LENGTH,
  SEMANTIC_SEARCH_TOP_K,
  normalizeSemanticQuery,
  parseSemanticSearchResults,
  semanticQueryCacheKey,
  toSemanticSearchResults,
  type SemanticSearchResult,
} from "@/lib/semantic-search";

let ratelimitInstance: Ratelimit | undefined;

function getRatelimit(): Ratelimit {
  if (ratelimitInstance) return ratelimitInstance;
  ratelimitInstance = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "rl:semsearch",
  });
  return ratelimitInstance;
}

type ValidationError = { error: string; status: number };

function validateSecurityHeaders(request: Request): ValidationError | null {
  const sourceHeader = request.headers.get("X-App-Source");
  if (sourceHeader !== "toeic-client") {
    return { error: "Unauthorized source", status: 403 };
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (host && !isSameHost(origin, host) && !isSameHost(referer, host)) {
    return { error: "Unauthorized origin", status: 403 };
  }

  return null;
}

async function parseQuery(request: Request): Promise<{ query: string } | ValidationError> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.query !== "string") {
    return { error: "Invalid request body", status: 400 };
  }

  const query = normalizeSemanticQuery(body.query);
  if (!query) {
    return { error: "Query is empty", status: 400 };
  }
  if (query.length > SEMANTIC_QUERY_MAX_LENGTH) {
    return { error: "Query too long", status: 400 };
  }

  return { query };
}

async function getCachedResults(cacheKey: string): Promise<SemanticSearchResult[] | null> {
  try {
    const value = await getRedis().get<string | unknown[]>(cacheKey);
    if (!value) return null;
    return parseSemanticSearchResults(value);
  } catch (e) {
    console.warn("Semantic search cache read failed:", e);
    return null;
  }
}

async function cacheResults(cacheKey: string, results: SemanticSearchResult[]): Promise<void> {
  try {
    await getRedis().set(cacheKey, JSON.stringify(results), { ex: SEMANTIC_CACHE_TTL_SECONDS });
  } catch (e) {
    console.warn("Semantic search cache write failed:", e);
  }
}

function extractIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

async function checkRateLimit(ip: string) {
  const result = await getRatelimit().limit(ip);
  if (result.success) return null;

  return {
    error: "Too Many Requests",
    status: 429 as const,
    headers: {
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(result.reset),
      "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
    },
  };
}

export async function POST(request: Request) {
  const securityError = validateSecurityHeaders(request);
  if (securityError) {
    return Response.json({ error: securityError.error }, { status: securityError.status });
  }

  if (!isVectorConfigured()) {
    return Response.json({ error: "Semantic search is not configured" }, { status: 503 });
  }

  const parseResult = await parseQuery(request);
  if ("error" in parseResult) {
    return Response.json({ error: parseResult.error }, { status: parseResult.status });
  }

  const { query } = parseResult;
  const cacheKey = semanticQueryCacheKey(query);

  // キャッシュヒットはレート制限を消費しない（TTS と同じ方針）
  const cached = await getCachedResults(cacheKey);
  if (cached) {
    return Response.json({ results: cached, cached: true });
  }

  const ip = extractIp(request);
  const rateLimitError = await checkRateLimit(ip);
  if (rateLimitError) {
    return Response.json(
      { error: rateLimitError.error },
      { status: rateLimitError.status, headers: rateLimitError.headers }
    );
  }

  try {
    const vector = await embedText(query, "RETRIEVAL_QUERY");
    const matches = await getVectorIndex().query({
      vector,
      topK: SEMANTIC_SEARCH_TOP_K,
      includeMetadata: true,
    });
    const results = toSemanticSearchResults(matches);

    // インデックス投入前などの空結果を7日間キャッシュしないよう、結果がある場合のみ保存
    if (results.length > 0) {
      await cacheResults(cacheKey, results);
    }

    return Response.json({ results, cached: false });
  } catch (e) {
    console.error("Semantic search failed:", e);
    return Response.json({ error: "Semantic search failed" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json(
    {
      error: "Method Not Allowed",
      message: "This endpoint requires a POST request with a JSON body containing the 'query'.",
    },
    { status: 405, headers: { Allow: "POST" } }
  );
}
