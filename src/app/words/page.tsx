import Link from "next/link";
import Script from "next/script";
import { Home, ChevronRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { getImportantWords, getMediumWords, getHighWords } from "@/data/words";
import type { Word } from "@/data/words";
import { WordLinkPending } from "@/components/features/words/WordLinkPending";

export const metadata: Metadata = {
  title: {
    absolute: "TOEIC重要単語 一覧【2026年最新】全1,300語リスト | AI解説付き無料",
  },
  description:
    "TOEIC頻出単語を全て一覧で確認できます。600点レベルの最重要単語372語・730〜800点の中級単語781語・800点以上の高難易度単語148語を収録。レベル別に整理された単語リストで効率的に学習。各単語をクリックするとAI解説・例文・発音を無料で確認できます。",
  keywords: [
    "TOEIC 重要単語 一覧",
    "TOEIC 単語 リスト",
    "TOEIC 頻出単語 一覧",
    "TOEIC 600点 単語",
    "TOEIC 730点 単語",
    "TOEIC 800点 単語",
    "英単語 一覧",
    "2026年",
    "無料",
  ],
  alternates: {
    canonical: "https://www.toeic-words.com/words",
  },
};

function groupByFirstLetter(words: Word[]): Record<string, Word[]> {
  const groups: Record<string, Word[]> = {};
  for (const word of words) {
    const letter = word.term[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(word);
  }
  return groups;
}

type LevelSectionProps = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly learningGuide?: React.ReactNode;
  readonly words: Word[];
  readonly badgeClass: string;
  readonly badgeLabel: string;
};

function LevelSection({ id, title, description, learningGuide, words, badgeClass, badgeLabel }: LevelSectionProps) {
  const groups = groupByFirstLetter(words);
  const letters = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  return (
    <section id={id} className="flex flex-col gap-4 scroll-mt-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${badgeClass}`}>
            {badgeLabel} · {words.length}語
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        {learningGuide && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-1 text-sm text-slate-700 leading-relaxed">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="text-blue-600">💡</span> 学習のポイント
            </h4>
            {learningGuide}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5">
        {letters.map((letter) => (
          <div key={letter}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">
              {letter}
            </h3>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {groups[letter].map((word) => (
                <Link
                  key={word.slug}
                  href={`/words/${word.slug}`}
                  prefetch={false}
                  className="relative text-sm text-slate-700 font-medium px-2.5 py-1.5 rounded-md bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all duration-150 no-underline truncate"
                >
                  {word.term}
                  <WordLinkPending />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function WordsListPage() {
  const importantWords = await getImportantWords();
  const mediumWords = await getMediumWords();
  const highWords = await getHighWords();
  const totalCount = importantWords.length + mediumWords.length + highWords.length;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://www.toeic-words.com/" },
      { "@type": "ListItem", position: 2, name: "単語一覧", item: "https://www.toeic-words.com/words" },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "TOEIC重要単語 全一覧",
    description: "TOEIC L&Rテストに頻出する重要単語の完全リスト（レベル別）",
    numberOfItems: totalCount,
    url: "https://www.toeic-words.com/words",
    itemListElement: importantWords.slice(0, 50).map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: w.term,
      url: `https://www.toeic-words.com/words/${w.slug}`,
    })),
  };

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#e0f2fe_0,#f9fafb_45%,#ffffff_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <Script
        id="ldjson-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="ldjson-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <main className="w-full max-w-[960px] flex flex-col gap-8">
        {/* ヘッダー */}
        <header className="flex flex-col gap-3">
          <nav className="flex items-center gap-1.5 text-sm mb-1">
            <Link 
              href="/" 
              className="flex items-center gap-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 -ml-2 rounded-md transition-colors no-underline font-medium"
            >
              <Home className="w-4 h-4" />
              ホーム
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-1.5 text-slate-800 bg-white border border-slate-200 shadow-sm px-2.5 py-1 rounded-md font-semibold">
              <BookOpen className="w-4 h-4 text-blue-600" />
              単語一覧
            </div>
          </nav>
          <h1 className="text-[22px] leading-[1.3] text-slate-900 font-bold sm:text-[26px]">
            TOEIC重要単語 全一覧【2026年最新】
          </h1>
          <p className="text-sm leading-[1.7] text-slate-500 max-w-2xl">
            TOEIC L&Rテストに頻出する重要単語を全{totalCount}語収録。レベル別（600点・730点・800点）に整理されており、各単語のAI解説・例文・類義語・発音を無料で確認できます。
          </p>
        </header>

        {/* 統計バー */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href="#section-important" className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 no-underline">
            <div className="text-2xl font-bold text-slate-800">{totalCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">収録単語数</div>
          </Link>
          <Link href="#section-important" className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 no-underline">
            <div className="text-2xl font-bold text-blue-700">{importantWords.length}</div>
            <div className="text-xs text-blue-600 mt-0.5">最重要単語</div>
          </Link>
          <Link href="#section-medium" className="bg-purple-50 rounded-xl border border-purple-200 p-4 text-center shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 no-underline">
            <div className="text-2xl font-bold text-purple-700">{mediumWords.length}</div>
            <div className="text-xs text-purple-600 mt-0.5">中級単語</div>
          </Link>
          <Link href="#section-high" className="bg-red-50 rounded-xl border border-red-200 p-4 text-center shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 no-underline">
            <div className="text-2xl font-bold text-red-700">{highWords.length}</div>
            <div className="text-xs text-red-600 mt-0.5">高難易度単語</div>
          </Link>
        </div>

        {/* クイックアクション */}
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/study"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors no-underline"
          >
            暗記モードで学習する
          </Link>
          <Link
            href="/today-words"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors no-underline"
          >
            今日のおすすめ5単語
          </Link>
        </div>

        {/* 単語一覧セクション */}
        <div className="flex flex-col gap-12">
          <LevelSection
            id="section-important"
            title="最重要単語（TOEIC 600点レベル）"
            description="TOEICスコアアップのために最初に覚えるべき基礎単語。このリストを完璧にすることで600点突破を目指せます。ビジネス英語の基本となる動詞・名詞・形容詞を中心に厳選しています。"
            learningGuide={
              <p>
                TOEIC 600点の壁を越えるには、リスニング（Part 1〜4）とリーディング（Part 5〜6）で確実に正解できる基礎力が不可欠です。このレベルの単語は、問題文や選択肢の核となるため、<strong>「英単語を見たら1秒で日本語の意味が浮かぶ」</strong>状態になるまで反復練習しましょう。特に品詞（名詞・動詞・形容詞など）の違いを意識して覚えると、Part 5の文法問題で大きなアドバンテージになります。
              </p>
            }
            words={importantWords}
            badgeClass="bg-blue-100 text-blue-800"
            badgeLabel="最重要"
          />
          <LevelSection
            id="section-medium"
            title="中級単語（TOEIC 730〜800点レベル）"
            description="さらなるスコアアップを目指すための応用単語。Part 5・Part 6・Part 7の正答率向上に直結する語彙です。ビジネス文書・会議・交渉などのシーンで使われる中〜上級単語を収録しています。"
            learningGuide={
              <p>
                730点以上を目指す学習者にとって最大の課題は、Part 7の長文読解（特に言い換え問題や推測問題）です。このスコア帯の単語は、パッセージ内で別の表現にパラフレーズ（言い換え）されることが多いため、<strong>単語単体ではなく「類義語」や「コロケーション（よく使われるフレーズ）」とセットで覚える</strong>のがコツです。AI解説を活用して、微妙なニュアンスの違いまで理解を深めましょう。
              </p>
            }
            words={mediumWords}
            badgeClass="bg-purple-100 text-purple-800"
            badgeLabel="中級"
          />
          <LevelSection
            id="section-high"
            title="高難易度単語（TOEIC 800点以上レベル）"
            description="800点以上の高スコアを目指すための上級単語。Part 7の長文読解や高度なビジネス表現に対応するための語彙力強化に特化した単語リストです。"
            learningGuide={
              <p>
                800点以上のハイスコア、さらには900点超えを狙うためには、ビジネスの専門用語や、特定の文脈でしか使われない難語（法律、金融、人事など）をカバーする必要があります。出現頻度自体は低いものの、<strong>長文の決定的な手がかりになる単語</strong>ばかりです。学習モードだけでなく、実際のTOEIC形式の長文の中でどう使われるかを想像しながら学習を進めてください。
              </p>
            }
            words={highWords}
            badgeClass="bg-red-100 text-red-800"
            badgeLabel="上級"
          />
        </div>

        {/* 学習ガイド */}
        <section className="pt-8 border-t border-slate-200 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800">TOEIC単語の効率的な学習法</h2>
          <p className="text-sm leading-[1.8] text-slate-600">
            TOEIC L&Rテストのスコアアップには語彙力が直結します。当サイトはTOEIC頻出単語{totalCount}語をレベル別に収録し、それぞれAI解説・例文・発音つきで無料提供しています。
          </p>
          <h3 className="text-sm font-bold text-slate-700">近年のビジネス英語トレンド</h3>
          <p className="text-sm leading-[1.8] text-slate-600">
            近年のビジネスシーンでは「リモートワーク」「オンライン会議」「サプライチェーン」などデジタル・グローバル化に伴う語彙が一般化しています。従来の重要単語に加え、こうした現代的なビジネス文脈で使われる単語も本リストに含めています。
          </p>
          <h3 className="text-sm font-bold text-slate-700">レベル別の優先順位</h3>
          <p className="text-sm leading-[1.8] text-slate-600">
            600点突破を目指す方はまず最重要単語（{importantWords.length}語）を優先してください。730〜800点を目指す方は中級単語（{mediumWords.length}語）まで、800点超えを狙う方は高難易度単語（{highWords.length}語）も含めた全語彙の習得が効果的です。
          </p>
        </section>

        {/* フッターCTA */}
        <section className="mt-4 pt-8 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-800 mb-3">TOEIC単語学習をさらに効率化</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/study" className="flex flex-col gap-1 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all no-underline">
              <span className="text-sm font-bold text-slate-800">暗記テストモード</span>
              <span className="text-xs text-slate-500">ランダム出題で効率的に単語を定着させましょう</span>
            </Link>
            <Link href="/today-words" className="flex flex-col gap-1 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all no-underline">
              <span className="text-sm font-bold text-slate-800">今日のおすすめ単語</span>
              <span className="text-xs text-slate-500">毎日5語ずつスキマ時間に学習する習慣をつけよう</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
