import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "TOEIC重要単語の利用規約です。当サイトの利用条件について説明しています。",
  alternates: {
    canonical: "https://www.toeic-words.com/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <nav className="mb-8 text-sm text-black/50 dark:text-white/50">
        <Link href="/" className="hover:underline">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <span>利用規約</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold">利用規約</h1>

      <div className="space-y-8 text-sm leading-relaxed text-black/80 dark:text-white/80">
        <p>
          この利用規約（以下「本規約」）は、TOEIC重要単語（以下「当サイト」）の利用条件を定めるものです。ユーザーの皆様には、本規約に従って当サイトをご利用いただきます。
        </p>

        <section>
          <h2 className="mb-3 text-lg font-semibold">1. サービスの内容</h2>
          <p>
            当サイトは、TOEIC試験対策のための英単語学習サービスを無料で提供しています。単語の解説、例文、発音機能、学習モード等の機能を含みます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">2. AI生成コンテンツについて</h2>
          <p>
            当サイトの単語解説・例文等のコンテンツは、AIを活用して生成されています。内容の正確性には細心の注意を払っていますが、以下の点についてご了承ください。
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              AI生成コンテンツには誤りが含まれる可能性があります
            </li>
            <li>
              学習の参考としてご利用いただき、重要な場面では他の情報源もご確認ください
            </li>
            <li>
              コンテンツは予告なく更新・修正される場合があります
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">3. 知的財産権</h2>
          <p>
            当サイトに掲載されているコンテンツ（文章、画像、デザイン等）の著作権は、当サイト運営者に帰属します。私的利用の範囲を超えた無断転載・複製はご遠慮ください。
          </p>
          <p className="mt-2">
            「TOEIC」はEducational Testing Service（ETS）の登録商標です。当サイトはETSとの提携・推奨関係はありません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">4. 禁止事項</h2>
          <p>ユーザーは、以下の行為を行ってはなりません。</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>当サイトのコンテンツを無断で商用利用する行為</li>
            <li>当サイトのサーバーやネットワークに過度の負荷をかける行為</li>
            <li>当サイトの運営を妨害する行為</li>
            <li>その他、法令または公序良俗に反する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">5. 免責事項</h2>
          <p>
            当サイトは、提供する情報の正確性、完全性、有用性等について、いかなる保証も行いません。当サイトの利用により生じた損害について、当サイト運営者は一切の責任を負いません。
          </p>
          <p className="mt-2">
            当サイトは、予告なくサービスの内容を変更、または提供を中断・終了する場合があります。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">6. 広告について</h2>
          <p>
            当サイトでは、Google AdSense等の第三者配信広告サービスを利用しています。広告配信事業者は、ユーザーの興味に基づいた広告を表示するためにCookieを使用することがあります。詳細は
            <Link
              href="/privacy"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              プライバシーポリシー
            </Link>
            をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">7. 規約の変更</h2>
          <p>
            当サイトは、必要に応じて本規約を変更することがあります。変更後の規約は、本ページに掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">8. お問い合わせ</h2>
          <p>
            本規約に関するお問い合わせは、
            <Link
              href="/contact"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              お問い合わせページ
            </Link>
            よりご連絡ください。
          </p>
        </section>

        <p className="pt-4 text-xs text-black/40 dark:text-white/40">
          制定日：2026年4月11日
        </p>
      </div>
    </>
  );
}
