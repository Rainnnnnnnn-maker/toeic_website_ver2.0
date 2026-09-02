import type { Metadata } from "next";
import Link from "next/link";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";

export const metadata: Metadata = {
  title: "当サイトについて｜運営方針・単語選定基準・更新ポリシー",
  description:
    "TOEIC 重要単語は、TOEIC学習向け英単語1,300語以上を確認できる無料サービスです。運営者、独自のランク、AI解説の生成・確認方法、更新方針を説明します。",
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
            「TOEIC重要単語」は、TOEIC L&amp;R の学習に使う英単語を効率的に確認できる無料の Web サービスです。1,300 語以上を「important（基礎）／ mid（中級）／ high（上級）」の 3 段階に分類し、各単語にビジネス場面を想定した意味・ニュアンス解説、例文、発音音声を提供しています。3 段階の分類は学習順を決めるための当サイト独自の目安で、IIBC・ETS 公式の頻度・スコア分類ではありません。
          </p>
          <p className="mt-2">
            単語閲覧・検索・お気に入りの登録と一覧・学習モードは、会員登録なしで無料で利用できます。未ログインのお気に入りはブラウザのローカルストレージに保存され、サーバーには送信されません。Google ログインを利用すると、お気に入りと復習・連続学習の記録がサーバーに保存され、複数端末同期とマイページの復習スケジュールに加えて、お気に入り単語の復習モードと聞き流しを利用できます。
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
              {"：学習範囲を選ぶため、600・730〜800・800 点以上を目安に 3 段階へ分類した収録語"}
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
              {"：お気に入り登録した単語のみを集中的に復習（ログインが必要）"}
            </li>
            <li>
              <strong>今日のおすすめ {TODAY_WORDS_COUNT} 単語</strong>
              {`：日付固定ロジックで、その日の ${TODAY_WORDS_COUNT} 語をおすすめ`}
            </li>
            <li>
              <strong>聞き流しモード</strong>
              {`：今日の ${TODAY_WORDS_COUNT} 単語を「単語 → 英文例 → 日本語訳」の順に自動再生（お気に入り単語の聞き流しはログインが必要）`}
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
            収録語と 3 段階のランクは、学習時の優先順位を付けるために運営者が整理したものです。IIBC・ETS が公表する公式の頻度表やスコア別語彙表ではなく、特定教材の出現回数を再現したデータでもありません。
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>important：最初に意味を確認したい基礎語</li>
            <li>mid：基礎語の次に学ぶ中級語・派生語</li>
            <li>high：専門的な場面や細かなニュアンスまで広げる上級語</li>
            <li>実際の模試で間違えた語は、ランクにかかわらず優先</li>
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
            各単語の意味・ニュアンス・例文は Google Gemini を使って生成しています。形式の自動整合性チェックを行い、運営者が確認できた箇所や報告を受けた箇所から修正しています。全ページの人手確認が完了しているわけではありません。
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              TOEIC のビジネス文脈に限定した下書き生成（一般会話の例文を排除）
            </li>
            <li>
              必須フィールド・例文数・形式の整合性を自動チェック
            </li>
            <li>
              優先度の高いページや指摘を受けたページを運営者が確認し、不自然な訳語・例文・コロケーションを修正
            </li>
            <li>
              閲覧者から誤りの指摘を受けた場合は、該当単語のキャッシュをクリアし、解説を再作成・再確認
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

        <section id="operator">
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
              {"：2026 年 8 月（コンテンツ・機能ともに継続的に更新中）"}
            </li>
            <li>
              <strong>収益化</strong>
              {"：広告掲載を準備中（単語詳細ページには広告を掲載しない方針）"}
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
              収録漏れや学習上の必要性を確認し、単語の追加・削除を随時実施
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
