import { getAllWords } from "@/data/words";
import StudyClient from "./StudyClient";

export const metadata = {
	title: "Webで使えるTOEIC単語帳 | 英単語学習モード",
	description: "インストール不要、ブラウザで使える無料のTOEIC単語帳。ランダム出題される頻出単語を効率よく学習し、暗記チェックができます。",
	alternates: {
		canonical: "https://www.toeic-words.com/study",
	},
};

export default function StudyPage() {
  const words = getAllWords();

  return <StudyClient words={words} />;
}
