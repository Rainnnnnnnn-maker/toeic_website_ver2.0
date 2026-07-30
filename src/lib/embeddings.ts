import "server-only";
import { GoogleGenAI } from "@google/genai";
import { EMBEDDING_DIMENSION, EMBEDDING_MODEL, normalizeVector } from "./semantic-search";

let client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/**
 * テキストを gemini-embedding-001 でベクトル化する。
 * 3072 次元以外は正規化されずに返るため、L2 正規化してから返す。
 */
export async function embedText(text: string, taskType: EmbeddingTaskType): Promise<number[]> {
  const response = await getClient().models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { taskType, outputDimensionality: EMBEDDING_DIMENSION },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values || values.length === 0) {
    throw new Error("Empty embedding response from Gemini");
  }
  return normalizeVector(values);
}
