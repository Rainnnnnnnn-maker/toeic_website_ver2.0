import { getAllWords } from "@/data/words";
import ReviewWrapper from "@/components/features/review/ReviewWrapper";

export const metadata = {
  title: "復習モード",
  description: "お気に入り登録した単語を重点的に復習します。",
  alternates: {
    canonical: "https://www.toeic-words.com/review",
  },
  robots: {
    index: false,
  },
};

export default async function ReviewPage() {
  const allWords = await getAllWords();

  return <ReviewWrapper allWords={allWords} />;
}
