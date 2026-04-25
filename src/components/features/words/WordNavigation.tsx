import { getAllWords, getTodayRecommendedWords } from "@/data/words";
import WordNavigationClient from "./WordNavigationClient";

export default async function WordNavigation({ currentSlug }: { currentSlug: string }) {
  const [allWords, todayWords] = await Promise.all([
    getAllWords(),
    getTodayRecommendedWords(5),
  ]);

  return <WordNavigationClient allWords={allWords} todayWords={todayWords} currentSlug={currentSlug} />;
}
