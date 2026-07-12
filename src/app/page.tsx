import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { Suspense, cache } from "react";
import { BookOpen, Star, List } from "lucide-react";
import { getImportantWords, getMediumWords, getHighWords, getTodayRecommendedWords } from "@/data/words";
import WordsListClient from "@/components/features/words/WordsListClient";
import { SnsShareButtons } from "@/components/features/sns/SnsShareButtons";
import { AuthStatus } from "@/components/features/auth/AuthStatus";
import TodayRecommendedWordsClient from "@/components/features/words/TodayRecommendedWordsClient";
import { getLatestGuideArticles } from "@/data/guide-articles";

export const metadata: Metadata = {
  title: {
    absolute: "TOEIC 重要単語【2026年最新】600点・730点・800点突破｜詳しい解説付き無料単語帳",
  },
  description:
    "【完全無料】TOEIC重要単語をビジネス文脈に絞って徹底解説。2026年最新の出題傾向（リモートワーク・オンライン会議など）を反映した頻出英単語1,300語以上と、学習ガイド記事12本以上を収録。目標スコア（600点・730点・800点）のレベル別に厳選した単語、ビジネス例文、類義語の使い分け、音声発音チェック機能も完備。スマホでいつでも効率的に学習し、今のTOEICに通用する英語力を身につけましょう。",
  keywords: ["TOEIC 重要単語", "TOEIC 単語帳", "TOEIC 頻出単語", "2026年", "最新", "無料", "アプリ", "600点", "730点", "800点"],
  alternates: {
    canonical: "https://www.toeic-words.com/",
  },
};

async function TodayRecommendedWordsSection() {
  const todayWords = await getTodayRecommendedWords();
  return <TodayRecommendedWordsClient words={todayWords} variant="preview" />;
}

const getHomeWordData = cache(async () => {
  const [importantWords, mediumWords, highWords] = await Promise.all([
    getImportantWords(),
    getMediumWords(),
    getHighWords(),
  ]);
  const totalCount = importantWords.length + mediumWords.length + highWords.length;

  return { importantWords, mediumWords, highWords, totalCount };
});

function buildFaqEntries({
  importantWords,
  mediumWords,
  highWords,
  totalCount,
}: Awaited<ReturnType<typeof getHomeWordData>>) {
  return [
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
      text: "当サイトはインストール不要でブラウザからすぐに使える完全無料のTOEIC単語学習サービスです。最大の特徴はビジネス文脈に絞った詳細な単語解説で、単なる日本語訳だけでなく、語源・ニュアンス・コロケーション・TOEIC実践例文まで網羅しており、深い理解に基づく暗記をサポートします。さらに、12本以上の学習ガイド記事でスコア別戦略・Part別対策まで体系的に学べます。"
    },
    {
      name: "TOEIC 600点に必要な単語力は？",
      text: `TOEIC 600点を目指すなら、まずは当サイトの最重要単語${importantWords.length}語を確実にマスターしましょう。これらはTOEIC全体で最も出現頻度が高い基礎単語です。リーディング・リスニング両方のパートで繰り返し登場するため、この層の単語を押さえるだけで大幅なスコアアップが期待できます。`
    },
    {
      name: "TOEIC 800点以上を目指すには？",
      text: `800点以上を目指す場合、最重要単語に加えて中級単語${mediumWords.length}語と高難易度単語${highWords.length}語もカバーする必要があります。特にPart 7の長文読解では、文脈から意味を推測する力が問われるため、単語の複数の意味や使い分けを理解することが重要です。当サイトの解説で各単語のニュアンスを深く学びましょう。`
    },
  ];
}

function TodayRecommendedWordsFallback() {
  return (
    <section className="bg-white/90 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse min-h-[208px] sm:min-h-[118px]" />
  );
}

function HomeWordDataFallback() {
  return (
    <>
      <section className="bg-white/90 border border-slate-200 rounded-xl p-4 shadow-sm animate-pulse min-h-[420px]">
        <div className="h-5 w-36 rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className="h-8 rounded-md bg-slate-100" />
          ))}
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[86px] rounded-xl border border-slate-200 bg-white" />
        ))}
      </section>
    </>
  );
}

