import "server-only";
import { list } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import fs from "node:fs";
import path from "node:path";

export type Word = {
  slug: string;
  term: string;
  level: 'important' | 'medium' | 'high';
};

type WordData = {
  important: Word[];
  medium: Word[];
  high: Word[];
  allWords: Word[];
};

function parseWords(text: string, level: 'important' | 'medium' | 'high'): Word[] {
  const seen = new Set<string>();
  const lines = text.split(/\r?\n/);
  const words: Word[] = [];

  for (const raw of lines) {
    const term = raw.trim();
    if (!term) continue;
    const slug = term.toLowerCase();
    if (seen.has(slug)) continue;
    seen.add(slug);
    words.push({ slug, term, level });
  }
  return words;
}

function buildWordData(important: Word[], medium: Word[], high: Word[]): WordData {
  const allWordsMap = new Map<string, Word>();
  [...important, ...medium, ...high].forEach(w => {
    if (!allWordsMap.has(w.slug)) {
      allWordsMap.set(w.slug, w);
    }
  });
  const allWords = Array.from(allWordsMap.values());

  return {
    important,
    medium,
    high,
    allWords,
  };
}

async function getWordsLocal(): Promise<WordData> {
  const loadWords = (filename: string, level: 'important' | 'medium' | 'high'): Word[] => {
    const filePath = path.join(process.cwd(), "__doc__", filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`Local word file not found: ${filePath}`);
      return [];
    }
    const text = fs.readFileSync(filePath, "utf-8");
    return parseWords(text, level);
  };

  const important = loadWords("word.txt", "important");
  const medium = loadWords("word_mid.txt", "medium");
  const high = loadWords("word_high.txt", "high");

  return buildWordData(important, medium, high);
}

async function getWordsBlob(): Promise<WordData> {
  const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });

  const loadWords = async (filename: string, level: 'important' | 'medium' | 'high'): Promise<Word[]> => {
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
      return parseWords(text, level);
    } catch (e) {
      console.error(`Error loading words from blob ${filename}:`, e);
      return [];
    }
  };

  const [important, medium, high] = await Promise.all([
    loadWords("words-file/word.txt", "important"),
    loadWords("words-file/word_mid.txt", "medium"),
    loadWords("words-file/word_high.txt", "high")
  ]);

  return buildWordData(important, medium, high);
}

// Cached function to fetch and parse words
const getWordsData = unstable_cache(
  async (): Promise<WordData> => {
    if (process.env.NODE_ENV === "development") {
      return getWordsLocal();
    }
    return getWordsBlob();
  },
  ["word-list-blob-v2"], // Cache key
  { 
    revalidate: process.env.NODE_ENV === 'development' ? 3600 : 3600 * 24 * 7,
    tags: ['word-data']
  } // Cache for 7 days in prod, 1 hour in dev
);

// Memoize the data fetching within the same request lifecycle
const getWordsDataCached = cache(async () => {
  return await getWordsData();
});

export async function getAllWords(): Promise<Word[]> {
  const data = await getWordsDataCached();
  return data.allWords;
}

export async function getImportantWords(): Promise<Word[]> {
  const data = await getWordsDataCached();
  return data.important;
}

export async function getMediumWords(): Promise<Word[]> {
  const data = await getWordsDataCached();
  return data.medium;
}

export async function getHighWords(): Promise<Word[]> {
  const data = await getWordsDataCached();
  return data.high;
}

export async function getWordBySlug(slug: string): Promise<Word | undefined> {
  const data = await getWordsDataCached();
  return data.allWords.find(w => w.slug === slug);
}
