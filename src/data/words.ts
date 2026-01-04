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

const IMPORTANT_WORDS: Word[] = [];
const MEDIUM_WORDS: Word[] = [];
let ALL_WORDS_MAP: Map<string, Word> | null = null;
let ALL_WORDS: Word[] | null = null;

function ensureWordsLoaded() {
  if (ALL_WORDS_MAP) return;

  const important = loadWordsFromFile("word.txt");
  const medium = loadWordsFromFile("word_mid.txt");
  
  IMPORTANT_WORDS.push(...important);
  MEDIUM_WORDS.push(...medium);

  ALL_WORDS_MAP = new Map<string, Word>();
  [...important, ...medium].forEach(w => {
    if (!ALL_WORDS_MAP!.has(w.slug)) {
      ALL_WORDS_MAP!.set(w.slug, w);
    }
  });
  ALL_WORDS = Array.from(ALL_WORDS_MAP.values());
}

export function getAllWords() {
  ensureWordsLoaded();
  return ALL_WORDS!;
}

export function getImportantWords() {
  ensureWordsLoaded();
  return IMPORTANT_WORDS;
}

export function getMediumWords() {
  ensureWordsLoaded();
  return MEDIUM_WORDS;
}

export function getWordBySlug(slug: string) {
  ensureWordsLoaded();
  return ALL_WORDS_MAP!.get(slug);
}
