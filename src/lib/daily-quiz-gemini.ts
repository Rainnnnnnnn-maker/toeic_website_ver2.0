import type { GoogleGenAI } from "@google/genai";
import {
  buildDistractorPrompt,
  buildVerificationPrompt,
  parseDistractorResponse,
  parseVerificationResponse,
  type VerificationItem,
} from "./daily-quiz";
import { GEMINI_RETRY_POLICY, retryWithTimeout } from "./http-retry";
import type { QuizSourceWord } from "./quiz-question-builder";

/**
 * 日次クイズの誤答を Gemini に作らせ、別の依頼で確認させる。
 * `word-detail-gemini.ts` と同じく env や `server-only` に依存せず、クライアントを引数で受け取る。
 *
 * どちらも1日1回・6語を1リクエストにまとめる。応答の妥当性はここでは判断せず、
 * 呼び出し側が `daily-quiz.ts` の純粋関数で語ごとに判定する。
 * 失敗時は代替の誤答があるため、プロンプトを変えた再依頼はしない。
 * transport / 5xx / timeout の再送だけを `retryWithTimeout` に任せ、429 は再送しない。
 */

/**
 * 単語詳細の生成（gemini-2.5-flash-lite）より上位のモデルを使う。
 * flash-lite は「正解の言い直し」「同じ候補の繰り返し」「訳語の数の無視」が多く、
 * 検証を通る誤答をほとんど作れなかった。依頼は1日2回だけなので費用の差は小さい。
 */
const QUIZ_MODEL = "gemini-2.5-flash";

async function requestJson(
  client: GoogleGenAI,
  prompt: string,
  options: { temperature: number; maxOutputTokens: number; label: string },
): Promise<string> {
  const response = await retryWithTimeout(
    (signal) =>
      client.models.generateContent({
        model: QUIZ_MODEL,
        contents: prompt,
        config: {
          temperature: options.temperature,
          maxOutputTokens: options.maxOutputTokens,
          responseMimeType: "application/json",
          // 思考トークンは出力上限と応答時間を消費する。指示どおりの整形が目的なので使わない
          thinkingConfig: { thinkingBudget: 0 },
          abortSignal: signal,
        },
      }),
    { ...GEMINI_RETRY_POLICY.quiz, label: options.label },
  );
  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

/** slug ごとの誤答候補（未検証）を返す。 */
export async function generateQuizDistractors(
  client: GoogleGenAI,
  targets: readonly QuizSourceWord[],
): Promise<Map<string, unknown>> {
  const text = await requestJson(client, buildDistractorPrompt(targets), {
    temperature: 0.4,
    maxOutputTokens: 1536,
    label: "gemini quiz distractors",
  });
  return parseDistractorResponse(text);
}

/** slug ごとの「正解として成立してしまう候補の番号」を返す。応答に無い slug は Map に入らない。 */
export async function verifyQuizDistractors(
  client: GoogleGenAI,
  items: readonly VerificationItem[],
): Promise<Map<string, Set<number>>> {
  const text = await requestJson(client, buildVerificationPrompt(items), {
    // 判定なので揺らぎを抑える
    temperature: 0,
    maxOutputTokens: 512,
    label: "gemini quiz verification",
  });
  return parseVerificationResponse(text);
}
