import "server-only";
import { list } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import fs from "node:fs";
import path from "node:path";

export type Word = {
  slug: string;
  term: string;
};

type WordData = {
  important: Word[];
  medium: Word[];
  allWords: Word[];
};

function parseWords(text: string): Word[] {
  const seen = new Set<string>();
  const lines = text.split(/\r?\n/);
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

function buildWordData(important: Word[], medium: Word[]): WordData {
  const allWordsMap = new Map<string, Word>();
  [...important, ...medium].forEach(w => {
    if (!allWordsMap.has(w.slug)) {
      allWordsMap.set(w.slug, w);
    }
  });
  const allWords = Array.from(allWordsMap.values());

  return {
    important,
    medium,
    allWords,
  };
}

async function getWordsLocal(): Promise<WordData> {
  const loadWords = (filename: string): Word[] => {
    const filePath = path.join(process.cwd(), "__doc__", filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`Local word file not found: ${filePath}`);
      return [];
    }
    const text = fs.readFileSync(filePath, "utf-8");
    return parseWords(text);
  };

  const important = loadWords("word.txt");
  const medium = loadWords("word_mid.txt");

  return buildWordData(important, medium);
}

async function getWordsBlob(): Promise<WordData> {
  const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });

  const loadWords = async (filename: string): Promise<Word[]> => {
    // Find blob ending with filename (to handle potential folders or prefixes)
    const blob = blobs.find(b => b.pathname.endsWith(filename));
    if (!blob) {
      console.warn(`Blob not found for: ${filename}`);
      return [];
    }

    try {
      const res = await fetch(blob.url);
      if (!res.ok) {
        console.warn(`Failed to fetch blob: ${blob.url}`);
        return [];
      }
      const text = await res.text();
      return parseWords(text);
    } catch (e) {
      console.error(`Error loading words from blob ${filename}:`, e);
      return [];
    }
  };

  const [important, medium] = await Promise.all([
    loadWords("words-file/word.txt"),
    loadWords("words-file/word_mid.txt")
  ]);

  return buildWordData(important, medium);
}

// Cached function to fetch and parse words
const getWordsData = unstable_cache(
  async (): Promise<WordData> => {
    if (process.env.NODE_ENV === "development") {
      return getWordsLocal();
    }
    return getWordsBlob();
  },
  ["word-list-blob-v1"], // Cache key
  { revalidate: process.env.NODE_ENV === 'development' ? 3600 : 3600 * 24 * 7 } // Cache for 7 days in prod, 1 hour in dev
);

export async function getAllWords(): Promise<Word[]> {
  const data = await getWordsData();
  return data.allWords;
}

export async function getImportantWords(): Promise<Word[]> {
  const data = await getWordsData();
  return data.important;
}

export async function getMediumWords(): Promise<Word[]> {
  const data = await getWordsData();
  return data.medium;
}

export async function getWordBySlug(slug: string): Promise<Word | undefined> {
  const data = await getWordsData();
  return data.allWords.find(w => w.slug === slug);
}
