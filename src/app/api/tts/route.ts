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

export async function POST(request: Request) {
  // Security Check: Verify Custom Header
  const sourceHeader = request.headers.get("X-App-Source");
  if (sourceHeader !== "toeic-client") {
    return Response.json({ error: "Unauthorized source" }, { status: 403 });
  }

  // Security Check: Verify Origin/Referer
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (host) {
    const allowed = isSameHost(origin, host) || isSameHost(referer, host);
    if (!allowed) {
      return Response.json({ error: "Unauthorized origin" }, { status: 403 });
    }
  }

  const apiKey = process.env.TTS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "TTS_API_KEY is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.text.length > 500) {
    return Response.json({ error: "Text too long" }, { status: 400 });
  }

  const language = body.language === "ja" ? "ja" : "en";
  const wordSlug = typeof body.wordSlug === "string" ? body.wordSlug : undefined;

  // Allowlist check: single English words (no whitespace) must exist in the vocabulary list.
  // Multi-word text (or any Japanese text) must match a known example sentence for the wordSlug.
  const trimmedText = body.text.trim();
  const isSingleWord = language === "en" && !/\s/.test(trimmedText);
  if (isSingleWord) {
    const entry = await getWordBySlug(trimmedText.toLowerCase());
    if (!entry) {
      return Response.json({ error: "Word not allowed" }, { status: 400 });
    }
  } else {
    if (!wordSlug) {
      return Response.json({ error: "wordSlug is required for example text" }, { status: 400 });
    }
    const allowed = await isAllowedExampleText(trimmedText, language, wordSlug);
    if (!allowed) {
      return Response.json({ error: "Example text not allowed" }, { status: 400 });
    }
  }

  const voiceConfig =
    language === "ja"
      ? { languageCode: "ja-JP", name: "ja-JP-Neural2-B" }
      : { languageCode: "en-US", name: "en-US-Wavenet-C" };

  const redis = getRedis();
  const cacheKey = ttsCacheKey(body.text, language, wordSlug);

  // L1: Redis TTS cache — cached results bypass rate limiting entirely
  try {
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return Response.json(
        { audioContent: cached },
        { status: 200, headers: { "Cache-Control": "public, max-age=86400" } }
      );
    }
  } catch (e) {
    console.warn("TTS cache read failed:", e);
  }

  // Rate limit only on cache misses (= actual Google TTS API calls)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  const { success, limit, remaining, reset } = await getRatelimit().limit(ip);
  if (!success) {
    return Response.json(
      { error: "Too Many Requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: body.text },
          voice: voiceConfig,
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.95,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      return Response.json({ error: "Failed to synthesize speech" }, { status: 500 });
    }

    const json = (await ttsResponse.json()) as { audioContent?: string };

    if (!json.audioContent) {
      return Response.json(
        { error: "TTS response did not include audio content" },
        { status: 500 }
      );
    }

    // Save to Redis cache (30-day TTL)
    try {
      await redis.set(cacheKey, json.audioContent, { ex: 60 * 60 * 24 * 30 });
    } catch (e) {
      console.warn("TTS cache write failed:", e);
    }

    return Response.json(
      { audioContent: json.audioContent },
      { status: 200, headers: { "Cache-Control": "public, max-age=86400" } }
    );
  } catch {
    return Response.json({ error: "Unexpected error while calling TTS API" }, { status: 500 });
  }
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
