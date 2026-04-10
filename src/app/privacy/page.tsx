import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "TOEIC重要単語のプライバシーポリシーです。個人情報の取り扱い、Cookie、広告、アクセス解析について説明しています。",
  alternates: {
    canonical: "https://www.toeic-words.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-8 text-sm text-black/50 dark:text-white/50">
        <Link href="/" className="hover:underline">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <span>プライバシーポリシー</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold">プライバシーポリシー</h1>

      <div className="space-y-8 text-sm leading-relaxed text-black/80 dark:text-white/80">
        <p>
          TOEIC重要単語（以下「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーでは、当サイトにおける情報の取り扱いについて説明します。
        </p>

        <section>
          <h2 className="mb-3 text-lg font-semibold">1. 収集する情報</h2>
          <p>
            当サイトでは、サービスの提供・改善のため、以下の情報を収集することがあります。
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              アクセスログ情報（IPアドレス、ブラウザの種類、閲覧ページ、アクセス日時など）
            </li>
            <li>
              Cookie（クッキー）を通じて取得する情報
            </li>
          </ul>
          <p className="mt-2">
            なお、当サイトでは会員登録機能はなく、氏名・メールアドレス等の個人情報を直接収集することはありません。お気に入り機能はブラウザのローカルストレージに保存され、サーバーには送信されません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            2. Cookie（クッキー）の使用
          </h2>
          <p>
            当サイトでは、以下の目的でCookieを使用しています。
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>アクセス解析（Google Analytics）によるサイト利用状況の把握</li>
            <li>広告配信（Google AdSense）によるユーザーの興味に基づいた広告の表示</li>
            <li>サイトのパフォーマンス測定（Vercel Analytics）</li>
          </ul>
          <p className="mt-2">
            Cookieはブラウザの設定で無効にすることができますが、一部の機能が正しく動作しない可能性があります。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            3. Google Analyticsについて
          </h2>
          <p>
            当サイトでは、Googleが提供するアクセス解析ツール「Google
            Analytics」を使用しています。Google
            Analyticsはデータ収集のためにCookieを使用します。このデータは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p className="mt-2">
            Google Analyticsの利用規約については、
            <a
              href="https://marketingplatform.google.com/about/analytics/terms/jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Google Analytics利用規約
            </a>
            をご確認ください。Google
            Analyticsのオプトアウトについては、
            <a
              href="https://tools.google.com/dlpage/gaoptout?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Google Analyticsオプトアウトアドオン
            </a>
            をご利用ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            4. Google AdSenseについて
          </h2>
          <p>
            当サイトでは、Googleが提供する広告配信サービス「Google
            AdSense」を使用しています。Google
            AdSenseでは、ユーザーの興味に基づいた広告を表示するためにCookieを使用することがあります。
          </p>
          <p className="mt-2">
            Googleによる広告でのCookieの使用については、
            <a
              href="https://policies.google.com/technologies/ads?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              広告 - ポリシーと規約 - Google
            </a>
            をご確認ください。パーソナライズド広告の無効化については、
            <a
              href="https://adssettings.google.com/authenticated"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              広告設定
            </a>
            から行うことができます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">5. 第三者への情報提供</h2>
          <p>
            当サイトでは、法令に基づく場合を除き、ユーザーの情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            6. プライバシーポリシーの変更
          </h2>
          <p>
            当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">7. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、
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
    </main>
  );
}
