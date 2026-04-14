import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getImportantWords, getMediumWords, getHighWords } from "@/data/words";
import WordsListClient from "@/components/features/words/WordsListClient";
import { SnsShareButtons } from "@/components/features/sns/SnsShareButtons";
import TodayRecommendedWordsClient from "@/components/features/words/TodayRecommendedWordsClient";

export const metadata: Metadata = {
  title: {
    absolute: "TOEIC 重要単語【2026年最新】600点・730点・800点突破｜AI解説付き無料単語帳",
  },
  description:
    "【完全無料】TOEIC重要単語をAIが徹底解説！2026年最新の出題傾向（リモートワーク・オンライン会議など）を反映した頻出英単語帳です。目標スコア（600点・730点・800点）のレベル別に厳選した単語を収録し、最短でのスコアアップを強力にサポート。実践的なビジネス例文、類義語の使い分け、音声発音チェック機能も完備。スマホでいつでも効率的に学習し、今のTOEICに通用する英語力を身につけましょう。",
  keywords: ["TOEIC 重要単語", "TOEIC 単語帳", "TOEIC 頻出単語", "2026年", "最新", "無料", "アプリ", "600点", "730点", "800点"],
  alternates: {
    canonical: "https://www.toeic-words.com/",
  },
};

export default async function Home() {
  const importantWords = await getImportantWords();
  const mediumWords = await getMediumWords();
  const highWords = await getHighWords();

  // WebSite構造化データ
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TOEIC重要単語",
    description: "【完全無料】TOEIC重要単語をAIが徹底解説！2026年最新の出題傾向（リモートワーク・オンライン会議など）を反映した頻出英単語帳です。目標スコア（600点・730点・800点）のレベル別に厳選した単語を収録し、最短でのスコアアップを強力にサポート。実践的なビジネス例文、類義語の使い分け、音声発音チェック機能も完備。スマホでいつでも効率的に学習し、今のTOEICに通用する英語力を身につけましょう。",
    alternateName: ["TOEIC重要単語", "TOEIC Words", "TOEIC単語帳"],
    url: "https://www.toeic-words.com/",
    inLanguage: "ja-JP",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.toeic-words.com/words/{search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  // BreadcrumbList構造化データ
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: "https://www.toeic-words.com/",
      },
    ],
  };

  // EducationalOrganization構造化データ
  const educationalJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "TOEIC重要単語",
    description: "TOEIC L&Rテスト対策のための無料オンライン単語学習サービス",
    url: "https://www.toeic-words.com/",
    educationalCredentialAwarded: "TOEIC L&R スコアアップ",
  };

  const totalCount = importantWords.length + mediumWords.length + highWords.length;

  // FAQPage構造化データ
  const faqEntries = [
    {
      name: "2026年最新のTOEIC重要単語と出題傾向は？",
      text: "近年のTOEIC L&Rテストでは、ビジネス環境の変化に伴い「リモートワーク」「オンライン会議」「チャットツール」に関連する語彙の出題頻度が増加しています。また、従来のオフィスワークだけでなく、ハイブリッドワークや柔軟な働き方を示唆する文脈も増えています。"
    },
    {
      name: "TOEIC重要単語の効率的な覚え方は？",
      text: "単に英単語と日本語訳を丸暗記するのではなく、実際の例文の中でどのように使われるかを理解することが重要です。コロケーション（語の組み合わせ）を意識し、類義語との違いを理解し、音声とセットで覚えることが効果的です。"
    },
    {
      name: "目標スコア別のTOEIC重要単語の選び方は？",
      text: "現在のスコアや目標に応じて、優先して覚えるべき重要単語は異なります。まずは基礎となる「最重要単語」から始め、基礎を固めた上で「中級単語」へとステップアップすることをおすすめします。600点を目指す方は最重要単語を、それ以上を目指す方はより難しい単語を学習しましょう。"
    },
    {
      name: "TOEIC重要単語は全部で何語覚えればいいですか？",
      text: `当サイトでは合計${totalCount}語のTOEIC頻出単語を収録しています。内訳は最重要単語${importantWords.length}語（600点レベル）、中級単語${mediumWords.length}語（730〜800点レベル）、高難易度単語${highWords.length}語（800点以上レベル）です。目標スコアに合わせて、まずは最重要単語から取り組みましょう。`
    },
    {
      name: "TOEIC単語学習は毎日何語ずつ進めればいい？",
      text: "1日10〜20語を目安にするのが効果的です。新しい単語を覚えるだけでなく、前日・3日前・1週間前に学習した単語の復習も組み合わせましょう。「今日のおすすめ5単語」機能を活用すれば、スキマ時間にも無理なく毎日の学習習慣を続けられます。"
    },
    {
      name: "TOEICで最も頻出する品詞は何ですか？",
      text: "TOEICでは特に動詞と名詞が重要です。Part 5（短文穴埋め）では品詞問題が頻出し、語形変化（例: implement / implementation / implemented）の理解が問われます。各単語ページでは語形変化も掲載しているので、動詞・名詞・形容詞・副詞の形をセットで覚えましょう。"
    },
    {
      name: "TOEICの単語学習はいつから始めるべき？",
      text: "試験日の2〜3ヶ月前から本格的に取り組むのが理想です。ただし、日常的に英単語に触れる習慣をつけることが最も効果的です。通勤・通学時間などのスキマ時間を活用し、当サイトの「学習モード」や「今日のおすすめ単語」で毎日少しずつ進めましょう。"
    },
    {
      name: "TOEIC単語帳アプリと当サイトの違いは？",
      text: "当サイトはインストール不要でブラウザからすぐに使える完全無料のTOEIC単語学習サービスです。最大の特徴はAIによる詳細な単語解説です。単なる日本語訳だけでなく、語源・ニュアンス・コロケーション・TOEIC実践例文まで網羅しており、深い理解に基づく暗記をサポートします。"
    },
    {
      name: "TOEIC 600点に必要な単語力は？",
      text: `TOEIC 600点を目指すなら、まずは当サイトの最重要単語${importantWords.length}語を確実にマスターしましょう。これらはTOEIC全体で最も出現頻度が高い基礎単語です。リーディング・リスニング両方のパートで繰り返し登場するため、この層の単語を押さえるだけで大幅なスコアアップが期待できます。`
    },
    {
      name: "TOEIC 800点以上を目指すには？",
      text: `800点以上を目指す場合、最重要単語に加えて中級単語${mediumWords.length}語と高難易度単語${highWords.length}語もカバーする必要があります。特にPart 7の長文読解では、文脈から意味を推測する力が問われるため、単語の複数の意味や使い分けを理解することが重要です。当サイトのAI解説で各単語のニュアンスを深く学びましょう。`
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqEntries.map(entry => ({
      "@type": "Question",
      "name": entry.name,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": entry.text,
      }
    })),
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f9fafb_45%,#ffffff_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <Script
        id="ldjson-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Script
        id="ldjson-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="ldjson-educational"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalJsonLd) }}
      />
      <Script
        id="ldjson-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="w-full max-w-[960px] flex flex-col gap-5 relative">
        <div className="mb-[-8px] sm:mb-0 flex justify-end">
          <SnsShareButtons
            url="https://www.toeic-words.com/"
            title="【2026年最新】TOEIC 重要単語 | 頻出単語を効率よく学習"
          />
        </div>
        <header className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex flex-col gap-3 sm:max-w-[60%]">
            <p className="text-xs tracking-[0.12em] uppercase text-slate-500">LEVEL UP YOUR SCORE</p>
            <h1 className="text-[22px] leading-[1.3] text-slate-900 font-bold sm:text-[26px] lg:text-[28px]">【2026年最新】TOEIC 重要単語</h1>
            <p className="text-sm leading-[1.6] text-gray-500">
              頻出単語を効率よく学習して、スコアアップを目指しましょう。
            </p>
          </div>
          <div className="flex gap-4 items-center mt-2 flex-wrap justify-end sm:justify-start">
            <Link href="/study" className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg font-bold text-sm tracking-wide no-underline transition-all duration-200 hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
              <span className="inline-flex items-center">学習モード</span>
            </Link>
            <Link href="/favorites" className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] bg-amber-50 text-amber-700 border-2 border-amber-500 rounded-lg font-bold text-sm tracking-wide no-underline transition-all duration-200 hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500">
              <span className="inline-flex items-center">お気に入り</span>
            </Link>
          </div>
        </header>
        <Suspense fallback={<section className="bg-white/90 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse h-[180px]" />}>
          <TodayRecommendedWordsClient words={[...importantWords, ...mediumWords, ...highWords]} variant="preview" />
        </Suspense>
        <WordsListClient importantWords={importantWords} mediumWords={mediumWords} highWords={highWords} />

        {/* 統計・数値セクション */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-800">{totalCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">収録単語数</div>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-700">{importantWords.length}</div>
            <div className="text-xs text-blue-600 mt-0.5">最重要（600点）</div>
          </div>
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-700">{mediumWords.length}</div>
            <div className="text-xs text-purple-600 mt-0.5">中級（730〜800点）</div>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-red-700">{highWords.length}</div>
            <div className="text-xs text-red-600 mt-0.5">上級（800点以上）</div>
          </div>
        </section>

        <div className="flex justify-center">
          <Link href="/words" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg font-semibold text-sm hover:bg-slate-900 transition-colors no-underline">
            全単語一覧 →
          </Link>
        </div>
        {/* FAQ セクション */}
        <section className="mt-12 pt-12 border-t border-slate-200 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-800">TOEIC重要単語 よくある質問</h2>
          <div className="flex flex-col gap-4">
            {faqEntries.map((entry, i) => (
              <details key={i} className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                  <span>{entry.name}</span>
                  <span className="text-slate-400 transition-transform duration-200 group-open:rotate-180 shrink-0">▼</span>
                </summary>
                <div className="px-5 pb-4 pt-0">
                  <p className="text-sm leading-[1.8] text-slate-600">{entry.text}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
        {/* TOEIC最新単語 説明セクション */}
        <section className="mt-12 pt-12 border-t border-slate-200 flex flex-col gap-8">
          <article className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 mb-2">2026年のTOEIC頻出語を、今のビジネス英語で効率よく。</h2>
            <p className="text-[15px] leading-[1.8] text-slate-600">
              近年のTOEIC L&Rテストでは、リモートワーク、オンライン会議、チャットツール、AIなど、
              現代のビジネス環境を反映した語彙や表現がますます重要になっています。
            </p>
            <p className="text-[15px] leading-[1.8] text-slate-600">
              本サイトの「TOEIC重要単語」リストでは、そうした最新の出題傾向を踏まえた頻出語彙を厳選。
              例えば、<Link href="/words/accommodate" className="text-blue-600 font-bold hover:underline">accommodate</Link>（対応する）や<Link href="/words/negotiate" className="text-blue-600 font-bold hover:underline">negotiate</Link>（交渉する）、
              <Link href="/words/implement" className="text-blue-600 font-bold hover:underline">implement</Link>（実施する）など、スコアアップに直結する重要語を、
              実践的な例文とともにわかりやすく学べます。
              古い単語帳だけでは補いにくい、今のTOEICに合ったビジネス英語を、このサイトで効率よく身につけましょう。
            </p>
          </article>

          <article className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 mb-2">TOEIC重要単語の効率的な覚え方</h2>
            <p className="text-[15px] leading-[1.8] text-slate-600">
              TOEICスコアアップの鍵は、試験に出る「TOEIC重要単語」を確実にマスターすることです。
              単に英単語と日本語訳を丸暗記するのではなく、実際の例文の中でどのように使われるかを理解することが重要です。
              本サイトでは、AIを活用して各単語の詳細な意味の解説、語形変化、類義語、ニュアンス、そして例文を提供しています。
            </p>
            <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
              <li className="text-[15px] leading-[1.6] text-slate-600">
                <strong>コロケーション（語の組み合わせ）を意識する：</strong> 重要単語は単独ではなく、他の語とセットで使われることが多いです。例文を通じて自然なつながりを学びましょう。
              </li>
              <li className="text-[15px] leading-[1.6] text-slate-600">
                <strong>類義語との違いを理解する：</strong> 似た意味の単語の使い分けが問われることがあります。微妙なニュアンスの違いを押さえましょう。
              </li>
              <li className="text-[15px] leading-[1.6] text-slate-600">
                <strong>音声とセットで覚える：</strong> リスニング対策も兼ねて、正しい発音とアクセントを確認しながら学習を進めることが効果的です。
              </li>
            </ul>
          </article>

          <article className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 mb-2">目標スコア別 TOEIC重要単語の選び方</h2>
            <p className="text-[15px] leading-[1.8] text-slate-600">
              現在のスコアや目標に応じて、優先して覚えるべき重要単語は異なります。
              まずは基礎となる「最重要単語」から始め、基礎を固めた上で「中級単語」へとステップアップすることをおすすめします。
            </p>
            <p className="text-[15px] leading-[1.8] text-slate-600">
              TOEIC 600点を目指す方は、頻繁に使われる基本的な最重要単語を確実に抑えましょう。
              600点以上を目指す方は、より難しい単語をAIの解説を活用して、理解を深めながら覚えましょう。
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
