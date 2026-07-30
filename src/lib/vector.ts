import "server-only";
import { Index } from "@upstash/vector";
import type { WordVectorMetadata } from "./semantic-search";

let instance: Index<WordVectorMetadata> | undefined;

export function getVectorIndex(): Index<WordVectorMetadata> {
  if (instance) return instance;
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Vector is not configured");
  }
  instance = new Index<WordVectorMetadata>({ url, token });
  return instance;
}

export function isVectorConfigured(): boolean {
  return Boolean(process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN);
}
