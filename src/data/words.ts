import "server-only";
import { list } from "@vercel/blob";
import { unstable_cache } from "next/cache";

export type Word = {
  slug: string;
  term: string;
};

type WordData = {
  important: Word[];
  medium: Word[];
  allWords: Word[];
};

// Cached function to fetch and parse words
const getWordsFromBlob = unstable_cache(
  async (): Promise<WordData> => {
    // 1. List files to find the URLs
    // Note: If you have many files, you might need pagination, but for now we assume simple usage.
    const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
    
    // 2. Helper to fetch and parse
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
      } catch (e) {
        console.error(`Error loading words from blob ${filename}:`, e);
        return [];
      }
    };

    const [important, medium] = await Promise.all([
      loadWords("words-file/word.txt"),
      loadWords("words-file/word_mid.txt")
    ]);

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
  },
  ["word-list-blob-v1"], // Cache key
  { revalidate: 3600*24*7 } // Cache for 7 days
);

export async function getAllWords(): Promise<Word[]> {
  const data = await getWordsFromBlob();
  return data.allWords;
}

export async function getImportantWords(): Promise<Word[]> {
  const data = await getWordsFromBlob();
  return data.important;
}

export async function getMediumWords(): Promise<Word[]> {
  const data = await getWordsFromBlob();
  return data.medium;
}

export async function getWordBySlug(slug: string): Promise<Word | undefined> {
  const data = await getWordsFromBlob();
  return data.allWords.find(w => w.slug === slug);
}
