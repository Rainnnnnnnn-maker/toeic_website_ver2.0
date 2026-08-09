import pRetry, { AbortError } from "p-retry";

/**
 * 外部 HTTP API 呼び出しの共通タイムアウト／リトライ。
 *
 * `server-only` は付けない。`scripts/embed-words.ts` 系の CLI からも同じ方針で
 * 使えるようにするため（`word-source.ts` と同じ扱い）。クライアントコンポーネントからは import しないこと。
 *
 * 方針:
 * - タイムアウトは必須。Vercel の Function は応答が返らない上流を掴んだまま
 *   maxDuration まで居座るため、上限を切らないと 1 リクエストが枠を占有し続ける。
 * - リトライは「再送で結果が変わり得る場合」だけに限定する。従量課金 API を
 *   闇雲に再送すると障害時に費用と quota を余計に焼く。
 */

/**
 * 再送で結果が変わり得る HTTP ステータス。
 *
 * 429 は意図的に除外している。Gemini と Google Cloud TTS は従量課金で、
 * レート超過時に再送しても quota を余計に消費するだけで成功率は上がらない。
 * 501 / 505 のような恒久的な非対応も、再送しても同じ結果になるため除外する。
 */
const RETRYABLE_STATUSES = new Set([408, 425, 500, 502, 503, 504]);

export function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUSES.has(status);
}

/** 用途別のタイムアウト（ミリ秒）。 */
export const HTTP_TIMEOUT_MS = {
  /** Google Cloud TTS の音声合成。長い例文だと数秒かかる */
  tts: 10_000,
  /** Vercel Blob からの単語リスト取得と list 操作 */
  blob: 8_000,
  /** Google Fonts からの OG 画像用フォント取得 */
  font: 8_000,
  /** Upstash Redis。L2 キャッシュなので短く打ち切る */
  redis: 3_000,
  /** Upstash Vector。検索・単件 upsert の上限 */
  vector: 8_000,
} as const;

/**
 * Gemini の手動リトライ方針。
 *
 * `@google/genai` の `retryOptions` は 429 も再送し、最終エラーから HTTP status を
 * 失わせるため使用しない。SDK 呼び出しごとに {@link retryWithTimeout} を適用する。
 */
export const GEMINI_RETRY_POLICY = {
  /** 2 プロンプト x 最大 2 transport 試行 x 12 秒 < page maxDuration 60 秒 */
  wordDetail: { timeoutMs: 12_000, retries: 1 },
  /** クエリ／文書 embedding。通常は 1 秒未満 */
  embedding: { timeoutMs: 10_000, retries: 1 },
} as const;

/** 応答は返ったが `!ok` だった場合のエラー。 */
export class HttpResponseError extends Error {
  readonly status: number;

  constructor(status: number, label: string) {
    super(`${label} failed with status ${status}`);
    this.name = "HttpResponseError";
    this.status = status;
  }
}

/** こちらで設定した上流タイムアウト。元の SDK / fetch 例外は cause に保持する。 */
export class UpstreamTimeoutError extends Error {
  constructor(label: string, cause?: unknown) {
    super(`${label} timed out`, { cause });
    this.name = "TimeoutError";
  }
}

class ResponseConsumptionError extends Error {
  constructor(label: string, cause: unknown) {
    super(`${label} response body could not be read`, { cause });
    this.name = "ResponseConsumptionError";
  }
}

function toError(error: unknown, fallback: string): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : fallback, { cause: error });
}

/** SDK 独自エラーも含め、`status` / `statusCode` から HTTP status を取り出す。 */
export function getHttpStatus(error: unknown): number | undefined {
  let candidate: unknown = error;
  const seen = new Set<object>();

  for (let depth = 0; depth < 4; depth += 1) {
    if (!candidate || typeof candidate !== "object" || seen.has(candidate)) return undefined;
    seen.add(candidate);

    const value = candidate as { status?: unknown; statusCode?: unknown; cause?: unknown };
    for (const status of [value.status, value.statusCode]) {
      if (Number.isInteger(status) && (status as number) >= 100 && (status as number) <= 599) {
        return status as number;
      }
    }
    candidate = value.cause;
  }

  return undefined;
}

/**
 * タイムアウト／deadline による中断か。
 * `@google/genai` は deadline 到達時も理由なしの `AbortError` を返すため両方を扱う。
 */
