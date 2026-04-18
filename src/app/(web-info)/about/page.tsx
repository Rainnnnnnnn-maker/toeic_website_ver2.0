import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "当サイトについて",
  description:
    "TOEIC重要単語は、AIを活用してTOEIC頻出単語を効率的に学習できる無料サービスです。サイトの特徴や機能について紹介します。",
  alternates: {
    canonical: "https://www.toeic-words.com/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <nav className="mb-8 text-sm text-black/50 dark:text-white/50">
        <Link href="/" className="hover:underline">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <span>当サイトについて</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold">当サイトについて</h1>

      <div className="space-y-8 text-sm leading-relaxed text-black/80 dark:text-white/80">
        <section>
          <h2 className="mb-3 text-lg font-semibold">TOEIC重要単語とは</h2>
          <p>
            「TOEIC重要単語」は、TOEIC試験に頻出する英単語を効率的に学習できる無料のWebサービスです。AIによる詳細な解説と豊富な例文で、単語の意味だけでなく、実際のビジネスシーンでの使い方まで理解を深めることができます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">主な機能</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong>レベル別単語一覧</strong>
              ：目標スコア（600点・730点・800点）に合わせて厳選された頻出単語
            </li>
            <li>
              <strong>AI解説</strong>
              ：各単語の意味、ニュアンス、文法パターンを丁寧に解説
            </li>
            <li>
              <strong>実践的な例文</strong>
              ：TOEIC試験に即した3〜5つのビジネス例文
            </li>
            <li>
              <strong>音声発音</strong>
              ：ネイティブ発音を確認できるTTS機能
            </li>
            <li>
              <strong>学習モード</strong>
              ：ランダム出題で効率的に暗記チェック
            </li>
            <li>
              <strong>お気に入り機能</strong>
              ：覚えたい単語を保存して復習
            </li>
            <li>
              <strong>今日のおすすめ単語</strong>
              ：毎日5単語を厳選してお届け
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">開発について</h2>
          <p>
            当サイトは、個人開発者によって運営されています。Next.jsをベースにしたモダンなWeb技術を使用し、快適な学習体験を提供しています。コンテンツの生成にはGoogle
            GeminiのAI技術を活用しています。
          </p>
          <p className="mt-2">
            ソースコードはGitHubで公開しています。機能追加のリクエストや不具合のご報告は、
            <Link
              href="/contact"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              お問い合わせページ
            </Link>
            からお気軽にどうぞ。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">注意事項</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              「TOEIC」はEducational Testing
              Service（ETS）の登録商標です。当サイトはETSとの提携・推奨関係はありません。
            </li>
            <li>
              コンテンツはAIにより生成されているため、誤りが含まれる可能性があります。学習の参考としてご活用ください。
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
