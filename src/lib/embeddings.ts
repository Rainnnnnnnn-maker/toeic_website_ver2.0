import "server-only";
import { GoogleGenAI } from "@google/genai";
import { EMBEDDING_DIMENSION, EMBEDDING_MODEL, normalizeVector } from "./semantic-search";
import { GEMINI_RETRY_POLICY, retryWithTimeout } from "./http-retry";

let client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  // SDK の retryOptions は 429 も再送して status を失わせるため使用しない。
  client = new GoogleGenAI({ apiKey });
  return client;
}

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/**
 * テキストを gemini-embedding-001 でベクトル化する。
 * 3072 次元以外は正規化されずに返るため、L2 正規化してから返す。
 */
export async function embedText(text: string, taskType: EmbeddingTaskType): Promise<number[]> {
  const response = await retryWithTimeout(
    (signal) =>
      getClient().models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: {
          taskType,
          outputDimensionality: EMBEDDING_DIMENSION,
          abortSignal: signal,
        },
      }),
    { ...GEMINI_RETRY_POLICY.embedding, label: "gemini embedding" }
  );
  const values = response.embeddings?.[0]?.values;
  if (!values || values.length === 0) {
    throw new Error("Empty embedding response from Gemini");
  }
  return normalizeVector(values);
}
