import records from "./word-editorial.json";
import type { WordDetails } from "@/types/word";

type EditorialWord = {
  updatedAt: string;
  method: string;
  note: string;
  sources: string[];
  detail: WordDetails;
};

// Shared server/CLI content; never import the corpus into a Client Component.
const editorialWords: Readonly<Record<string, EditorialWord>> = records;

export function getEditorialWord(slug: string): EditorialWord | undefined {
  return Object.hasOwn(editorialWords, slug) ? editorialWords[slug] : undefined;
}
