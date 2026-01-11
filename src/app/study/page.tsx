import { getAllWords } from "@/data/words";
import StudyClient from "./StudyClient";

export const metadata = {
	title: "英単語学習",
	description: "ランダムに表示される英単語を学習します。",
	alternates: {
		canonical: "https://www.toeic-words.com/study",
	},
};

export default function StudyPage() {
  const words = getAllWords();

  return <StudyClient words={words} />;
}
