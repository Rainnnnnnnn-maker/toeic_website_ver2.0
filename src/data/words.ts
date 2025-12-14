export type Word = {
  slug: string;
  term: string;
};

export const WORDS: Word[] = [
  { slug: "accept", term: "accept" },
  { slug: "accounting", term: "accounting" },
  { slug: "affordable", term: "affordable" },
  { slug: "approve", term: "approve" },
  { slug: "approximately", term: "approximately" },
  { slug: "author", term: "author" },
  { slug: "bonus", term: "bonus" },
  { slug: "bid", term: "bid" },
  { slug: "branch", term: "branch" },
  { slug: "brochure", term: "brochure" },
];

export function getAllWords() {
  return WORDS;
}

export function getWordBySlug(slug: string) {
  return WORDS.find((word) => word.slug === slug);
}

