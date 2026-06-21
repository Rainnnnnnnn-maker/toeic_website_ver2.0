import Link from "next/link";
import type { Metadata } from "next";
import { getTodayRecommendedWords } from "@/data/words";
import TodayWordsListenClient from "@/components/features/today-words/TodayWordsListenClient";
import { A8AdBanner468x60 } from "@/components/common/A8AdBanner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "今日の単語 聞き流し | TOEIC Words",
  description: "通勤・通学や家事などのスキマ時間に。その日に選ばれたTOEIC頻出単語5つの発音・英語例文・日本語訳を自動再生する「聞き流しモード」で、リスニング力と語彙力を同時に鍛えられます。",
  alternates: {
    canonical: "https://www.toeic-words.com/today-words/listen",
  },
};

export default async function TodayWordsListenPage() {
  const todayWords = await getTodayRecommendedWords();

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f9fafb_45%,#ffffff_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <div className="w-full max-w-2xl flex flex-col relative">
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-pulse w-full max-w-xl h-[400px] bg-white rounded-xl border border-slate-200" /></div>}>
          <TodayWordsListenClient words={todayWords} />
        </Suspense>

        <A8AdBanner468x60 />

        <section className="mt-10 text-sm leading-relaxed text-slate-700">
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          今日の単語 聞き流しモードとは
        </h2>
        <p className="mb-3">
          「聞き流しモード」は、その日に選ばれた TOEIC 重要単語 5 語を、画面を見続けなくても耳だけで学習できる自動再生機能です。単語の発音・英語例文・日本語訳が自然な間隔で連続再生されるため、通勤・通学・家事などの「ながら時間」を活かして語彙とリスニング力を同時に鍛えられます。
        </p>

        <h3 className="mt-4 mb-2 text-sm font-semibold text-slate-800">
          再生の流れ
        </h3>
        <p className="mb-3">
          1 単語につき以下の 3 ステップを順番に音声で再生し、最後の単語まで自動で進みます。途中で一時停止・スキップ・前の単語に戻ることもできます。
        </p>
        <ol className="mb-3 list-inside list-decimal space-y-1">
          <li>
            <strong>単語の発音</strong>：英単語をネイティブ音声で読み上げ
          </li>
          <li>
            <strong>英語例文</strong>：TOEIC 形式の例文を英語で再生
          </li>
          <li>
            <strong>日本語訳</strong>：例文の意味を日本語で確認
          </li>
        </ol>

        <h3 className="mt-4 mb-2 text-sm font-semibold text-slate-800">
          こんな場面におすすめ
        </h3>
        <ul className="mb-3 list-inside list-disc space-y-1">
          <li>
            <strong>通勤・通学中</strong>：イヤホンで耳から TOEIC 単語をインプット
          </li>
          <li>
            <strong>家事・運動中</strong>：手が離せないハンズフリーの時間に
          </li>
          <li>
            <strong>就寝前のリラックスタイム</strong>：明るい画面を見ずに復習
          </li>
          <li>
            <strong>朝のウォーミングアップ</strong>：英語耳を起こしてから 1 日を始める
          </li>
        </ul>

        <h3 className="mt-4 mb-2 text-sm font-semibold text-slate-800">
          効果的な使い方
        </h3>
        <ul className="mb-3 list-inside list-disc space-y-1">
          <li>
            英語例文の後に<strong>声に出してシャドーイング</strong>すると、発音とリズムが定着しやすくなります
          </li>
          <li>
            聞き取れなかった単語は通常モードに戻り、<strong>「お気に入り」に追加</strong>して翌日以降に復習
          </li>
          <li>
            朝・昼・夜と<strong>1 日複数回流す</strong>ことで、忘却曲線に沿った間隔反復になります
          </li>
        </ul>

        <p className="text-xs text-slate-500">
          文字でじっくり確認したい場合は{" "}
          <Link href="/today-words" prefetch={false} className="text-blue-600 underline">
            「今日のおすすめ 5 単語」
          </Link>
          、テスト形式で覚えたい場合は{" "}
          <Link href="/study" prefetch={false} className="text-blue-600 underline">
            学習モード
          </Link>
          、復習タイミングの考え方は{" "}
          <Link href="/guide/forgetting-curve" prefetch={false} className="text-blue-600 underline">
            「忘却曲線を活用した暗記法」
          </Link>{" "}
          をご覧ください。
        </p>
      </section>
      </div>
    </div>
  );
}
