import Link from "next/link";
import type { Metadata } from "next";
import { Suspense, cache } from "react";
import { BookOpen, Star, List } from "lucide-react";
import { getImportantWords, getMediumWords, getHighWords, getTodayRecommendedSelection } from "@/data/words";
import WordsListClient from "@/components/features/words/WordsListClient";
import { SnsShareButtons } from "@/components/features/sns/SnsShareButtons";
import { AuthStatus } from "@/components/features/auth/AuthStatus";
import TodayRecommendedWordsClient from "@/components/features/words/TodayRecommendedWordsClient";
import { SemanticSearchLauncher } from "@/components/features/words/SemanticSearchLauncher";
import { getLatestGuideArticles,PUBLISHED_GUIDE_ARTICLE_COUNT} from "@/data/guide-articles";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";
import { AdSenseScript } from "@/components/common/AdSenseScript";

export const metadata: Metadata = {
  title: {
    absolute: "TOEIC 重要単語【2026年版】600点・730点・800点向け｜詳しい解説付き無料単語帳",
  },
  description: `【完全無料】TOEIC学習向け英単語1,300語以上を3段階に整理。ビジネス場面の例文、類義語、発音、学習・復習機能と学習ガイド${PUBLISHED_GUIDE_ARTICLE_COUNT}本を、登録不要で利用できます。`,
  keywords: ["TOEIC 重要単語", "TOEIC 単語帳", "TOEIC 英単語", "2026年", "無料", "アプリ", "600点", "730点", "800点"],
  alternates: {
    canonical: "https://www.toeic-words.com/",
  },
};

async function TodayRecommendedWordsSection() {
  const { dateKey, wordListVersion, words } = await getTodayRecommendedSelection();
  return (
    <TodayRecommendedWordsClient
      words={words}
      dateKey={dateKey}
      wordListVersion={wordListVersion}
      variant="preview"
    />
  );
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
      name: "このサイトの2026年版TOEIC単語リストとは？",
      text: "TOEIC L&Rの学習で確認したい英単語を、当サイト独自の3段階に整理したリストです。IIBC・ETS公式の頻度表やスコア別語彙表ではないため、模試で見つけた弱点と組み合わせて利用してください。"
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
      text: `当サイトでは合計${totalCount}語を、独自の学習目安として基礎${importantWords.length}語（600点）、中級${mediumWords.length}語（730〜800点）、上級${highWords.length}語（800点以上）に分類しています。公式のスコア別語彙基準ではないため、模試の弱点と組み合わせてください。`
    },
    {
      name: "TOEIC単語学習は毎日何語ずつ進めればいい？",
      text: `学べる時間や既知語の割合に合わせ、無理なく翌日も復習できる数に調整してください。「今日のおすすめ${TODAY_WORDS_COUNT}単語」機能は、少量から学習習慣を作る入口として利用できます。`
    },
    {
      name: "Part 5の単語はどう覚えればいいですか？",
      text: "Part 5では、意味だけでなく文中で必要な品詞を見分ける練習も役立ちます。各単語ページの語形変化を使い、動詞・名詞・形容詞・副詞を例文の中で確認してください。"
    },
    {
      name: "TOEICの単語学習はいつから始めるべき？",
      text: "試験日までの期間と現在の語彙力によって必要な時間は異なります。まず模試で未知語を確認し、試験日から逆算して、復習日を含む無理のない量を設定してください。"
    },
    {
      name: "TOEIC単語帳アプリと当サイトの違いは？",
      text: `当サイトはインストール不要で、単語の意味・例文・音声、学習・復習機能をブラウザから無料で利用できます。さらに、${PUBLISHED_GUIDE_ARTICLE_COUNT}本の公開中ガイドで学習の進め方やサイト機能を確認できます。`
    },
    {
      name: "TOEIC 600点に必要な単語力は？",
      text: `IIBC・ETSは、600点に必要な語彙数を公式基準として公表していません。当サイトでは学習順の目安として基礎層${importantWords.length}語を用意していますが、模試で間違えた語と基本文法もあわせて確認してください。`
    },
    {
      name: "TOEIC 800点以上を目指すには？",
      text: `中級${mediumWords.length}語・上級${highWords.length}語は学習範囲を広げる目安です。すべてを一律に暗記するのではなく、基礎語の取りこぼし、模試の未知語、複数語義や言い換えを優先してください。`
    },
  ];
}

