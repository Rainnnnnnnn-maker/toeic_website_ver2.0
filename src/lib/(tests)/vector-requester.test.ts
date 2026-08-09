import { describe, expect, it } from "vitest";
import { createVectorRequester } from "@/lib/vector-requester";

function jsonResponse(status: number, body: unknown): Response {
  return Response.json(body, { status });
}

describe("createVectorRequester", () => {
  it("path・body・認証ヘッダーを維持する", async () => {
    let seenUrl = "";
    let seenInit: RequestInit | undefined;
    const requester = createVectorRequester({
      url: "https://vector.example.test/",
      token: "secret-token",
      timeoutMs: 1000,
      retries: 0,
      fetchImpl: async (url, init) => {
        seenUrl = String(url);
        seenInit = init;
        return jsonResponse(200, { result: [{ id: "word" }] });
      },
    });

    const result = await requester.request<{ id: string }[]>({
      path: ["query", "namespace"],
      body: { vector: [1, 2], topK: 1 },
    });

    expect(result).toEqual({ result: [{ id: "word" }] });
    expect(seenUrl).toBe("https://vector.example.test/query/namespace");
    expect(seenInit?.method).toBe("POST");
    expect(seenInit?.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer secret-token",
    });
    expect(seenInit?.body).toBe(JSON.stringify({ vector: [1, 2], topK: 1 }));
    expect(seenInit?.signal).toBeInstanceOf(AbortSignal);
  });

  it("HTTP 503 は再送して成功結果を返す", async () => {
    let calls = 0;
    const requester = createVectorRequester({
      url: "https://vector.example.test",
      token: "token",
      timeoutMs: 1000,
      retries: 1,
      fetchImpl: async () => {
        calls += 1;
        return calls === 1
          ? jsonResponse(503, { error: "temporary" })
          : jsonResponse(200, { result: ["ok"] });
      },
    });

    await expect(requester.request({ path: ["query"], body: {} })).resolves.toEqual({
      result: ["ok"],
    });
    expect(calls).toBe(2);
  });

  it.each([400, 429])("HTTP %s は再送しない", async (status) => {
    let calls = 0;
    const requester = createVectorRequester({
      url: "https://vector.example.test",
      token: "token",
      timeoutMs: 1000,
      retries: 2,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse(status, { error: "stop" });
      },
    });

    await expect(requester.request({ path: ["query"], body: {} })).rejects.toMatchObject({
      status,
    });
    expect(calls).toBe(1);
  });

  it("本文 JSON の読み取り失敗も再送する", async () => {
    let calls = 0;
    const requester = createVectorRequester({
      url: "https://vector.example.test",
      token: "token",
      timeoutMs: 1000,
      retries: 1,
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) {
          return new Response(
            new ReadableStream({
              start(controller) {
                controller.error(new TypeError("body failed"));
              },
            }),
            { status: 200 }
          );
        }
        return jsonResponse(200, { result: "ok" });
      },
    });

    await expect(requester.request({ path: ["info"], body: [] })).resolves.toEqual({
      result: "ok",
    });
    expect(calls).toBe(2);
  });

  it("エラーに URL や token を含めない", async () => {
    const requester = createVectorRequester({
      url: "https://vector.example.test/private",
      token: "hunter2",
      timeoutMs: 1000,
      retries: 0,
      fetchImpl: async () => jsonResponse(401, { error: "unauthorized" }),
    });

    const promise = requester.request({ path: ["query"], body: {} });
    await expect(promise).rejects.toThrow(/upstash vector failed with status 401/);
    await expect(promise).rejects.not.toThrow(/hunter2|private/);
  });
});
