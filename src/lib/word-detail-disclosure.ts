import type { WordDetails } from "@/types/word";

const LONG_TEXT_LENGTH = 96;
const LONG_LIST_LENGTH = 4;
const LONG_LIST_TEXT_LENGTH = 96;
const LONG_EXAMPLE_COUNT = 2;
const LONG_EXAMPLES_TEXT_LENGTH = 280;
const LONG_MEANING_TEXT_LENGTH = 280;

function compactTextLength(text: string): number {
  return text.replace(/\s/g, "").length;
}

/** 補足文がモバイルで数行を超える場合だけ開閉対象にする。 */
export function shouldCollapseText(text: string): boolean {
  return compactTextLength(text) > LONG_TEXT_LENGTH;
}

/** 短いタグ一覧には操作を増やさず、件数か合計文字数が多い場合だけ畳む。 */
export function shouldCollapseItems(items: string[]): boolean {
  return (
    items.length > LONG_LIST_LENGTH ||
    compactTextLength(items.join("")) > LONG_LIST_TEXT_LENGTH
  );
}

/** TOEIC例文は3件以上、または2件以下でも本文が長い場合に畳む。 */
export function shouldCollapseExamples(
  examples: WordDetails["toeicExamples"],
): boolean {
  const content = examples.map((example) => `${example.english}${example.japanese}`).join("");
  return (
    examples.length > LONG_EXAMPLE_COUNT ||
    compactTextLength(content) > LONG_EXAMPLES_TEXT_LENGTH
  );
}

/** 主要訳は常時表示し、品詞別の詳説だけが長い場合に畳む。 */
export function shouldCollapseMeaningDetails(
  meanings: WordDetails["meanings"],
): boolean {
  const detailCount = meanings.reduce(
    (count, meaning) => count + meaning.detailedMeanings.length,
    0,
  );
  const content = meanings
    .flatMap((meaning) => [
      meaning.partOfSpeech,
      meaning.meaning,
      ...meaning.detailedMeanings.flatMap((detail) => [
        detail.definition,
        detail.grammarPattern ?? "",
        detail.example,
        detail.exampleJapanese,
        detail.context,
        detail.frequency,
      ]),
    ])
    .join("");

  return detailCount > 1 || compactTextLength(content) > LONG_MEANING_TEXT_LENGTH;
}
