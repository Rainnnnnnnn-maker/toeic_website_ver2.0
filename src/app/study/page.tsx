import Link from "next/link";
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

      <section className="mx-auto max-w-3xl px-4 pt-8 pb-2 text-sm leading-relaxed text-slate-700">
        {/* <nav className="mb-4 text-xs text-slate-500">
          <Link href="/" className="hover:underline">TOP</Link>
          <span className="mx-2">/</span>
          <span>学習モード</span>
        </nav> */}
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          学習モード｜ランダム出題で TOEIC 単語を効率よく暗記
        </h2>
        <p className="mb-3">
          学習モードは、当サイトに収録された 1,300 語以上の TOEIC 重要単語からランダムに出題し、暗記の定着度をフラッシュカード形式でチェックできる機能です。レベル（important / mid / high）を絞って出題することもでき、目標スコア帯に最適化された学習が可能です。
        </p>
        <h2 className="mt-5 mb-2 text-base font-semibold text-slate-800">
          なぜ「ランダム出題」が暗記に効くのか
        </h2>
        <p className="mb-3">
          単語帳を a〜z 順に通読する学習法は、「順番」に依存して記憶が形成されるため、本番で順序がバラバラに出題された際に思い出しにくくなる弱点があります。心理学では、これを「ブロック練習の弊害」と呼びます。一方、ランダム出題（インターリーブ学習）では、毎回違う文脈で単語と出会うため、本番に近い形で記憶が定着します。研究でも、ランダム出題は通読より長期記憶への定着率が高いことが確認されています。
        </p>
        <h2 className="mt-5 mb-2 text-base font-semibold text-slate-800">
          推奨利用シーン
        </h2>
        <ul className="mb-3 list-inside list-disc space-y-1">
          <li>新規単語のインプット後、翌日〜1 週間後の定着度チェック</li>
          <li>試験 1 ヶ月前から週 3〜5 回の反復学習</li>
          <li>1 セッション 10〜20 語、5〜10 分のスキマ時間学習</li>
          <li>覚えにくい単語は「お気に入り」に登録し、復習モードで集中復習</li>
        </ul>
        <p className="mb-1 text-xs text-slate-500">
          より詳しい学習戦略は、{" "}
          <Link href="/guide/forgetting-curve" className="text-blue-600 underline">
            「忘却曲線を活用した暗記法」
          </Link>{" "}
          や{" "}
          <Link href="/guide/toeic-vocab-by-score" className="text-blue-600 underline">
            「スコア別必要語彙数と学習戦略」
          </Link>{" "}
          をご参照ください。
        </p>
      </section>
    </>
  );
}
