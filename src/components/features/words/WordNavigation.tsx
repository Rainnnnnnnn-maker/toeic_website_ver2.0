import { getAllWords } from "@/data/words";
import WordNavigationClient from "./WordNavigationClient";

export default async function WordNavigation({ currentSlug }: { currentSlug: string }) {
  const allWords = await getAllWords();

  return <WordNavigationClient allWords={allWords} currentSlug={currentSlug} />;
}
