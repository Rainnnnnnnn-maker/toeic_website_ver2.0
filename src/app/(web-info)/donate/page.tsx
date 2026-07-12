import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "寄付のお願い｜Amazonギフトで運営を応援",
  description:
    "「TOEIC重要単語」は会員登録不要（ログインは任意）・完全無料で運営しています。サーバー費用や AI・音声生成の API 利用料の一部を、Amazon ギフト券による寄付でご支援いただけます。いただいた寄付はサイトの維持・改善に使わせていただきます。",
  alternates: {
    canonical: "https://www.toeic-words.com/donate",
  },
};

const AMAZON_GIFT_URL = "https://amzn.to/2PPFGnT";
const DONATION_ACCOUNT = "paulowniarain@gmail.com";

export default function DonatePage() {
  return (
    <>
      <nav className="mb-8 text-sm text-black/50 dark:text-white/50">
        <Link href="/" className="hover:underline">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <span>寄付のお願い</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold">寄付のお願い</h1>

      <div className="space-y-10 text-sm leading-relaxed text-black/80 dark:text-white/80">
        <section>
          <h2 className="mb-3 text-lg font-semibold">無料運営へのご支援のお願い</h2>
          <p>
            「TOEIC重要単語」は、会員登録不要（ログインは任意）・完全無料の個人運営サービスです。サーバー費用、AI 解説の生成、ネイティブ発音音声の生成などにより、サイトを維持・運営するためのコストが日々発生しています。
          </p>
          <p className="mt-2">
            少しでも「役に立った」と感じていただけましたら、Amazon ギフト券による寄付でご支援いただけると大変励みになります。寄付は任意であり、すべての機能はこれまで通り無料でご利用いただけます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Amazonギフト券での寄付方法</h2>
          <p>
            Amazon ギフト券（E メールタイプ）を、以下の寄付先アカウント宛にお送りいただく形でご支援いただけます。
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-2">
            <li>
              下記のリンクから Amazon ギフト券（E メールタイプ）の購入ページを開きます。
            </li>
            <li>
              送り先（受取人）のメールアドレスに、寄付先アカウントを入力します。
            </li>
            <li>
              任意の金額を指定し、購入手続きを完了してください。
            </li>
          </ol>

          <div className="mt-5 rounded-lg border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="mb-3">
              <span className="font-semibold">寄付先アカウント（送り先メールアドレス）</span>
              <br />
              <code className="mt-1 inline-block rounded bg-black/5 px-2 py-1 text-sm dark:bg-white/10">
                {DONATION_ACCOUNT}
              </code>
            </p>
            <a
              href={AMAZON_GIFT_URL}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="inline-flex items-center justify-center rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400"
            >
              Amazonギフト券で寄付する
            </a>
          </div>
        </section>

        {/* <section>
          <h2 className="mb-3 text-lg font-semibold">いただいた寄付の使い道</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>サーバー・ホスティング費用（Vercel）</li>
            <li>AI 解説の生成にかかる費用</li>
            <li>ネイティブ発音音声の生成にかかる費用</li>
            <li>収録単語の追加・コンテンツ品質の改善</li>
          </ul>
        </section> */}

        <section>
          <h2 className="mb-3 text-lg font-semibold">ご留意ください</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              寄付はあくまで任意のご厚意です。寄付の有無によって利用できる機能が変わることはありません。
            </li>
            <li>
              いただいた寄付は原則として返金できません。あらかじめご了承ください。
            </li>
            <li>
              寄付に関するご質問は、
              <Link
                href="/contact"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                お問い合わせ
              </Link>
              よりお気軽にご連絡ください。
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
