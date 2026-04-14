import type { WordDetails } from "@/types/word";

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

    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `${detail.word}の意味・使い方 | TOEIC重要単語`,
      "description": detail.japaneseTranslation,
      "url": `https://www.toeic-words.com/words/${word}`,
      "inLanguage": "ja",
      "about": {
        "@type": "DefinedTerm",
        "name": detail.word,
        "inLanguage": "en",
      },
      "publisher": {
        "@type": "Organization",
        "name": "TOEIC重要単語",
        "url": "https://www.toeic-words.com",
      },
      "educationalUse": "TOEIC L&R テスト対策",
      "learningResourceType": "vocabulary",
    });
  }

  return jsonLd;
}
