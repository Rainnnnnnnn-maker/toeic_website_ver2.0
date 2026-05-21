import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

const SITE_URL = "https://www.toeic-words.com";
const PAGE_PATH = "/guide/toeic-424-425";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "TOEIC 第424回・第425回はいつ？日程・申込締切・直前対策まとめ",
  description:
    "TOEIC L&R 第424回・第425回を受験予定の方向けに、2026年7月12日実施回の公式日程、申込締切、結果発表予定、ネット・YouTube情報の見方、直前1週間の学習ポイントをまとめました。",
  keywords: [
    "TOEIC 424回",
    "TOEIC 425回",
    "TOEIC 第424回",
    "TOEIC 第425回",
    "TOEIC 2026年7月12日",
    "TOEIC 日程",
    "TOEIC 直前対策",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "TOEIC 第424回・第425回はいつ？日程・申込締切・直前対策まとめ",
    description:
      "TOEIC L&R 第424回・第425回を受験予定の方向けに、公式日程、申込締切、ネット・YouTube情報の見方、直前対策を整理しました。",
    url: PAGE_URL,
    type: "article",
    publishedTime: "2026-05-21",
    modifiedTime: "2026-05-21",
  },
};

const summaryRows = [
  ["実施日", "2026年7月12日（日）"],
  ["実施形式", "1日2回実施（午前・午後）"],
  ["受付時間", "午前 9:25〜9:55／午後 14:05〜14:35"],
  ["申込受付期間", "2026年5月7日（木）10:00〜2026年6月3日（水）15:00"],
  ["デジタル公式認定証", "2026年7月30日（木）発行予定"],
];

const prepWords = [
  "schedule",
  "deadline",
  "confirm",
  "available",
  "appointment",
  "reservation",
  "submit",
  "approve",
  "estimate",
  "invoice",
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-20">
      <h2 className="border-b border-black/10 pb-2 text-xl font-bold dark:border-white/10">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-slate-700 dark:text-slate-200">
        {children}
      </div>
    </section>
  );
}

