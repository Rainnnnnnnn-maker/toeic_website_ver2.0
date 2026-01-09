import { getAllWords } from "@/data/words";
import ReviewWrapper from "./ReviewWrapper";

export const metadata = {
  title: "復習モード",
  description: "お気に入り登録した単語を重点的に復習します。",
  alternates: {
    canonical: "/review",
  },
};

export default function ReviewPage() {
  const allWords = getAllWords();

  return <ReviewWrapper allWords={allWords} />;
}