async function HomeWordDataSection() {
  const { importantWords, mediumWords, highWords, totalCount } = await getHomeWordData();

  return (
    <>
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
        <Link href="/words" prefetch={false} className="group relative inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-800 text-white rounded-lg font-bold text-sm shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] overflow-hidden transition-all duration-300 hover:bg-slate-700 hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-800 no-underline">
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
            <div className="relative h-full w-8 bg-white/10" />
          </div>
          <List size={16} className="transition-transform group-hover:scale-110" />
          <span className="relative z-10">全単語一覧</span>
          <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </>
  );
}

function FaqFallback() {
  return (
    <section className="mt-12 pt-12 border-t border-slate-200 flex flex-col gap-6 animate-pulse">
      <div className="h-6 w-56 rounded bg-slate-200" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-[54px] rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
    </section>
  );
}

async function FaqSection() {
  const faqEntries = buildFaqEntries(await getHomeWordData());
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map(entry => ({
      "@type": "Question",
      name: entry.name,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.text,
      }
    })),
  };

  return (
    <>
      <Script
        id="ldjson-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
    </>
  );
}

export default function Home() {
  const latestGuideArticles = getLatestGuideArticles(6);

  // WebSite構造化データ
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TOEIC重要単語",
    description: "【完全無料】TOEIC重要単語をビジネス文脈に絞って徹底解説。2026年最新の出題傾向（リモートワーク・オンライン会議など）を反映した頻出英単語1,300語以上と、学習ガイド記事12本以上を収録。目標スコア（600点・730点・800点）のレベル別に厳選した単語、ビジネス例文、類義語の使い分け、音声発音チェック機能も完備。スマホでいつでも効率的に学習し、今のTOEICに通用する英語力を身につけましょう。",
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
      <main className="w-full max-w-[960px] flex flex-col gap-5 relative">
        <div className="mb-[-8px] sm:mb-0 flex items-center justify-between gap-4">
          <AuthStatus />
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
            <Link href="/study" prefetch={false} className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              <BookOpen size={16} className="transition-transform group-hover:scale-110" />
              <span className="relative z-10">学習モード</span>
            </Link>
            <Link href="/favorites" prefetch={false} className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-lg font-bold text-sm shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500">
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              <Star size={16} className="transition-transform group-hover:rotate-12 group-hover:scale-110" />
              <span className="relative z-10">お気に入り</span>
            </Link>
          </div>
        </header>
        <Suspense fallback={<TodayRecommendedWordsFallback />}>
          <TodayRecommendedWordsSection />
        </Suspense>
        <Suspense fallback={<HomeWordDataFallback />}>
          <HomeWordDataSection />
        </Suspense>

        {/* --- 新規追加: サイトの独自性・権威性アピールセクション --- */}
        <section className="mt-12 pt-12 border-t border-slate-200 flex flex-col gap-12">
          {/* 選ばれる3つの理由 */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">このサイトが選ばれる3つの理由</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold mb-2">1</div>
                <h3 className="text-lg font-bold text-slate-800">ビジネス文脈に絞った詳しい解説</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  単なる日本語訳だけでなく、語源、微妙なニュアンスの違い、ビジネスシーンでの具体的な使われ方まで踏み込んで解説。丸暗記に頼らない「生きた英語」が身につきます。
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold mb-2">2</div>
                <h3 className="text-lg font-bold text-slate-800">忘却曲線を意識した復習</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  「学習モード」と「復習モード」を使い分けることで、記憶への定着率を最大化。さらに「今日のおすすめ5単語」機能で、スキマ時間での毎日の継続をサポートします。
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl font-bold mb-2">3</div>
                <h3 className="text-lg font-bold text-slate-800">完全無料・登録不要</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  アプリのインストールや面倒な会員登録は一切不要。PCでもスマホでも、ブラウザを開くだけで1,300語以上のTOEIC頻出単語をすべて無料で学習できます。複数端末でお気に入りを同期したい方向けに、任意のログイン機能も用意しています。
                </p>
              </div>
            </div>
          </div>

          {/* 使い方ガイド */}
          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-blue-600">💡</span> 効果的な使い方ガイド（おすすめルーティン）
            </h2>
            <ol className="flex flex-col gap-4">
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                <div>
                  <p className="font-bold text-slate-800">朝のスキマ時間：今日のおすすめ5単語をチェック</p>
                  <p className="text-sm text-slate-600 mt-1">トップページに表示される5単語を通勤・通学中に確認し、英語脳にスイッチを入れます。</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                <div>
                  <p className="font-bold text-slate-800">まとまった時間：学習モードで新規単語をインプット</p>
                  <p className="text-sm text-slate-600 mt-1">「学習モード」を使って、目標スコアの単語を1日10〜20語ペースで進めます。音声も必ず再生しましょう。</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                <div>
                  <p className="font-bold text-slate-800">週末や夜：お気に入り＆復習モードで知識を定着</p>
                  <p className="text-sm text-slate-600 mt-1">覚えにくい単語は「お気に入り」に登録し、週末に「復習モード」で一気に振り返ります。</p>
                </div>
              </li>
            </ol>
          </div>

          {/* 開発者・運営からのメッセージ */}
          <div className="flex flex-col gap-4 border-l-4 border-blue-600 pl-5 py-2">
            <h2 className="text-lg font-bold text-slate-800">開発チームからのメッセージ</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              「市販の単語帳は持ち歩くのが重い」「アプリは有料のものが多い」——そんなTOEIC学習者の声から、このサイトは生まれました。誰もが質の高い英語学習環境に無料でアクセスできるべきだと考えています。従来の辞書にはない「生きたビジネス英語のニュアンス」を、運営者の手で確認しながら提供し、皆さまのスコアアップ、そしてその先のキャリアアップをサポートします。
            </p>
          </div>
        </section>

        {/* 学習ガイド最新記事セクション */}
        <section className="mt-12 pt-12 border-t border-slate-200 flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-bold text-slate-800">学習ガイド｜最新記事</h2>
            <Link
              href="/guide"
              prefetch={false}
              className="text-sm text-blue-600 hover:underline whitespace-nowrap"
            >
              すべての記事を見る →
            </Link>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            TOEIC のスコアアップに直結する学習戦略・Part 別対策・語彙集を、運営者が体系的にまとめた長文記事を <strong>12 本以上</strong> 公開しています。スコア別の語彙数、忘却曲線を活用した暗記法、Part 5/7 の頻出語リストなど、単語帳だけでは補えない内容を扱います。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestGuideArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/guide/${article.slug}`}
                prefetch={false}
                className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                    {article.category}
                  </span>
                  <span>約 {article.estimatedReadingMin} 分</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-700">
                  {article.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                  {article.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <Suspense fallback={<FaqFallback />}>
          <FaqSection />
        </Suspense>
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
              例えば、<Link href="/words/accommodate" prefetch={false} className="text-blue-600 font-bold hover:underline">accommodate</Link>（対応する）や<Link href="/words/negotiate" prefetch={false} className="text-blue-600 font-bold hover:underline">negotiate</Link>（交渉する）、
              <Link href="/words/implement" prefetch={false} className="text-blue-600 font-bold hover:underline">implement</Link>（実施する）など、スコアアップに直結する重要語を、
              実践的な例文とともにわかりやすく学べます。
              古い単語帳だけでは補いにくい、今のTOEICに合ったビジネス英語を、このサイトで効率よく身につけましょう。
            </p>
          </article>

          <article className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 mb-2">TOEIC重要単語の効率的な覚え方</h2>
            <p className="text-[15px] leading-[1.8] text-slate-600">
              TOEICスコアアップの鍵は、試験に出る「TOEIC重要単語」を確実にマスターすることです。
              単に英単語と日本語訳を丸暗記するのではなく、実際の例文の中でどのように使われるかを理解することが重要です。
              本サイトでは、各単語の詳細な意味、語形変化、類義語、ニュアンス、そして実践的な例文を、ビジネス文脈に絞って提供しています。
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
              600点以上を目指す方は、より難しい単語のニュアンス・コロケーションまで踏み込んで理解を深めながら覚えましょう。
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
