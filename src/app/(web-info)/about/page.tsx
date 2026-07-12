import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "当サイトについて｜運営方針・単語選定基準・更新ポリシー",
  description:
    "TOEIC 重要単語は、TOEIC 頻出 1,300 語以上を効率的に学習できる無料サービスです。運営者情報、単語選定の根拠、解説作成と品質管理のフロー、サイトの更新方針について説明します。",
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

      <div className="space-y-10 text-sm leading-relaxed text-black/80 dark:text-white/80">
        <section>
          <h2 className="mb-3 text-lg font-semibold">TOEIC重要単語とは</h2>
          <p>
            「TOEIC重要単語」は、TOEIC L&amp;R 試験に頻出する英単語を効率的に学習できる無料の Web サービスです。1,300 語以上の頻出単語を「important（基礎）／ mid（中級）／ high（上級）」の 3 段階に分類し、各単語にビジネス文脈に最適化した意味・ニュアンス解説、複数の例文、ネイティブ発音音声を提供しています。解説は運営者がチェックし、気になる箇所は修正しながら掲載しています。
          </p>
          <p className="mt-2">
            会員登録は不要で、すべての機能を無料で利用できます。お気に入り情報はブラウザのローカルストレージに保存され、サーバーには送信されません。複数の端末でお気に入りを同期したい方向けに、任意の Google ログイン機能も提供しています（ログインした場合のみ、お気に入りがサーバーに保存されます）。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">このサイトを作った理由</h2>
          <p>
            運営者自身が TOEIC 学習に取り組む中で、「市販の単語帳は冊子としてかさばる」「Web で単語の意味を調べてもビジネス文脈に即した例文が見つからない」「派生語まで含めた解説が得られない」という不便を感じていました。
          </p>
          <p className="mt-2">
            そこで、TOEIC のビジネス文脈に最適化された AI 解説と例文を、いつでもスマートフォンから無料で確認できる学習ツールが欲しいという動機で、本サイトを開発しました。学習者が「単語の意味だけでなく、ニュアンスとコロケーションまで含めて運用できる状態」に到達することを目標にしています。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">主な機能</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong>レベル別単語一覧</strong>
              {"：目標スコア（600・730・860 点）に合わせて 3 段階に分類された頻出単語"}
            </li>
            <li>
              <strong>AI 解説</strong>
              {"：Google Gemini により生成された、各単語の意味・ニュアンス・文法パターンの丁寧な解説"}
            </li>
            <li>
              <strong>実践的な例文</strong>
              {"：TOEIC のビジネス文脈に即した 3〜5 件の例文（音声付き）"}
            </li>
            <li>
              <strong>ネイティブ発音</strong>
              {"：Google Cloud Text-to-Speech による高品質な英語・日本語音声"}
            </li>
            <li>
              <strong>学習モード</strong>
              {"：ランダム出題形式で暗記の定着度をチェック"}
            </li>
            <li>
              <strong>復習モード</strong>
              {"：お気に入り登録した単語のみを集中的に復習"}
            </li>
            <li>
              <strong>今日のおすすめ 5 単語</strong>
              {"：日付固定ロジックで毎日同じ 5 語をおすすめ"}
            </li>
            <li>
              <strong>聞き流しモード</strong>
              {"：今日の 5 単語を「単語 → 英文例 → 日本語訳」の順に自動再生"}
            </li>
            <li>
              <strong>学習ガイド</strong>
              {"：スコア別戦略・Part 別対策・忘却曲線を活用した暗記法などの記事を公開（"}
              <Link
                href="/guide"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                /guide
              </Link>
              {"）"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">単語選定の根拠</h2>
          <p>
            収録単語は、以下の複数ソースに基づき、TOEIC 頻出度を集計したうえでランクを決定しています。
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>TOEIC 公式問題集（複数年版）に出現する語彙の頻度集計</li>
            <li>市販の TOEIC 頻出語彙集における必出ランク</li>
            <li>コーパス分析（COCA・BNC）におけるビジネス語彙の頻度</li>
            <li>過去の受験者がつまずきやすいと報告した単語</li>
          </ul>
          <p className="mt-3">
            選定基準とランクの定義については、
            <Link
              href="/guide/word-rank-criteria"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              「当サイトの単語選定基準と推奨学習フロー」
            </Link>
            で詳しく説明しています。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">解説の作成方針と品質管理</h2>
          <p>
            各単語の意味・ニュアンス・例文は、TOEIC のビジネス文脈に限定したプロンプト設計のもとで下書きを作成し、運営者が掲載前後に内容を目視で確認しています。気になった箇所は適宜修正し、品質を維持するように運用しています。
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              TOEIC のビジネス文脈に限定した下書き生成（一般会話の例文を排除）
            </li>
            <li>
              必須フィールド・例文数・形式の整合性を自動チェック
            </li>
            <li>
              運営者が単語ページを実際に閲覧して内容を目視確認し、不自然な訳語・例文・コロケーションを発見次第修正
            </li>
            <li>
              閲覧者から誤りの指摘を受けた場合は、該当単語のキャッシュをクリアし、解説を再作成・再確認
            </li>
            <li>
              修正の経緯は GitHub のコミット履歴に記録し、変更内容を追跡可能な形で管理
            </li>
          </ol>
          <p className="mt-3">
            なお、本サービスは個人運営のため、全 1,300 語以上のレビューには時間を要します。誤りや不自然な表現を見つけた場合は{" "}
            <Link
              href="/contact"
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              お問い合わせ
            </Link>
            よりご報告いただけると、優先的に修正します。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">運営者情報</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>運営者</strong>
              {"：Rain（個人開発者）"}
            </li>
            <li>
              <strong>連絡先</strong>
              {"："}
              <Link
                href="/contact"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                お問い合わせページ
              </Link>
            </li>
            <li>
              <strong>サイト開設</strong>
              {"：2026 年 3 月"}
            </li>
            <li>
              <strong>最終更新</strong>
              {"：2026 年 7 月（コンテンツ・機能ともに継続的に更新中）"}
            </li>
            <li>
              <strong>収益化</strong>
              {"：Google AdSense 広告による無料運営"}
            </li>
            <li>
              <strong>ソースコード</strong>
              {"：GitHub にて一部公開（個人プロジェクト）"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">サイトの更新方針</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              新しい TOEIC 出題傾向に応じて、収録単語の追加・削除を随時実施
            </li>
            <li>
              AI 解説のプロンプトは、ユーザーからの指摘を受けて継続的に改善
            </li>
            <li>
              重複・誤分類は発見次第修正し、修正履歴を技術ドキュメントに記録
            </li>
            <li>
              学習ガイド記事は月 1〜2 本のペースで追加・更新
            </li>
            <li>
              サイト機能や技術スタックの変更も、すべて更新履歴に明記
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">注意事項・免責</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              「TOEIC」は Educational Testing Service（ETS）の登録商標です。当サイトは ETS との提携・推奨関係はありません。
            </li>
            <li>
              コンテンツは AI により生成されているため、誤りが含まれる可能性があります。学習の参考としてご活用ください。
            </li>
            <li>
              本サイトの利用により発生した損害について、運営者は責任を負いかねます。詳細は
              <Link
                href="/terms"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                利用規約
              </Link>
              をご確認ください。
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
