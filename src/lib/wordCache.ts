import "server-only";
import type { WordDetails } from "@/app/api/words/[word]/route";
import { getRedis } from "./upstash";

export function cacheKeyForWord(word: string): string {
  return `word:${word.trim().toLowerCase()}`;
}

function ttlSeconds(): number {
  const daysRaw = process.env.WORD_CACHE_TTL_DAYS ?? "30";
  const days = Number(daysRaw);
  const validDays = Number.isFinite(days) && days > 0 ? days : 30;
  return validDays * 24 * 60 * 60;
}

export async function getWordDetails(word: string): Promise<WordDetails | null> {
  const redis = getRedis();
  const key = cacheKeyForWord(word);
  const value = await redis.get<string | WordDetails>(key);
  if (!value) return null;
  try {
    let obj: unknown = value;
    if (typeof value === "string") {
      obj = JSON.parse(value) as unknown;
    }
    if (
      obj &&
      typeof obj === "object" &&
      "word" in obj &&
      "meanings" in obj &&
      Array.isArray((obj as { meanings?: unknown }).meanings)
    ) {
      return obj as WordDetails;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setWordDetails(word: string, data: WordDetails): Promise<void> {
  const redis = getRedis();
  const key = cacheKeyForWord(word);
  const json = JSON.stringify(data);
  await redis.set(key, json, { ex: ttlSeconds() });
}