export default function Toeic424425GuidePage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "TOP", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "学習ガイド",
        item: `${SITE_URL}/guide`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "TOEIC 第424回・第425回 日程と直前対策",
        item: PAGE_URL,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "TOEIC 第424回・第425回はいつ？日程・申込締切・直前対策まとめ",
    description:
      "TOEIC L&R 第424回・第425回を受験予定の方向けに、2026年7月12日実施回の公式日程、申込締切、結果発表予定、ネット・YouTube情報の見方、直前1週間の学習ポイントをまとめました。",
    datePublished: "2026-05-21",
    dateModified: "2026-05-21",
    inLanguage: "ja-JP",
    mainEntityOfPage: PAGE_URL,
    author: {
      "@type": "Organization",
      name: "TOEIC重要単語",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "TOEIC重要単語",
      url: SITE_URL,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "TOEIC 第424回・第425回はいつ実施されますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "IIBC公式の年間テスト日程では、2026年7月12日（日）にTOEIC L&R公開テストが1日2回実施されます。本記事では、この午前・午後実施回を第424回・第425回として受験前情報を整理しています。",
        },
      },
      {
        "@type": "Question",
        name: "第424回・第425回の難易度や感想はどこで確認できますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "試験実施後に、X、ブログ、YouTubeの受験報告でPart別の体感難易度が出てくることがあります。ただし個人の体感差が大きいため、複数の情報を比較し、公式情報と混同しないことが重要です。",
        },
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-slate-900 dark:text-slate-50 sm:px-6 lg:px-8">
      <Script
        id="ldjson-breadcrumb-toeic-424-425"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="ldjson-article-toeic-424-425"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="ldjson-faq-toeic-424-425"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-blue-600">
          TOP
        </Link>
        <span className="mx-2">/</span>
        <Link href="/guide" className="hover:text-blue-600">
          学習ガイド
        </Link>
        <span className="mx-2">/</span>
        <span>TOEIC 第424回・第425回</span>
      </nav>

      <article>
        <header className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.14em] text-blue-600 dark:text-blue-400">
            TOEIC L&R 公開テスト情報
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            TOEIC 第424回・第425回はいつ？日程・申込締切・直前対策まとめ
          </h1>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
            この記事では、TOEIC Listening & Reading公開テストの第424回・第425回を受験予定の方向けに、公式日程、申込締切、結果発表予定、ネット・YouTube情報の見方、直前期の学習ポイントを整理します。
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
            公式日程ページには回数番号が明記されていない場合があります。本記事では、2026年7月12日（日）の午前・午後実施回を第424回・第425回として扱います。受験票や申込画面で表示される正式な回数・会場・集合時間を必ず確認してください。
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            公開日：2026年5月21日 ／ 最終更新：2026年5月21日 ／ 読了目安：7分
          </p>
        </header>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-bold">この記事の要点</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <li>2026年7月12日（日）のTOEIC L&R公開テストは1日2回実施予定です。</li>
            <li>申込締切は2026年6月3日（水）15:00です。</li>
            <li>デジタル公式認定証は2026年7月30日（木）発行予定です。</li>
            <li>試験前は、難易度予想よりもPart 5の語形変化・Part 7の時間配分・頻出ビジネス語彙の復習を優先しましょう。</li>
          </ul>
        </div>

        <Section id="schedule" title="第424回・第425回の日程まとめ">
          <p>
            IIBC公式の年間テスト日程では、2026年7月12日（日）にTOEIC Listening & Reading Testが1日2回実施される予定です。午前・午後で受付時間が異なるため、受験票を確認したうえで余裕を持って会場へ向かいましょう。
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
            <table className="min-w-full border-collapse text-sm">
              <tbody>
                {summaryRows.map(([label, value]) => (
                  <tr key={label} className="border-b border-slate-200 last:border-b-0 dark:border-white/10">
                    <th className="w-40 bg-slate-50 px-3 py-3 text-left font-semibold dark:bg-white/10">
                      {label}
                    </th>
                    <td className="px-3 py-3">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            参考：
            <a
              href="https://www.iibc-global.org/toeic/test/lr/guide01/schedule.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              IIBC公式 年間テスト日程
            </a>
          </p>
        </Section>

        <Section id="internet-youtube" title="ネット・YouTube情報の見方：実施前と実施後で分ける">
          <p>
            TOEICの各回に関するネット情報は、試験前と試験後で価値が大きく変わります。試験前に確認できるのは、日程・申込締切・持ち物・当日の流れなどの公式情報が中心です。一方、難易度・フォーム差・Part別の感想は、実施後に受験者の体感として出てくる情報です。
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <h3 className="font-bold">実施前に見るべき情報</h3>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                <li>公式の日程・受付時間・申込締切</li>
                <li>受験票、本人確認書類、写真、筆記用具</li>
                <li>TOEIC公式YouTubeや公式コンテンツの学習動画</li>
                <li>直近の公開テスト感想から見える時間配分の注意点</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <h3 className="font-bold">実施後に確認すべき情報</h3>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                <li>午前・午後それぞれの体感難易度</li>
                <li>Part 1の写真描写、Part 2の変化球応答</li>
                <li>Part 5の品詞・語彙問題の傾向</li>
                <li>Part 7の文書量、ダブル・トリプルパッセージの重さ</li>
              </ul>
            </div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-100">
            YouTubeの「難しかった」「簡単だった」という感想は参考になりますが、スコア帯・得意Part・受験した時間帯によって印象が変わります。1本の動画だけで判断せず、複数の発信を比較し、最後は自分の弱点対策に落とし込むのが安全です。
          </div>
        </Section>

        <Section id="difficulty" title="第424回・第425回の難易度はどう見るべきか">
          <p>
            TOEICは同じ実施日でも午前・午後でフォームが異なることがあります。そのため「第424回は簡単」「第425回は難しい」のような情報が出たとしても、単純比較は危険です。見るべきポイントは、総合的な難易度ではなく、どのPartで失点しやすかったかです。
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/10">
                  <th className="px-3 py-2 text-left">Part</th>
                  <th className="px-3 py-2 text-left">実施後に見る観点</th>
                  <th className="px-3 py-2 text-left">事前対策</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <td className="px-3 py-3 font-semibold">Part 1・2</td>
                  <td className="px-3 py-3">写真描写の語彙、間接応答、否定疑問文</td>
                  <td className="px-3 py-3">短い英文を音で即理解する練習</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <td className="px-3 py-3 font-semibold">Part 3・4</td>
                  <td className="px-3 py-3">会話の場面転換、図表問題、意図問題</td>
                  <td className="px-3 py-3">設問先読みと選択肢のキーワード化</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <td className="px-3 py-3 font-semibold">Part 5・6</td>
                  <td className="px-3 py-3">品詞、接続詞、語彙、文挿入</td>
                  <td className="px-3 py-3">語形変化とコロケーション復習</td>
                </tr>
                <tr>
                  <td className="px-3 py-3 font-semibold">Part 7</td>
                  <td className="px-3 py-3">文書量、NOT問題、同義語問題、根拠探し</td>
                  <td className="px-3 py-3">時間配分と拾い読みの訓練</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="one-week-plan" title="直前1週間の対策：新しいことより既習事項の回収">
          <p>
            直前期は、新しい教材を増やすよりも、すでに学習した単語・文法・解法を本番で思い出せる状態に戻す方が効果的です。特に第424回・第425回を7月12日に受ける場合、6月下旬から7月上旬は以下の順序で仕上げましょう。
          </p>
          <ol className="list-inside list-decimal space-y-2 rounded-xl border border-slate-200 p-4 text-sm dark:border-white/10">
            <li>7日前：公式問題集または模試を1回分解き、Part別の弱点を確認する。</li>
            <li>6〜4日前：Part 5の語形変化、頻出動詞、前置詞表現を復習する。</li>
            <li>3〜2日前：Part 7を時間制限付きで解き、最後まで解き切る感覚を戻す。</li>
            <li>前日：新しい問題は増やさず、間違えた単語・表現だけ軽く確認する。</li>
            <li>当日朝：リスニング音源を短時間聞き、耳を英語モードにしておく。</li>
          </ol>
          <p>
            スコアを伸ばす最後の鍵は、難問対策ではなく「落としてはいけない問題」を落とさないことです。Part 5の基本品詞問題、Part 2の定番応答、Part 7の根拠が明確な問題を安定して取れる状態にしましょう。
          </p>
        </Section>

        <Section id="vocabulary" title="424回・425回前に確認したい頻出単語">
          <p>
            直前期は、TOEICらしいビジネス文脈で出る単語を優先して復習します。以下の単語は、日程・会議・申込・請求・承認など、公開テストでも頻出するテーマに関連します。
          </p>
          <div className="flex flex-wrap gap-2">
            {prepWords.map((word) => (
              <Link
                key={word}
                href={`/words/${word}`}
                className="rounded-full border border-slate-300 px-3 py-1.5 font-mono text-sm hover:border-blue-500 hover:text-blue-600 dark:border-white/20 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                {word}
              </Link>
            ))}
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
            単語は日本語訳だけでなく、例文・音声・類義語の違いまで確認すると、本番のリスニングとリーディングの両方で使える知識になります。
          </div>
        </Section>

        <Section id="after-test" title="試験後に追記・確認したいポイント">
          <p>
            第424回・第425回の実施後は、以下の観点で情報を整理すると、次回受験や復習に役立ちます。単なる「難しかった／簡単だった」ではなく、失点要因をPart別に分解しましょう。
          </p>
          <ul className="list-inside list-disc space-y-2 rounded-xl border border-slate-200 p-4 text-sm dark:border-white/10">
            <li>午前・午後のどちらを受験したか</li>
            <li>Listeningで聞き取りにくかった国籍・スピード・設問タイプ</li>
            <li>Readingで時間が足りなくなったPartと残り問題数</li>
            <li>Part 5で迷った品詞問題・語彙問題</li>
            <li>Part 7で根拠を見つけにくかった文書タイプ</li>
          </ul>
          <p>
            受験直後の記憶が新しいうちにメモを残すと、結果発表後に「なぜそのスコアだったのか」を分析しやすくなります。次回の学習計画も、感覚ではなく実際の失点要因から組み立てましょう。
          </p>
        </Section>

        <Section id="summary" title="まとめ">
          <p>
            第424回・第425回を受験する場合、まず確認すべきなのは公式日程、申込締切、受験票、受付時間です。ネットやYouTubeの情報は便利ですが、試験前は公式情報と学習法、試験後は受験者の体感難易度とPart別の傾向というように、目的を分けて使うのが重要です。
          </p>
          <p>
            直前期は、難易度予想に振り回されず、頻出単語、Part 5の語形変化、Part 7の時間配分、リスニングの先読みを重点的に仕上げましょう。基礎を取りこぼさないことが、最も現実的なスコアアップにつながります。
          </p>
        </Section>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-bold">関連する学習ガイド</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/guide/last-week-plan"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 dark:border-white/10 dark:bg-white/5"
            >
              <p className="font-semibold">TOEIC 直前1週間で50点伸ばす単語復習プラン</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">試験7日前から当日までの復習手順を確認できます。</p>
            </Link>
            <Link
              href="/guide/part5-frequent-words"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 dark:border-white/10 dark:bg-white/5"
            >
              <p className="font-semibold">TOEIC Part 5 頻出語彙と語形変化問題の攻略法</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">品詞問題・語彙問題の直前確認に使えます。</p>
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
