import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "TOEIC重要単語のプライバシーポリシーです。個人情報の取り扱い、Cookie・アクセス解析について説明しています。",
  alternates: {
    canonical: "https://www.toeic-words.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
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
              サービスの利用状況に関する情報（アクセスログ等）
            </li>
            <li>
              Cookie（クッキー）を通じて取得する情報
            </li>
            <li>
              ログイン機能（任意）を利用した場合の、メールアドレス等のアカウント情報
            </li>
            <li>
              ログイン中に保存したお気に入り単語、および復習回数・回答結果・復習日時・次回復習予定日・連続学習日数
            </li>
            <li>
              「意味で探す」機能に入力した検索語
            </li>
          </ul>
          <p className="mt-2">
            当サイトの単語閲覧・検索・お気に入り・通常の学習と復習は、会員登録なしで利用できます。未ログインの場合、氏名・メールアドレス等の個人情報を直接収集することはなく、お気に入り機能はブラウザのローカルストレージに保存され、サーバーには送信されません。マイページの復習スケジュールと複数端末同期はログインが必要です。
          </p>
          <p className="mt-2">
            任意のログイン機能（Google アカウント連携）を利用した場合は、メールアドレス等のアカウント情報、お気に入りに登録した単語、復習回数、「覚えている」「覚えていない」「あとで」に基づく回答結果、最終・次回復習日時、連続学習日数が、当サイトが利用する認証・データベースサービス（Supabase）のサーバーに保存されます。これらの情報は、本人確認、お気に入りの同期、復習対象と復習時期の算出、学習記録の表示および複数端末同期の目的に利用します。送信に失敗した復習記録は再送のためユーザー別にブラウザのローカルストレージへ一時保存し、Supabaseへの保存成功後に削除します。
          </p>
          <p className="mt-2">
            「意味で探す」機能を利用した場合、入力した検索語は、意味の近い単語を検索するための数値データへ変換する目的で Google Gemini API
            に送信されます。TOPページから検索した場合、検索語は同じタブのセッションストレージに一時保存され、タブを閉じると削除されます。遷移先URLには検索語ではなく無作為な識別子だけを含めます。当サイトのRedis検索結果キャッシュおよびGoogle Analyticsには検索語本文を保存・送信せず、検索結果キャッシュには検索語から生成したハッシュ値のみを使用します。個人情報、機密情報、第三者に関する非公開情報は入力しないでください。Googleにおけるデータの取り扱いは、
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Gemini API追加利用規約
            </a>
            および
            <a
              href="https://policies.google.com/privacy?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Googleプライバシーポリシー
            </a>
            をご確認ください。
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
            <li>サイト利用状況の把握・改善</li>
            <li>広告の配信・最適化</li>
            <li>サイトのパフォーマンス測定</li>
          </ul>
          <p className="mt-2">
            Cookieはブラウザの設定で無効にすることができますが、一部の機能が正しく動作しない可能性があります。各ブラウザのヘルプページに記載されている手順に従って、Cookieの受け入れを拒否したり、Cookieを受け取ったときに通知するように設定したりすることができます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            3. 広告配信について
          </h2>
          <p>
            当サイトでは、第三者配信の広告サービスである
            <strong>Google AdSense</strong>
            を利用しています。
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              Googleなどの第三者配信事業者は、Cookieを使用して、ユーザーが当サイトや他のサイトに過去にアクセスした際の情報に基づいて、適切な広告を表示します。
            </li>
            <li>
              Cookieによって取得される情報には、氏名、住所、メールアドレス、電話番号など個人を特定する情報は含まれません。
            </li>
            <li>
              ユーザーは、
              <a
                href="https://adssettings.google.com/authenticated"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Google広告設定
              </a>
              で、パーソナライズ広告を無効にすることができます。
            </li>
            <li>
              第三者配信事業者によるCookie使用に関する詳細は、
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Googleの広告に関するポリシーとプライバシー
              </a>
              をご確認ください。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            4. アクセス解析ツールについて
          </h2>
          <p>
            当サイトでは、サイトの利用状況を把握しサービスを改善する目的で、Googleが提供するアクセス解析ツール
            <strong>Google Analytics</strong>
            を利用しています。
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              Google Analyticsは、トラフィックデータの収集のためにCookieを使用しています。
            </li>
            <li>
              トラフィックデータは匿名で収集されており、個人を特定するものではありません。
            </li>
            <li>
              この機能はブラウザのCookieを無効にすることで収集を拒否することができます。詳細は
              <a
                href="https://tools.google.com/dlpage/gaoptout?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Google Analyticsオプトアウトアドオン
              </a>
              をご確認ください。
            </li>
            <li>
              Google Analyticsの利用規約・プライバシーポリシーについては、
              <a
                href="https://marketingplatform.google.com/about/analytics/terms/jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Google Analytics利用規約
              </a>
              および
              <a
                href="https://policies.google.com/privacy?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Googleプライバシーポリシー
              </a>
              をご確認ください。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">5. 第三者への情報提供</h2>
          <p>
            当サイトでは、法令に基づく場合を除き、ユーザーの情報を第三者に提供することはありません。なお、上記「広告配信について」「アクセス解析ツールについて」に記載のとおり、Googleおよびその提携事業者にCookieを通じた情報が送信される場合がありますが、これらは個人を特定するものではありません。また、ログイン機能を利用した場合のアカウント情報、お気に入りデータおよび復習・連続学習の記録は、認証・データベースサービス「Supabase」のサーバーに保管されます。
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
          最終更新日：2026年8月29日
        </p>
      </div>
    </>
  );
}