export function isTimeoutError(error: unknown): boolean {
  let candidate: unknown = error;
  const seen = new Set<object>();

  for (let depth = 0; depth < 4; depth += 1) {
    if (!candidate || typeof candidate !== "object" || seen.has(candidate)) return false;
    seen.add(candidate);
    const value = candidate as { name?: string; cause?: unknown };
    if (value.name === "TimeoutError" || value.name === "AbortError") return true;
    candidate = value.cause;
  }

  return false;
}

export type UpstreamFailureReason = "timeout" | "rate-limit" | "upstream" | "unknown";

/** 上流 API の失敗を、クライアントへ返す HTTP ステータスに写像する。 */
export function classifyUpstreamFailure(error: unknown): {
  status: number;
  reason: UpstreamFailureReason;
} {
  const upstreamStatus = getHttpStatus(error);
  if (upstreamStatus === 429) return { status: 429, reason: "rate-limit" };
  if (upstreamStatus === 408) return { status: 504, reason: "timeout" };
  if (upstreamStatus !== undefined && upstreamStatus >= 500) {
    return { status: 502, reason: "upstream" };
  }
  if (isTimeoutError(error)) return { status: 504, reason: "timeout" };
  return { status: 500, reason: "unknown" };
}

export type RetryWithTimeoutOptions = {
  /** 1 回の試行あたりの上限時間 */
  timeoutMs: number;
  /** 初回を含まない追加試行回数。既定 2（= 最大 3 回） */
  retries?: number;
  /** ログ／エラー用の秘匿情報を含まない識別子 */
  label?: string;
  /** 呼び出し元からのキャンセル。タイムアウトと合成し、キャンセル時は再送しない */
  signal?: AbortSignal;
};

/**
 * SDK 呼び出しを含む任意の上流処理へ、試行ごとの timeout と選択的 retry を適用する。
 * `status` / `statusCode` を持つ 4xx と 429 は即時終了し、対象の 5xx と timeout は再送する。
 */
export async function retryWithTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  { timeoutMs, retries = 2, label = "upstream operation", signal }: RetryWithTimeoutOptions
): Promise<T> {
  return pRetry(
    async () => {
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      const attemptSignal = signal
        ? AbortSignal.any([signal, timeoutSignal])
        : timeoutSignal;

      try {
        return await operation(attemptSignal);
      } catch (error) {
        if (signal?.aborted) {
          throw new AbortError(toError(signal.reason ?? error, `${label} was aborted`));
        }
        if (timeoutSignal.aborted) {
          throw new UpstreamTimeoutError(label, error);
        }

        const status = getHttpStatus(error);
        if (status !== undefined && !isRetryableStatus(status)) {
          throw new AbortError(toError(error, `${label} failed`));
        }
        throw toError(error, `${label} failed`);
      }
    },
    {
      retries,
      factor: 2,
      minTimeout: 300,
      maxTimeout: 2_000,
      randomize: true,
      maxRetryTime: timeoutMs * (retries + 1) + 5_000,
      signal,
    }
  );
}

export type FetchWithRetryOptions<T = Response> = RetryWithTimeoutOptions & {
  /** `signal` は上位オプションから内部で合成するため RequestInit では受け付けない */
  init?: Omit<RequestInit, "signal">;
  /** レスポンス本文を retry 境界内で読み取る。省略時は Response を返す */
  consume?: (response: Response) => Promise<T>;
  /** テスト用の fetch 差し替え */
  fetchImpl?: typeof fetch;
};

/**
 * タイムアウトとリトライ付きの fetch。
 *
 * `consume` を渡すと `json()` / `text()` / `arrayBuffer()` まで同じ retry 境界に入り、
 * ヘッダー到着後の切断や本文タイムアウトも再送できる。
 */
export async function fetchWithRetry<T = Response>(
  url: string,
  {
    timeoutMs,
    retries = 2,
    label,
    signal,
    init,
    consume,
    fetchImpl,
  }: FetchWithRetryOptions<T>
): Promise<T> {
  const name = label ?? url;
  const doFetch = fetchImpl ?? fetch;

  return retryWithTimeout(
    async (attemptSignal) => {
      const response = await doFetch(url, {
        ...init,
        signal: attemptSignal,
      });

      if (!response.ok) {
        throw new HttpResponseError(response.status, name);
      }

      if (!consume) return response as T;
      try {
        return await consume(response);
      } catch (error) {
        if (attemptSignal.aborted) throw error;
        throw new ResponseConsumptionError(name, error);
      }
    },
    { timeoutMs, retries, label: name, signal }
  );
}
