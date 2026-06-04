import type { RawWordPayload, WordDetails } from "@/types/word";

/**
 * Gemini 応答の JSON 抽出と正規化の純粋ロジック。
 * `server-only` や Gemini SDK に依存しないため単体テスト可能。
 * `src/data/word-detail.ts` から利用される。
 */

/** コードフェンス除去 → 最初の `{`〜最後の `}` を切り出して JSON.parse する。 */
export function parseJsonFromText(text: string): RawWordPayload {
  const trimmed = text.trim();
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  if (!withoutFences.includes("{")) {
    throw new Error("Gemini response did not include a JSON object");
  }

  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  const jsonSlice = start !== -1 && end !== -1 ? withoutFences.slice(start, end + 1) : withoutFences;

  if (!jsonSlice.trim().endsWith("}")) {
    throw new Error("Gemini JSON output appears truncated (missing closing brace)");
  }

  try {
    return JSON.parse(jsonSlice) as RawWordPayload;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    throw new Error(msg ? `Invalid JSON from Gemini: ${msg}` : "Invalid JSON from Gemini");
  }
}

/** 欠損フィールドを既定値で補い、件数上限を適用して WordDetails に正規化する。 */
export function normalizePayload(word: string, payload: RawWordPayload): WordDetails {
  const meanings = Array.isArray(payload.meanings) ? payload.meanings : [];
  const normalizedMeanings = meanings.map((m) => ({
    partOfSpeech: m.partOfSpeech ?? "",
    meaning: m.meaning ?? "",
    detailedMeanings: Array.isArray(m.detailedMeanings)
      ? m.detailedMeanings.map((d) => ({
          number: typeof d.number === "number" ? d.number : 0,
          definition: d.definition ?? "",
          example: d.example ?? "",
          exampleJapanese: d.exampleJapanese ?? "",
          context: d.context ?? "",
          frequency: d.frequency ?? "",
          synonyms: Array.isArray(d.synonyms) ? d.synonyms : [],
          grammarPattern: d.grammarPattern,
        }))
      : [],
  }));

  const wordForms = Array.isArray(payload.wordForms)
    ? payload.wordForms.slice(0, 5).map((wf) => ({
        form: wf.form ?? "",
        type: wf.type ?? "",
      }))
    : [];

  const synonyms = Array.isArray(payload.synonyms) ? payload.synonyms.slice(0, 5) : [];

  const toeicExamplesRaw = Array.isArray(payload.toeicExamples) ? payload.toeicExamples : [];
  const toeicExamples = toeicExamplesRaw.slice(0, 5).map((ex) => ({
    english: ex.english ?? "",
    japanese: ex.japanese ?? "",
  }));

  const collocations = Array.isArray(payload.collocations) ? payload.collocations.slice(0, 3) : [];

  return {
    word,
    pronunciation: payload.pronunciation ?? "",
    meanings: normalizedMeanings,
    wordForms,
    synonyms,
    nuance: payload.nuance ?? "",
    toeicExamples,
    englishDefinition: payload.englishDefinition ?? "",
    japaneseTranslation: payload.japaneseTranslation ?? "",
    etymology: payload.etymology ?? "",
    collocations,
  };
}
