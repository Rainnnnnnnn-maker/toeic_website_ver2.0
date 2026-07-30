import "server-only";
import type { WordDetails } from "@/types/word";
import { parseStoredWordDetails } from "./word-detail-parse";
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
  return parseStoredWordDetails(value);
}

export async function setWordDetails(word: string, data: WordDetails): Promise<void> {
  const redis = getRedis();
  const key = cacheKeyForWord(word);
  const json = JSON.stringify(data);
  await redis.set(key, json, { ex: ttlSeconds() });
}

export async function deleteWordDetails(word: string): Promise<number> {
  const redis = getRedis();
  const key = cacheKeyForWord(word);
  return await redis.del(key);
}
