import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/upstash";
import { getWordBySlug } from "@/data/words";
import { getWordDetail } from "@/data/word-detail";
import { ttsCacheKey, matchesExample, isSameHost } from "@/lib/tts-utils";

async function isAllowedExampleText(
  text: string,
  language: "en" | "ja",
  wordSlug: string
): Promise<boolean> {
  const entry = await getWordBySlug(wordSlug.trim().toLowerCase());
  if (!entry) return false;

  // Use the full cache chain (L1 → L2 → Gemini) so that an expired Redis entry
  // does not incorrectly reject valid example text that is still in the Next.js
  // Data Cache (L1).
  const detail = await getWordDetail(entry.slug);
  if (!detail) return false;

  return matchesExample(detail, text, language);
}

let ratelimitInstance: Ratelimit | undefined;

function getRatelimit(): Ratelimit {
  if (ratelimitInstance) return ratelimitInstance;
  ratelimitInstance = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "rl:tts",
  });
  return ratelimitInstance;
}

type ValidationError = { error: string; status: number };
type ParseResult = { text: string; language: "en" | "ja"; wordSlug?: string } | ValidationError;

function isValidationError(result: ParseResult | null): result is ValidationError {
  return result !== null && "error" in result;
}

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

function validateApiKey(): ValidationError | null {
  if (!process.env.TTS_API_KEY) {
    return { error: "TTS_API_KEY is not configured", status: 500 };
  }
  return null;
}

async function parseAndValidateBody(request: Request): Promise<ParseResult> {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return { error: "Invalid request body", status: 400 };
  }

  if (body.text.length > 500) {
    return { error: "Text too long", status: 400 };
  }

  const language = body.language === "ja" ? "ja" : "en";
  const wordSlug = typeof body.wordSlug === "string" ? body.wordSlug : undefined;

  return {
    text: body.text.trim(),
    language,
    wordSlug,
  };
}

async function validateAllowlist(
  text: string,
  language: "en" | "ja",
  wordSlug?: string
): Promise<ValidationError | null> {
  const isSingleWord = language === "en" && !/\s/.test(text);

  if (isSingleWord) {
    const entry = await getWordBySlug(text.toLowerCase());
    return entry ? null : { error: "Word not allowed", status: 400 };
  }

  if (!wordSlug) {
    return { error: "wordSlug is required for example text", status: 400 };
  }

  const allowed = await isAllowedExampleText(text, language, wordSlug);
  return allowed ? null : { error: "Example text not allowed", status: 400 };
}

function getVoiceConfig(language: "en" | "ja") {
  return language === "ja"
    ? { languageCode: "ja-JP", name: "ja-JP-Neural2-B" }
    : { languageCode: "en-US", name: "en-US-Wavenet-C" };
}

async function getCachedAudio(cacheKey: string): Promise<string | null> {
  try {
    return await getRedis().get<string>(cacheKey);
  } catch (e) {
    console.warn("TTS cache read failed:", e);
    return null;
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

async function callTtsApi(
  text: string,
  voiceConfig: { languageCode: string; name: string },
  apiKey: string
): Promise<{ success: true; audioContent: string } | ValidationError> {
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: voiceConfig,
          audioConfig: { audioEncoding: "MP3", speakingRate: 0.95 },
        }),
      }
    );

    if (!response.ok) {
      return { error: "Failed to synthesize speech", status: 500 };
    }

    const json = (await response.json()) as { audioContent?: string };
    if (!json.audioContent) {
      return { error: "TTS response did not include audio content", status: 500 };
    }

    return { success: true, audioContent: json.audioContent };
  } catch {
    return { error: "Unexpected error while calling TTS API", status: 500 };
  }
}

async function cacheAudio(cacheKey: string, audioContent: string): Promise<void> {
  try {
    await getRedis().set(cacheKey, audioContent, { ex: 60 * 60 * 24 * 30 });
  } catch (e) {
    console.warn("TTS cache write failed:", e);
  }
}

export async function POST(request: Request) {
  const securityError = validateSecurityHeaders(request);
  if (securityError) {
    return Response.json({ error: securityError.error }, { status: securityError.status });
  }

  const apiKeyError = validateApiKey();
  if (apiKeyError) {
    return Response.json({ error: apiKeyError.error }, { status: apiKeyError.status });
  }

  const parseResult = await parseAndValidateBody(request);
  if (isValidationError(parseResult)) {
    return Response.json({ error: parseResult.error }, { status: parseResult.status });
  }

  const { text, language, wordSlug } = parseResult;

  const allowlistError = await validateAllowlist(text, language, wordSlug);
  if (allowlistError) {
    return Response.json({ error: allowlistError.error }, { status: allowlistError.status });
  }

  const voiceConfig = getVoiceConfig(language);
  const cacheKey = ttsCacheKey(text, language, wordSlug);

  const cachedAudio = await getCachedAudio(cacheKey);
  if (cachedAudio) {
    return Response.json(
      { audioContent: cachedAudio },
      { status: 200, headers: { "Cache-Control": "public, max-age=86400" } }
    );
  }

  const ip = extractIp(request);
  const rateLimitError = await checkRateLimit(ip);
  if (rateLimitError) {
    return Response.json(
      { error: rateLimitError.error },
      { status: rateLimitError.status, headers: rateLimitError.headers }
    );
  }

  const apiKey = process.env.TTS_API_KEY!;
  const audioResult = await callTtsApi(text, voiceConfig, apiKey);

  if ("error" in audioResult) {
    return Response.json({ error: audioResult.error }, { status: audioResult.status });
  }

  await cacheAudio(cacheKey, audioResult.audioContent);

  return Response.json(
    { audioContent: audioResult.audioContent },
    { status: 200, headers: { "Cache-Control": "public, max-age=86400" } }
  );
}

export async function GET() {
  return Response.json(
    {
      error: "Method Not Allowed",
      message:
        "This endpoint requires a POST request with a JSON body containing the 'text' to synthesize.",
    },
    { status: 405, headers: { Allow: "POST" } }
  );
}
