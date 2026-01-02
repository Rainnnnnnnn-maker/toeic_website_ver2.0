import fs from "node:fs";
import path from "node:path";

export type Word = {
  slug: string;
  term: string;
};

function loadWordsFromFile(filename: string): Word[] {
  const filePath = path.join(process.cwd(), ".doc", filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Word file not found: ${filename}`);
    return [];
  }
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

const IMPORTANT_WORDS: Word[] = loadWordsFromFile("word.txt");
const MEDIUM_WORDS: Word[] = loadWordsFromFile("word_mid.txt");

// Combine all words, ensuring uniqueness by slug for the global lookup
const ALL_WORDS_MAP = new Map<string, Word>();
[...IMPORTANT_WORDS, ...MEDIUM_WORDS].forEach(w => {
  if (!ALL_WORDS_MAP.has(w.slug)) {
    ALL_WORDS_MAP.set(w.slug, w);
  }
});
const ALL_WORDS = Array.from(ALL_WORDS_MAP.values());

export function getAllWords() {
  return ALL_WORDS;
}

export function getImportantWords() {
  return IMPORTANT_WORDS;
}

export function getMediumWords() {
  return MEDIUM_WORDS;
}

export function getWordBySlug(slug: string) {
  return ALL_WORDS_MAP.get(slug);
}
