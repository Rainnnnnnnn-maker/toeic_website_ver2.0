import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "TOEIC重要単語へのお問い合わせページです。ご質問・ご要望・不具合報告などお気軽にご連絡ください。",
  alternates: {
    canonical: "https://www.toeic-words.com/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-8 text-sm text-black/50 dark:text-white/50">
        <Link href="/" className="hover:underline">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <span>お問い合わせ</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold">お問い合わせ</h1>

      <div className="space-y-6 text-sm leading-relaxed text-black/80 dark:text-white/80">
        <p>
          当サイトに関するご質問、ご要望、不具合の報告等がございましたら、以下の方法でお気軽にお問い合わせください。
        </p>

        <section className="rounded-xl border border-black/10 bg-white/50 p-6 dark:border-white/10 dark:bg-white/5">
          <h2 className="mb-4 text-lg font-semibold">
            GitHubからのお問い合わせ
          </h2>
          <p className="mb-4">
            不具合の報告や機能のリクエストは、GitHubのIssueからお寄せください。
          </p>
          <a
            href="https://github.com/rain-sk/toeic-website-ver2.0/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            GitHub Issueを作成する
          </a>
        </section>

        <section className="rounded-xl border border-black/10 bg-white/50 p-6 dark:border-white/10 dark:bg-white/5">
          <h2 className="mb-4 text-lg font-semibold">メールでのお問い合わせ</h2>
          <p className="mb-4">
            その他のお問い合わせは、下記メールアドレスまでご連絡ください。
          </p>
          <a
            href="mailto:paulowniarain@gmail.com"
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            paulowniarain@gmail.com
          </a>
          <p className="mt-3 text-xs text-black/50 dark:text-white/50">
            ※ 返信にお時間をいただく場合がございます。ご了承ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">お問い合わせの際のお願い</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>不具合の場合は、お使いのブラウザとOS、発生状況をお伝えください</li>
            <li>単語の内容に関するご指摘も歓迎しております</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
