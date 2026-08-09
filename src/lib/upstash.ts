import "server-only";
import { Redis } from "@upstash/redis";
import { HTTP_TIMEOUT_MS } from "./http-retry";

let instance: Redis | undefined;

export function getRedis(): Redis {
  if (instance) return instance;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash is not configured");
  }
  instance = new Redis({
    url,
    token,
    // Redis は L2 キャッシュなので network retry は 1 回に抑える。
    // HTTP 5xx の再送は INCR 等の非冪等コマンドを二重実行し得るため SDK に任せず、
    // command 全体を短い timeout で打ち切って呼び出し側の fallback へ進む。
    retry: { retries: 1, backoff: () => 200 },
    signal: () => AbortSignal.timeout(HTTP_TIMEOUT_MS.redis),
  });
  return instance;
}
