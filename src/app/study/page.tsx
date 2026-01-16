import { getAllWords } from "@/data/words";
import StudyClient from "@/components/features/study/StudyClient";
import Script from "next/script";

export const metadata = {
	title: "Webで使えるTOEIC単語帳 | 英単語学習モード",
	description: "インストール不要、ブラウザで使える無料のTOEIC単語帳。ランダム出題される頻出単語を効率よく学習し、暗記チェックができます。",
	alternates: {
		canonical: "https://www.toeic-words.com/study",
	},
};

export default async function StudyPage() {
  const words = await getAllWords();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "TOP",
        "item": "https://www.toeic-words.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "学習モード",
        "item": "https://www.toeic-words.com/study"
      }
    ]
  };

  return (
    <>
      <Script
        id="json-ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StudyClient words={words} />
    </>
  );
}
