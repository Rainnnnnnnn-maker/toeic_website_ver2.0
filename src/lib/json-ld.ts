import { WordDetails } from "@/lib/actions";

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
      "inDefinedTermSet": "https://www.toeic-words.com",
      "termCode": detail.word
    });
  }

  return jsonLd;
}
