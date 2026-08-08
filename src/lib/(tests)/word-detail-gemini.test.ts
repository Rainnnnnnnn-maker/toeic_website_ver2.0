import type { GoogleGenAI } from "@google/genai";
import { describe, expect, it } from "vitest";
import { generateWordDetail } from "@/lib/word-detail-gemini";

function fakeClient(
  generateContent: (params: unknown) => Promise<{ text?: string }>
): GoogleGenAI {
  return {
    models: { generateContent },
  } as unknown as GoogleGenAI;
}

describe("generateWordDetail", () => {
  it("429 の API 失敗では transport retry も第2プロンプトも送らない", async () => {
    let calls = 0;
    const quotaError = Object.assign(new Error("quota exceeded"), { status: 429 });
    const client = fakeClient(async () => {
      calls += 1;
      throw quotaError;
    });

    await expect(generateWordDetail(client, "respect")).rejects.toBe(quotaError);
    expect(calls).toBe(1);
  });

  it("不正 JSON のときだけ第2プロンプトへフォールバックする", async () => {
    let calls = 0;
    const signals: AbortSignal[] = [];
    const client = fakeClient(async (params) => {
      calls += 1;
      const config = (params as { config?: { abortSignal?: AbortSignal } }).config;
      if (config?.abortSignal) signals.push(config.abortSignal);
      return calls === 1
        ? { text: "not json" }
        : { text: JSON.stringify({ word: "respect" }) };
    });

    const detail = await generateWordDetail(client, "respect");

    expect(detail.word).toBe("respect");
    expect(calls).toBe(2);
    expect(signals).toHaveLength(2);
    expect(signals[0]).not.toBe(signals[1]);
  });
});
