import "server-only";
import { Redis } from "@upstash/redis";

let instance: Redis | undefined;

export function getRedis(): Redis {
  if (instance) return instance;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash is not configured");
  }
  instance = new Redis({ url, token });
  return instance;
}

