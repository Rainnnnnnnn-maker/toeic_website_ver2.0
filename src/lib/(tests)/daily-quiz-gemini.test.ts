import type { GoogleGenAI } from "@google/genai";
import { describe, expect, it, vi } from "vitest";
import { generateQuizDistractors, verifyQuizDistractors } from "@/lib/daily-quiz-gemini";
import { UpstreamTimeoutError } from "@/lib/http-retry";

type Request = { config: { abortSignal: AbortSignal } };

// SDK の入出力だけを差し替える。Gemini・Redis への実際の通信は行わない。
function fakeClient(generateContent: (request: Request) => Promise<{ text: string }>): GoogleGenAI {
  return { models: { generateContent } } as unknown as GoogleGenAI;
}

describe.each([
  ["generateQuizDistractors", generateQuizDistractors],
  ["verifyQuizDistractors", verifyQuizDistractors],
] as const)("%s", (_name, request) => {
  it("全体のキャンセルを SDK の試行へ伝える", async () => {
    const controller = new AbortController();
    let attemptSignal: AbortSignal | undefined;
    const generateContent = vi.fn(({ config }: Request) => {
      attemptSignal = config.abortSignal;
      return new Promise<{ text: string }>((_resolve, reject) => {
        attemptSignal?.addEventListener("abort", () => reject(attemptSignal?.reason), { once: true });
      });
    });
    const promise = request(fakeClient(generateContent), [], controller.signal);
    const rejected = expect(promise).rejects.toThrow("daily quiz generation timed out");

    controller.abort(new UpstreamTimeoutError("daily quiz generation"));
    await rejected;
    expect(attemptSignal?.aborted).toBe(true);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("既に期限切れならリクエストを開始しない", async () => {
    const controller = new AbortController();
    const error = new UpstreamTimeoutError("daily quiz generation");
    controller.abort(error);
    const generateContent = vi.fn(async () => ({ text: '{"items":[]}' }));

    await expect(request(fakeClient(generateContent), [], controller.signal)).rejects.toBe(error);
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("期限内に成功した応答を復元する", async () => {
    const generateContent = vi.fn(async () => ({ text: '{"items":[]}' }));
    const result = await request(fakeClient(generateContent), [], new AbortController().signal);
    expect(result.size).toBe(0);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});
