import type { WordDetails } from "@/types/word";

/**
 * `<script type="application/ld+json">` に埋め込む JSON-LD の文字列化。
 * JSON.stringify は `<` をエスケープしないため、値に `</script>` が混ざると
 * スクリプト要素を抜け出せてしまう。`<` を `\u003c` にしても JSON としての値は変わらない。
 * U+2028 / U+2029 は JavaScript の文脈へ流用されても壊れないよう併せて逃がす。
 * JSON-LD を出力するときは JSON.stringify を直接使わず、必ずこれを通すこと。
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function generateWordDetailJsonLd(word: string, detail: WordDetails | null) {
  const jsonLd = [];

  // BreadcrumbList
  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "TOP",
        "item": "https://www.toeic-words.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": word,
        "item": `https://www.toeic-words.com/words/${word}`
      }
    ]
  });

  // DefinedTerm (if details are available)
  if (detail) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": detail.word,
      "description": detail.japaneseTranslation,
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "TOEIC重要単語",
        "url": "https://www.toeic-words.com"
      },
      "termCode": detail.word,
      "identifier": detail.word,
      "inLanguage": "en",
      "educationalUse": "TOEIC L&R テスト対策",
      "learningResourceType": "vocabulary"
    });
  }

  return jsonLd;
}
