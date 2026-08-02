import Link from "next/link";
import type { Metadata } from "next";
import { getAllWords } from "@/data/words";
import FavoritesListenClient from "@/components/features/favorites/FavoritesListenClient";
import { A8AdBanner468x60 } from "@/components/common/A8AdBanner";

export const metadata: Metadata = {
  title: "お気に入り単語 聞き流し | TOEIC Words",
  description: "お気に入りに登録した単語の発音・英語例文・日本語訳を自動再生する「聞き流しモード」です。",
  // ユーザー固有のお気に入りに依存するページなので noindex（self-canonical は付けない）
  robots: {
    index: false,
  },
};

export default async function FavoritesListenPage() {
  const allWords = await getAllWords();

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <div className="w-full max-w-2xl flex flex-col relative">
        <FavoritesListenClient allWords={allWords} />

        <A8AdBanner468x60 />

        <section className="mt-10 text-sm leading-relaxed text-slate-700">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            お気に入り単語 聞き流しモードとは
          </h2>
          <p className="mb-3">
            「聞き流しモード」は、お気に入りに登録した TOEIC 単語を、画面を見続けなくても耳だけで学習できる自動再生機能です。単語の発音・英語例文・日本語訳が自然な間隔で連続再生されるため、通勤・通学・家事などの「ながら時間」を活かして、自分が苦手な単語を集中的に語彙とリスニング力の両面から鍛えられます。
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
              <strong>英語例文</strong>：ビジネス場面を想定した AI 生成例文を英語で再生
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
              周囲に配慮できる場所では、英語例文の後に<strong>声に出して復唱</strong>し、聞こえ方と発音を照合
            </li>
            <li>
              覚えた単語は<strong>お気に入りから外す</strong>ことで、苦手な単語だけを効率よく繰り返せます
            </li>
            <li>
              後で<strong>意味を隠して思い出す</strong>確認も行い、聞いただけで覚えたと判断しない
            </li>
          </ul>

          <p className="text-xs text-slate-500">
            文字でじっくり確認したい場合は{" "}
            <Link href="/review" prefetch={false} className="text-blue-600 underline">
              「お気に入り一覧」
            </Link>
            、テスト形式で覚えたい場合は{" "}
            <Link href="/study" prefetch={false} className="text-blue-600 underline">
              学習モード
            </Link>
            、復習タイミングの考え方は{" "}
            <Link href="/guide/forgetting-curve" prefetch={false} className="text-blue-600 underline">
              「忘却曲線と間隔反復を取り入れる方法」
            </Link>{" "}
            をご覧ください。
          </p>
        </section>
      </div>
    </div>
  );
}
