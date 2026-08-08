import { describe, expect, it } from "vitest";
import {
  HTTP_TIMEOUT_MS,
  HttpResponseError,
  UpstreamTimeoutError,
  classifyUpstreamFailure,
  fetchWithRetry,
  getHttpStatus,
  isRetryableStatus,
  isTimeoutError,
  retryWithTimeout,
} from "@/lib/http-retry";

/**
 * ネットワークにも秘匿情報にも依存しないテスト。
 * fetch は `fetchImpl` で差し替えるため実際の通信は発生しない。
 */

function jsonResponse(status: number): Response {
  return new Response(status === 204 ? null : "{}", { status });
}

describe("isRetryableStatus", () => {
  it("一時的なサーバー側の失敗は再送対象にする", () => {
    for (const status of [408, 425, 500, 502, 503, 504]) {
      expect(isRetryableStatus(status)).toBe(true);
    }
  });

  it("429 は再送しない（従量課金 API の quota を余計に消費するため）", () => {
    expect(isRetryableStatus(429)).toBe(false);
  });

  it("クライアント側の誤りは再送しない", () => {
    for (const status of [400, 401, 403, 404]) {
      expect(isRetryableStatus(status)).toBe(false);
    }
  });

  it("恒久的なサーバー側の非対応は再送しない", () => {
    expect(isRetryableStatus(501)).toBe(false);
    expect(isRetryableStatus(505)).toBe(false);
  });

  it("成功ステータスは再送対象にならない", () => {
    expect(isRetryableStatus(200)).toBe(false);
    expect(isRetryableStatus(304)).toBe(false);
  });
});

describe("HTTP_TIMEOUT_MS", () => {
  it("すべての用途で正の有限値が設定されている", () => {
    for (const value of Object.values(HTTP_TIMEOUT_MS)) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });
});

describe("isTimeoutError", () => {
  it("TimeoutError を検出する", () => {
    expect(isTimeoutError(new DOMException("timed out", "TimeoutError"))).toBe(true);
  });

  it("cause に載った TimeoutError も検出する", () => {
    const error = new Error("aborted");
    (error as Error & { cause?: unknown }).cause = new DOMException("t", "TimeoutError");
    expect(isTimeoutError(error)).toBe(true);
  });

  it("SDK が deadline 到達時に返す AbortError も検出する", () => {
    expect(isTimeoutError(new DOMException("aborted", "AbortError"))).toBe(true);
  });

  it("無関係なエラーは検出しない", () => {
    expect(isTimeoutError(new Error("boom"))).toBe(false);
    expect(isTimeoutError(null)).toBe(false);
    expect(isTimeoutError("TimeoutError")).toBe(false);
  });
});

describe("getHttpStatus", () => {
  it("SDK 形式の status / statusCode と cause を読む", () => {
    expect(getHttpStatus({ status: 429 })).toBe(429);
    expect(getHttpStatus({ statusCode: 503 })).toBe(503);
    expect(getHttpStatus(new Error("wrapped", { cause: { status: 502 } }))).toBe(502);
  });

  it("文字列や HTTP 範囲外の値は無視する", () => {
    expect(getHttpStatus({ status: "429" })).toBeUndefined();
    expect(getHttpStatus({ status: 99 })).toBeUndefined();
    expect(getHttpStatus({ statusCode: 600 })).toBeUndefined();
  });
});

describe("classifyUpstreamFailure", () => {
  it("上流のレート超過は 429 のまま伝える", () => {
    expect(classifyUpstreamFailure(new HttpResponseError(429, "tts"))).toEqual({
      status: 429,
      reason: "rate-limit",
    });
  });

  it("SDK 固有エラーの構造的な status も分類する", () => {
    expect(classifyUpstreamFailure({ status: 429 })).toEqual({
      status: 429,
      reason: "rate-limit",
    });
    expect(classifyUpstreamFailure({ statusCode: 503 })).toEqual({
      status: 502,
      reason: "upstream",
    });
  });

  it("上流の 5xx は 502 に写像する", () => {
    expect(classifyUpstreamFailure(new HttpResponseError(503, "tts"))).toEqual({
      status: 502,
      reason: "upstream",
    });
  });

  it("上流の 4xx はこちらの責任として 500 にする", () => {
    expect(classifyUpstreamFailure(new HttpResponseError(400, "tts"))).toEqual({
      status: 500,
      reason: "unknown",
    });
  });

  it("タイムアウトは 504 に写像する", () => {
    expect(classifyUpstreamFailure(new DOMException("t", "TimeoutError"))).toEqual({
      status: 504,
      reason: "timeout",
    });
  });

  it("AbortError も 504 に写像する", () => {
    expect(classifyUpstreamFailure(new DOMException("aborted", "AbortError"))).toEqual({
      status: 504,
      reason: "timeout",
    });
  });

  it("不明なエラーは 500 にする", () => {
    expect(classifyUpstreamFailure(new Error("boom"))).toEqual({
      status: 500,
      reason: "unknown",
    });
  });
});