function TodayRecommendedWordsFallback() {
  return (
    <section className="bg-white/90 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-pulse min-h-[208px] sm:min-h-[182px] lg:min-h-[118px]" />
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
      <script
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
    name: "TOEIC語彙ラボ",
    description: `TOEIC学習向け英単語1,300語以上と、公開中の学習ガイド${PUBLISHED_GUIDE_ARTICLE_COUNT}本を無料で利用できるオンライン学習サービス。`,
    alternateName: "toeic-words.com",
    url: "https://www.toeic-words.com/",
    inLanguage: "ja-JP",
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

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <AdSenseScript />
      <script
        id="ldjson-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        id="ldjson-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="w-full max-w-[960px] flex flex-col gap-5 relative">
        <div className="mb-[-8px] sm:mb-0 flex items-center justify-between gap-4">
          <AuthStatus />
          <SnsShareButtons
            url="https://www.toeic-words.com/"
            title="【2026年版】TOEIC 重要単語 | 英単語を効率よく学習"
          />
        </div>
        <header className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex flex-col gap-3 sm:max-w-[60%]">
            <p className="text-xs tracking-[0.12em] text-slate-500">TOEIC語彙ラボ · LEVEL UP YOUR SCORE</p>
            <h1 className="text-[22px] leading-[1.3] text-slate-900 font-bold sm:text-[26px] lg:text-[28px]">【2026年版】TOEIC 重要単語</h1>
            <p className="text-sm leading-[1.6] text-gray-500">
              目標と弱点に合わせて英単語を確認し、学習を続けましょう。
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
        <SemanticSearchLauncher />
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
            <h2 className="text-2xl font-bold text-slate-800 text-center">このサイトでできる3つのこと</h2>
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
                  「学習モード」と「復習モード」を使い分け、覚えにくい語へ繰り返し触れられます（お気に入り単語の復習モードはログインが必要）。さらに「今日のおすすめ{TODAY_WORDS_COUNT}単語」機能で、少量からの継続をサポートします。
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl font-bold mb-2">3</div>
                <h3 className="text-lg font-bold text-slate-800">完全無料・登録不要</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  アプリのインストールや会員登録は不要。PCでもスマホでも、ブラウザから1,300語以上の収録語を無料で確認できます。複数端末でのお気に入り同期や、お気に入り単語の復習モード・聞き流しを使いたい方向けに、無料のログイン機能も用意しています。
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
                  <p className="font-bold text-slate-800">朝のスキマ時間：今日のおすすめ{TODAY_WORDS_COUNT}単語をチェック</p>
                  <p className="text-sm text-slate-600 mt-1">トップページに表示される{TODAY_WORDS_COUNT}単語を通勤・通学中に確認し、英語脳にスイッチを入れます。</p>
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
                  <p className="text-sm text-slate-600 mt-1">覚えにくい単語は「お気に入り」に登録し、週末に「復習モード」で一気に振り返ります（復習モードはログインが必要）。</p>
                </div>
              </li>
            </ol>
          </div>

          {/* 開発者・運営からのメッセージ */}
          <div className="flex flex-col gap-4 border-l-4 border-blue-600 pl-5 py-2">
            <h2 className="text-lg font-bold text-slate-800">運営者からのメッセージ</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              運営者自身が TOEIC 学習を続ける中で、単語の意味・例文・音声をスマートフォンからまとめて確認したいと考え、このサイトを作りました。AI で生成した解説は自動チェックを行い、確認できた箇所や指摘を受けた箇所から改善しています。誤りや不自然な表現は、お問い合わせからお知らせください。
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
            学習の進め方・Part 別対策・語彙集など、運営者がまとめたガイドを <strong>{PUBLISHED_GUIDE_ARTICLE_COUNT} 本</strong> 公開しています。サイト機能の使い方や、復習計画、語形・コロケーションなど、単語一覧だけでは扱いにくい内容を補います。
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
            <h2 className="text-xl font-bold text-slate-800 mb-2">2026年版の収録語を、ビジネス場面の例文で確認。</h2>
            <p className="text-[15px] leading-[1.8] text-slate-600">
              TOEIC L&amp;R では、オフィス、会議、契約、出張、顧客対応など、さまざまなビジネス場面の英文が扱われます。
              当サイトでは、単語を日本語訳だけでなく、場面と結び付けて確認できるよう例文を掲載しています。
            </p>
            <p className="text-[15px] leading-[1.8] text-slate-600">
              例えば、<Link href="/words/accommodate" prefetch={false} className="text-blue-600 font-bold hover:underline">accommodate</Link>（対応する）や<Link href="/words/negotiate" prefetch={false} className="text-blue-600 font-bold hover:underline">negotiate</Link>（交渉する）、
              <Link href="/words/implement" prefetch={false} className="text-blue-600 font-bold hover:underline">implement</Link>（実施する）などを、例文・類義語・音声とあわせて確認できます。
              収録ランクは当サイト独自の学習目安なので、公式問題集や模試で見つけた弱点と組み合わせて利用してください。
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
