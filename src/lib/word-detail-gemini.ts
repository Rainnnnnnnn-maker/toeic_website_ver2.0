import type { GoogleGenAI } from "@google/genai";
import type { WordDetails } from "@/types/word";
import { parseJsonFromText, normalizePayload } from "./word-detail-parse";
import { GEMINI_RETRY_POLICY, retryWithTimeout } from "./http-retry";

/**
 * Gemini による単語詳細生成ロジック。
 * env や `server-only` に依存せず、GoogleGenAI クライアントを引数で受け取るため、
 * `src/data/word-detail.ts`（サーバー）と `scripts/embed-words.ts`（CLI）で共有できる。
 */

const systemPrompt = `
Return ONLY a JSON object for "\${word}" with the following fields:
{
  "word": "\${word}",
  "pronunciation": "IPA",
  "meanings": [
    {
      "partOfSpeech": "品詞",
      "meaning": "日本語の要約（1〜3文、頻度順）",
      "detailedMeanings": [
        {
          "number": 1,
          "definition": "短い日本語定義",
          "example": "英語例文",
          "exampleJapanese": "日本語訳",
          "context": "使用場面",
          "frequency": "高/中/低",
          "synonyms": ["..."],
          "grammarPattern": "代表的な文型"
        }
      ]
    }
  ],
  "wordForms": [{ "form": "xxxx", "type": "語形" }],
  "synonyms": ["..."],
  "nuance": "1〜2文で簡潔に",
  "toeicExamples": [
    { "english": "English sentence", "japanese": "日本語訳" }
  ],
  "englishDefinition": "短い英語定義",
  "japaneseTranslation": "日本語訳",
  "etymology": "語源・成り立ち（例: re(再び) + spect(見る)）",
  "collocations": ["よく使われるコロケーション1", "コロケーション2"]
}

Constraints:
- partOfSpeech は日本語で出力する
- meaning は日本語で出力する
- meanings は品詞ごとに1〜2文で簡潔に
- definition は短い日本語で出力する
- englishDefinition は短い英語で出力する
- 語形変化は最大5件、類義語は最大5件、toeicExamples は3〜5件、collocationsは2〜3件
- etymology は単語の成り立ちや記憶のフックになる情報を日本語で1〜2文で出力する
- JSON以外のテキストは出力しない
`;

/**
 * Gemini で単語詳細を生成する。1回目が不正な JSON なら
 * 出力トークンを増やした注意書き付きプロンプトで1回だけ再試行する。
 */
export async function generateWordDetail(client: GoogleGenAI, term: string): Promise<WordDetails> {
  const promptBase = systemPrompt.replaceAll("${word}", term);
  const prompts = [
    {
      maxOutputTokens: 1536,
      prompt: promptBase,
    },
    {
      maxOutputTokens: 2048,
      prompt:
        promptBase +
        "\n\nIMPORTANT:\n- Output MUST be a single complete JSON object.\n- If output would be long, reduce toeicExamples to 3 and synonyms to 3.\n- Keep JSON valid and complete (no truncation).\n",
    },
  ];

  let lastError: unknown;

  for (const attempt of prompts) {
    // transport / HTTP エラーはプロンプトを変えても直らないため、ここでは捕捉しない。
    // 429 は retryWithTimeout が即時終了し、第2プロンプトも送られない。
    const response = await retryWithTimeout(
      (signal) =>
        client.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: attempt.prompt,
          config: {
            temperature: 0.2,
            maxOutputTokens: attempt.maxOutputTokens,
            responseMimeType: "application/json",
            abortSignal: signal,
          },
        }),
      { ...GEMINI_RETRY_POLICY.wordDetail, label: "gemini word detail" }
    );

    // 第2プロンプトは、応答自体は成功したが JSON が空・不正だった場合だけ使う。
    try {
      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }
      const raw = parseJsonFromText(text);
      return normalizePayload(term, raw);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to generate a valid JSON response from Gemini");
}
