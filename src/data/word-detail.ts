import "server-only";
import { GoogleGenAI } from "@google/genai";
import { getWordBySlug } from "@/data/words";
import { getWordDetails as getRedisWordDetails, setWordDetails as setRedisWordDetails } from "@/lib/wordCache";
import { cacheLife, cacheTag } from "next/cache";
import { WordDetails } from "@/types/word";
import { generateWordDetail } from "@/lib/word-detail-gemini";

async function fetchWordDetailFromGemini(term: string): Promise<WordDetails> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const client = new GoogleGenAI({ apiKey });
  return generateWordDetail(client, term);
}

// L1 を経由せずに取得する内部フロー (Redis -> Gemini -> Redis)。
// 通常は getWordDetail を使うこと。/api/revalidate/word の vector 再生成のように
// 「パージ直後に必ず最新の内容を取得したい」場面だけ getWordDetailFresh を使う。
export async function getWordDetailFresh(slug: string): Promise<WordDetails | null> {
  const entry = await getWordBySlug(slug);
  if (!entry) return null;

  // 1. Try Upstash Redis first (L2 Cache)
  try {
    const cached = await getRedisWordDetails(entry.term);
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.warn("Failed to read from Redis:", error);
    // Continue to generation if Redis fails
  }

  // 2. Generate with Gemini (L3)
  try {
    const data = await fetchWordDetailFromGemini(entry.term);

    // 3. Save to Upstash Redis (L2 Cache)
    try {
      await setRedisWordDetails(entry.term, data);
    } catch (error) {
      console.warn("Failed to write to Redis:", error);
    }

    return data;
  } catch (error) {
    console.error("Failed to generate word details:", error);
    throw error;
  }
}

// Exported cached function (L1 Cache: Next.js Data Cache)
export async function getWordDetail(slug: string) {
  "use cache";
  // 個別の単語詳細パージ用タグと、全体パージ用タグを付与
  cacheTag(`word-detail-${slug}`, "word-detail");
  // 単語解説はほぼ不変のため "max"（revalidate 30日）で再書き込みを抑制し、
  // Vercel の ISR Writes を節約する。更新時は /api/revalidate/word でオンデマンドにパージする。
  cacheLife("max");

  return getWordDetailFresh(slug);
}
