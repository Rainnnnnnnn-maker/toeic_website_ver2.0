import type { WordDetails } from "@/types/word";

/**
 * 聞き流しモードで読み上げる例文を選ぶ純粋ロジック。
 * toeicExamples[0] を優先し、無ければ meanings[0].detailedMeanings[0] にフォールバックする。
 * どちらも無ければ空文字を返す。
 */
export function pickExample(detail: WordDetails): { en: string; ja: string } {
  if (detail.toeicExamples && detail.toeicExamples.length > 0) {
    return { en: detail.toeicExamples[0].english, ja: detail.toeicExamples[0].japanese };
  }
  const fallback = detail.meanings[0]?.detailedMeanings[0];
  if (fallback) {
    return { en: fallback.example, ja: fallback.exampleJapanese };
  }
  return { en: "", ja: "" };
}
