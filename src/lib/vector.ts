import "server-only";
import { Index } from "@upstash/vector";
import type { WordVectorMetadata } from "./semantic-search";
import { HTTP_TIMEOUT_MS } from "./http-retry";
import { createVectorRequester } from "./vector-requester";

let instance: Index<WordVectorMetadata> | undefined;

export function getVectorIndex(): Index<WordVectorMetadata> {
  if (instance) return instance;
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Vector is not configured");
  }
  // SDK 標準 retry は network error だけで HTTP 5xx を再送しないため、
  // status を保持する共通 requester を使う。Vector の query / upsert / delete は
  // 同じ入力の再送が安全なので、対象の 5xx を最大 2 回再送する。
  instance = new Index<WordVectorMetadata>(
    createVectorRequester({
      url,
      token,
      timeoutMs: HTTP_TIMEOUT_MS.vector,
      retries: 2,
    })
  );
  return instance;
}

export function isVectorConfigured(): boolean {
  return Boolean(process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN);
}
