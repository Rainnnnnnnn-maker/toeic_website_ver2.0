import Link from "next/link";
import { getAllWords } from "@/data/words";
import StudyClient from "@/components/features/study/StudyClient";
import Script from "next/script";
import { serializeJsonLd } from "@/lib/json-ld";
import { createPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = createPublicPageMetadata({
  pathname: "/study",
  title: "無料TOEIC単語帳｜フラッシュカードで暗記",
  description: "ブラウザで使える無料のTOEIC単語フラッシュカード。ランダムに出る英単語の意味を思い出し、和訳・例文・発音を確認。覚えにくい語はこのブラウザに保存できます。",
});

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
        "item": metadata.alternates.canonical
      }
    ]
  };

  return (
    <>
      <Script
        id="json-ld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <StudyClient words={words} pageTitle="TOEIC単語フラッシュカード" saveWordLists />

      <section className="mx-auto max-w-3xl px-4 pt-8 pb-2 text-sm leading-relaxed text-slate-700">
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          TOEIC単語のフラッシュカードの使い方
        </h2>
        <p className="mb-3">
          ランダムに出題される英単語の意味を思い浮かべ、「答えを見る」で和訳と例文を確認します。目標スコアの目安から単語を選びたいときは、
          <Link href="/words" prefetch={false} className="text-blue-600 underline">レベル別のTOEIC単語一覧</Link>
          を使えます。
        </p>
        <p className="mb-3">
          「覚えていない」と「あとで」を選んだ単語は、それぞれの一覧にたまり、このブラウザに保存されます。次回開いたときも一覧から確認でき、「覚えている」を選ぶと一覧から外れます。「学習を終えて確認」で、これまでに保存した単語をまとめて見返せます。保存はこのブラウザ内のみで、ほかの端末には同期されません。
        </p>
        <h2 className="mt-5 mb-2 text-base font-semibold text-slate-800">
          ランダム出題を使う目的
        </h2>
        <p className="mb-3">
          a〜z 順の一覧だけで学ぶと、単語そのものではなく前後の並びを手掛かりに答えていないか判断しにくくなります。ランダム出題は順番を崩し、意味を単独で思い出せるか確認するための機能です。間違えた語は詳細ページの例文へ戻り、もう一度確認してください。
        </p>
        <h2 className="mt-5 mb-2 text-base font-semibold text-slate-800">
          推奨利用シーン
        </h2>
        <ul className="mb-3 list-inside list-disc space-y-1">
          <li>新規単語のインプット後、翌日〜1 週間後の定着度チェック</li>
          <li>試験 1 ヶ月前から週 3〜5 回の反復学習</li>
          <li>1 セッション 10〜20 語、5〜10 分のスキマ時間学習</li>
          <li>覚えにくい単語は「お気に入り」に登録し、復習モードで集中復習（復習モードはログインが必要）</li>
        </ul>
        <p className="mb-1 text-xs text-slate-500">
          より詳しい学習戦略は、{" "}
          <Link href="/guide/forgetting-curve" prefetch={false} className="text-blue-600 underline">
            「忘却曲線と間隔反復を取り入れる方法」
          </Link>{" "}
          や{" "}
          <Link href="/guide/toeic-vocab-by-score" prefetch={false} className="text-blue-600 underline">
            「スコア別の単語学習戦略」
          </Link>{" "}
          をご参照ください。
        </p>
      </section>
    </>
  );
}
