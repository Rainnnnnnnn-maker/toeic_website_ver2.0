import { getAllWords } from "@/data/words";
import TodayWordsListenClient from "@/components/features/today-words/TodayWordsListenClient";

export const metadata = {
  title: "今日の単語 聞き流し | TOEIC Words",
  description: "今日の単語5つの英語と例文を自動再生で聞き流し学習ができます。",
};

export default async function TodayWordsListenPage() {
  const allWords = await getAllWords();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <TodayWordsListenClient allWords={allWords} />
    </div>
  );
}
