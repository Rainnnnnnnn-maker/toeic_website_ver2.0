import type {
  Requester,
  UpstashRequest,
  UpstashResponse,
} from "@upstash/vector";
import { fetchWithRetry } from "./http-retry";

/**
 * Upstash Vector SDK 用の HTTP requester。
 *
 * SDK 標準の `retry` は network error だけを対象にし、HTTP 5xx を再送せず status も
 * 例外から失わせる。この requester で共通の timeout / status 方針を適用する。
 * `server-only` は CLI からも使うため付けないが、Client Component から import しないこと。
 */

export type VectorRequesterOptions = {
  url: string;
  token: string;
  timeoutMs: number;
  retries: number;
  fetchImpl?: typeof fetch;
};

export function createVectorRequester({
  url,
  token,
  timeoutMs,
  retries,
  fetchImpl,
}: VectorRequesterOptions): Requester {
  const baseUrl = url.replace(/\/$/, "");

  return {
    async request<TResult = unknown>(request: UpstashRequest): Promise<UpstashResponse<TResult>> {
      const endpoint = [baseUrl, ...(request.path ?? [])].join("/");

      return await fetchWithRetry<UpstashResponse<TResult>>(endpoint, {
        timeoutMs,
        retries,
        label: "upstash vector",
        fetchImpl,
        init: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request.body),
          cache: "no-store",
          keepalive: true,
        },
        consume: async (response) =>
          (await response.json()) as UpstashResponse<TResult>,
      });
    },
  };
}