describe("retryWithTimeout", () => {
  it("429 は SDK 形式のエラーでも再送しない", async () => {
    let calls = 0;
    const error = Object.assign(new Error("quota"), { status: 429 });

    const promise = retryWithTimeout(
      async () => {
        calls += 1;
        throw error;
      },
      { timeoutMs: 1000, retries: 3, label: "gemini" }
    );

    await expect(promise).rejects.toBe(error);
    expect(calls).toBe(1);
  });

  it("statusCode を持つ 5xx は再送する", async () => {
    let calls = 0;
    const result = await retryWithTimeout(
      async () => {
        calls += 1;
        if (calls === 1) throw Object.assign(new Error("temporary"), { statusCode: 503 });
        return "ok";
      },
      { timeoutMs: 1000, retries: 1, label: "sdk" }
    );

    expect(result).toBe("ok");
    expect(calls).toBe(2);
  });

  it("期限到達を分類可能な TimeoutError に変換する", async () => {
    const promise = retryWithTimeout(
      (signal) =>
        new Promise<never>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        }),
      { timeoutMs: 5, retries: 0, label: "slow sdk" }
    );

    await expect(promise).rejects.toBeInstanceOf(UpstreamTimeoutError);
    await expect(promise).rejects.toMatchObject({ name: "TimeoutError" });
  });
});

describe("fetchWithRetry", () => {
  it("初回に成功したら 1 回しか呼ばない", async () => {
    let calls = 0;
    const response = await fetchWithRetry("https://example.test/ok", {
      timeoutMs: 1000,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse(200);
      },
    });

    expect(calls).toBe(1);
    expect(response.status).toBe(200);
  });

  it("5xx は再送し、成功したらその応答を返す", async () => {
    let calls = 0;
    const response = await fetchWithRetry("https://example.test/flaky", {
      timeoutMs: 1000,
      retries: 2,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse(calls < 3 ? 503 : 200);
      },
    });

    expect(calls).toBe(3);
    expect(response.status).toBe(200);
  });

  it("4xx は残りの試行を消費せず 1 回で失敗する", async () => {
    let calls = 0;
    const promise = fetchWithRetry("https://example.test/bad", {
      timeoutMs: 1000,
      retries: 3,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse(400);
      },
    });

    await expect(promise).rejects.toThrowError(HttpResponseError);
    expect(calls).toBe(1);
  });

  it("429 も再送せず即座に失敗する", async () => {
    let calls = 0;
    const promise = fetchWithRetry("https://example.test/limited", {
      timeoutMs: 1000,
      retries: 3,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse(429);
      },
    });

    await expect(promise).rejects.toMatchObject({ status: 429 });
    expect(calls).toBe(1);
  });

  it("試行を使い切ったら最後の status を持つエラーで失敗する", async () => {
    let calls = 0;
    const promise = fetchWithRetry("https://example.test/down", {
      timeoutMs: 1000,
      retries: 2,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse(500);
      },
    });

    await expect(promise).rejects.toMatchObject({ status: 500 });
    expect(calls).toBe(3);
  });

  it("試行ごとに新しい signal を渡す（ワンショットの使い回しを防ぐ）", async () => {
    const signals: AbortSignal[] = [];
    let calls = 0;

    await fetchWithRetry("https://example.test/signal", {
      timeoutMs: 1000,
      retries: 2,
      fetchImpl: async (_url, init) => {
        calls += 1;
        signals.push((init as RequestInit).signal as AbortSignal);
        return jsonResponse(calls < 2 ? 503 : 200);
      },
    });

    expect(signals).toHaveLength(2);
    expect(signals[0]).not.toBe(signals[1]);
    // 直前の試行の signal が中断済みでも、次の試行は未中断の signal で始まる
    expect(signals[1].aborted).toBe(false);
  });

  it("label を指定するとエラーメッセージに URL が漏れない", async () => {
    const promise = fetchWithRetry("https://example.test/secret?token=hunter2", {
      timeoutMs: 1000,
      retries: 0,
      label: "word list blob",
      fetchImpl: async () => jsonResponse(404),
    });

    await expect(promise).rejects.toThrowError(/word list blob failed with status 404/);
    await expect(promise).rejects.not.toThrowError(/hunter2/);
  });

  it("init のヘッダを保持したまま signal を付与する", async () => {
    let seen: RequestInit | undefined;

    await fetchWithRetry("https://example.test/headers", {
      timeoutMs: 1000,
      init: { method: "POST", headers: { "x-test": "1" } },
      fetchImpl: async (_url, init) => {
        seen = init as RequestInit;
        return jsonResponse(200);
      },
    });

    expect(seen?.method).toBe("POST");
    expect(seen?.headers).toEqual({ "x-test": "1" });
    expect(seen?.signal).toBeInstanceOf(AbortSignal);
  });

  it("成功ヘッダー後に本文取得が失敗した場合も再送する", async () => {
    let calls = 0;
    const text = await fetchWithRetry<string>("https://example.test/body", {
      timeoutMs: 1000,
      retries: 1,
      consume: (response) => response.text(),
      fetchImpl: async () => {
        calls += 1;
        if (calls === 1) {
          return new Response(
            new ReadableStream({
              start(controller) {
                controller.error(new TypeError("body connection reset"));
              },
            }),
            { status: 200 }
          );
        }
        return new Response("complete", { status: 200 });
      },
    });

    expect(text).toBe("complete");
    expect(calls).toBe(2);
  });

  it("HTTP エラーでは本文 reader を呼ばない", async () => {
    let consumes = 0;
    const promise = fetchWithRetry<string>("https://example.test/limited-body", {
      timeoutMs: 1000,
      retries: 2,
      consume: async () => {
        consumes += 1;
        return "unused";
      },
      fetchImpl: async () => jsonResponse(429),
    });

    await expect(promise).rejects.toMatchObject({ status: 429 });
    expect(consumes).toBe(0);
  });
});
