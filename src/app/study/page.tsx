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
      <div className="sr-only">
        <h2>TOEIC英単語 学習モード（暗記テスト）</h2>
        <p>このページでは、TOEIC L&Rテストに頻出する重要単語をフラッシュカード形式で効率的に学習できます。600点、730点、800点以上のレベル別に収録された単語がランダムに出題されます。</p>
        <p>「覚えている」「覚えていない」を仕分けしながら反復学習することで、忘却曲線を意識した記憶の定着が可能です。覚えていない単語は詳細なAI解説ページへ遷移し、ニュアンスや例文、語源などを深く学ぶことができます。通勤・通学などのスキマ時間を活用して、毎日のTOEIC学習に役立ててください。</p>
      </div>
    </>
  );
}
