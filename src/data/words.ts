import fs from "node:fs";
import path from "node:path";

export type Word = {
  slug: string;
  term: string;
};

function loadWordsFromFile(): Word[] {
  const filePath = path.join(process.cwd(), ".doc", "word.txt");
  const content = fs.readFileSync(filePath, "utf-8");
  const seen = new Set<string>();
  const lines = content.split(/\r?\n/);
  const words: Word[] = [];
  for (const raw of lines) {
    const term = raw.trim();
    if (!term) continue;
    const slug = term.toLowerCase();
    if (seen.has(slug)) continue;
    seen.add(slug);
    words.push({ slug, term });
  }
  return words;
}

const WORD_CACHE: Word[] = loadWordsFromFile();

export function getAllWords() {
  return WORD_CACHE;
}

export function getWordBySlug(slug: string) {
  return WORD_CACHE.find((word) => word.slug === slug);
}
