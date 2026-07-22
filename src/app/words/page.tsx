import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Headphones,
  Heart,
  Home,
  Search,
  Sparkles,
} from "lucide-react";
import { getHighWords, getImportantWords, getMediumWords } from "@/data/words";
import type { Word } from "@/data/words";
import { WordsExplorerClient } from "@/components/features/words/WordsExplorerClient";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";

export const metadata: Metadata = {
  title: {
    absolute: "TOEIC重要単語 一覧【2026年最新】1,300語以上 | AI解説付き無料",
  },
  description:
    "TOEIC頻出単語1,300語以上を、目標スコア・アルファベット・英単語検索から探せる無料単語リスト。600点・730〜800点・800点以上のレベル別に整理し、各単語のAI解説・例文・類義語・発音を確認できます。",
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

type LevelIndexProps = {
  readonly id: string;
  readonly title: string;
  readonly score: string;
  readonly description: string;
  readonly words: Word[];
  readonly accentClass: string;
  readonly countClass: string;
};

function LevelIndex({
  id,
  title,
  score,
  description,
  words,
  accentClass,
  countClass,
}: LevelIndexProps) {
  const groups = groupByFirstLetter(words);
  const letters = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  return (
    <section id={id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <details className="group/level">
        <summary className="flex min-h-24 cursor-pointer list-none items-center justify-between gap-4 px-4 py-5 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden sm:px-6">
          <span className="flex min-w-0 items-start gap-3 sm:items-center">
            <span aria-hidden="true" className={`mt-1 block size-3 shrink-0 rounded-full sm:mt-0 ${accentClass}`} />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-slate-900 sm:text-lg">{title}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${countClass}`}>
                  {score} · {words.length}語
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500 sm:text-sm">{description}</span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-slate-500">
            <span className="hidden sm:inline">A〜Z索引を開く</span>
            <ChevronDown className="size-5 transition-transform duration-200 group-open/level:rotate-180" />
          </span>
        </summary>

        <div className="border-t border-slate-200 bg-slate-50/70 p-3 sm:p-5">
          <div className="flex flex-col gap-2">
            {letters.map((letter) => (
              <details key={letter} className="group/letter overflow-hidden rounded-xl border border-slate-200 bg-white">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                      {letter}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{groups[letter].length}語</span>
                  </span>
                  <ChevronDown className="size-4 text-slate-400 transition-transform duration-200 group-open/letter:rotate-180" />
                </summary>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {groups[letter].map((word) => (
                    <Link
                      key={word.slug}
                      href={`/words/${word.slug}`}
                      prefetch={false}
                      className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 no-underline shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                    >
                      <span className="truncate">{word.term}</span>
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}

function LearningGuides({
  importantCount,
  mediumCount,
  highCount,
}: {
  readonly importantCount: number;
  readonly mediumCount: number;
  readonly highCount: number;
}) {
  return (
    <section aria-labelledby="learning-guide-title" className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-blue-600">LEARNING GUIDE</p>
          <h2 id="learning-guide-title" className="mt-1 text-xl font-bold text-slate-900">
            目標スコア別の学習ポイント
          </h2>
        </div>
        <Link
          href="/guide/toeic-vocab-by-score"
          prefetch={false}
          className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 no-underline transition hover:text-blue-800"
        >
          詳しいスコア別戦略
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <details className="group rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-blue-950 [&::-webkit-details-marker]:hidden">
            <span>600点を目指す方</span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            まずは最重要単語{importantCount}語を優先してください。問題文や選択肢の核になるため、
            <strong>英単語を見たら1秒で意味が浮かぶ</strong>状態まで反復し、品詞の違いもセットで覚えるとPart 5対策に効果的です。
          </p>
        </details>

        <details className="group rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-violet-950 [&::-webkit-details-marker]:hidden">
            <span>730〜800点を目指す方</span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            最重要単語に加えて中級単語{mediumCount}語まで広げましょう。Part 7では言い換えが多いため、
            <strong>類義語やコロケーションと一緒に覚える</strong>ことで、長文中のパラフレーズを見抜きやすくなります。
          </p>
        </details>

        <details className="group rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-rose-950 [&::-webkit-details-marker]:hidden">
            <span>800点以上を目指す方</span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            高難易度単語{highCount}語では、法律・金融・人事など特定のビジネス文脈で使われる語彙も扱います。出現頻度だけでなく、
            <strong>長文の決定的な手がかりになる単語</strong>として例文の中で理解してください。
          </p>
        </details>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600 sm:p-5">
        <h3 className="font-bold text-slate-900">TOEIC単語を効率よく定着させるには</h3>
        <p className="mt-2">
          1日10〜20語を目安に、新しい単語の確認と前日・3日前・1週間前の復習を組み合わせるのがおすすめです。近年のビジネスシーンで一般化したリモートワーク、オンライン会議、サプライチェーンなどの語彙も、実際の文脈と一緒に覚えましょう。
        </p>
        <Link
          href="/guide/forgetting-curve"
          prefetch={false}
          className="mt-3 inline-flex items-center gap-1 font-bold text-blue-600 no-underline hover:text-blue-800"
        >
          忘却曲線を活用した復習方法を見る
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

export default async function WordsListPage() {
  const [importantWords, mediumWords, highWords] = await Promise.all([
    getImportantWords(),
    getMediumWords(),
    getHighWords(),
  ]);
  const allWords = [...importantWords, ...mediumWords, ...highWords];
  const totalCount = allWords.length;

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
    itemListElement: importantWords.slice(0, 50).map((word, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: word.term,
      url: `https://www.toeic-words.com/words/${word.slug}`,
    })),
  };

  return (
    <div className="relative min-h-screen w-full overflow-clip bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:pb-16">
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

      <main className="relative mx-auto flex w-full max-w-[1120px] flex-col gap-8 sm:gap-10">
        <nav aria-label="パンくず" className="flex items-center gap-1.5 text-sm">
          <Link
            href="/"
            prefetch={false}
            className="-ml-2 flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-slate-500 no-underline transition hover:bg-white/70 hover:text-blue-700"
          >
            <Home className="size-4" />
            ホーム
          </Link>
          <ChevronRight className="size-4 text-slate-400" />
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1 font-semibold text-slate-800 shadow-sm">
            <BookOpen className="size-4 text-blue-600" />
            単語一覧
          </span>
        </nav>

        <header className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white via-blue-50 to-indigo-100 shadow-[0_28px_80px_-40px_rgba(30,64,175,0.45)]">
          <div aria-hidden="true" className="absolute -right-24 -top-28 size-72 rounded-full bg-blue-300/25 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-32 left-1/3 size-64 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)] lg:items-center lg:p-10">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-blue-700">TOEIC語彙ラボ · COMPLETE INDEX</p>
              <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[36px] lg:text-[42px]">
                TOEIC重要単語
                <span className="mt-1 block text-blue-700">
                  全{totalCount.toLocaleString("ja-JP")}語から、
                  <span className="block">今覚える単語を探す</span>
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                600点・730〜800点・800点以上の目標別に整理したTOEIC頻出単語リストです。検索、頭文字、レベルから絞り込み、各単語のAI解説・例文・類義語・発音を無料で確認できます。
              </p>

              <Link
                href="#word-explorer"
                className="mt-5 flex min-h-12 items-center justify-between rounded-xl bg-slate-900 px-4 text-sm font-bold text-white no-underline shadow-lg shadow-slate-900/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 sm:hidden"
              >
                <span className="flex items-center gap-2">
                  <Search className="size-4" />
                  全{totalCount.toLocaleString("ja-JP")}語から検索する
                </span>
                <ArrowRight className="size-4" />
              </Link>

              <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                {[
                  { icon: Check, label: "完全無料・登録不要" },
                  { icon: Headphones, label: "発音・例文つき" },
                  { icon: Bot, label: "AIによる詳しい解説" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    <Icon className="size-3.5 text-blue-600" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-white bg-white/80 p-4 shadow-xl shadow-blue-950/5 backdrop-blur-sm sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">どこから始めるか迷ったら</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    まずは今日の{TODAY_WORDS_COUNT}語を、5分で確認してみましょう。
                  </p>
                </div>
              </div>

              <Link
                href="/today-words"
                prefetch={false}
                className="mt-4 flex min-h-12 items-center justify-between rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 px-4 text-sm font-bold text-white no-underline shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                今日のおすすめ{TODAY_WORDS_COUNT}単語
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/study"
                prefetch={false}
                className="mt-2 flex min-h-12 items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 no-underline transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <span className="flex items-center gap-2">
                  <BrainCircuit className="size-4 text-blue-600" />
                  暗記テストを始める
                </span>
                <ArrowRight className="size-4" />
              </Link>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
                <Link href="/favorites" prefetch={false} className="inline-flex items-center gap-1 text-slate-600 no-underline hover:text-amber-600">
                  <Heart className="size-3.5" />
                  お気に入り
                </Link>
                <Link href="/guide" prefetch={false} className="inline-flex items-center gap-1 text-slate-600 no-underline hover:text-blue-700">
                  <BookOpen className="size-3.5" />
                  学習ガイド
                </Link>
              </div>
            </aside>
          </div>
        </header>

        <WordsExplorerClient words={allWords} />

        <section aria-labelledby="complete-index-title" className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-blue-700">COMPLETE A–Z INDEX</p>
              <h2 id="complete-index-title" className="mt-1 text-2xl font-bold text-slate-900">
                全{totalCount.toLocaleString("ja-JP")}語の完全索引
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-500 sm:text-right">
              SEOと探しやすさを両立するため、すべての単語をレベル別・アルファベット順で掲載しています。
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <LevelIndex
              id="section-important"
              title="最重要単語"
              score="TOEIC 600点"
              description="スコアアップの土台になる、最初に覚えたい基礎単語"
              words={importantWords}
              accentClass="bg-blue-600"
              countClass="bg-blue-100 text-blue-800"
            />
            <LevelIndex
              id="section-medium"
              title="中級単語"
              score="TOEIC 730〜800点"
              description="Part 5・6・7の正答率向上につながる応用単語"
              words={mediumWords}
              accentClass="bg-violet-600"
              countClass="bg-violet-100 text-violet-800"
            />
            <LevelIndex
              id="section-high"
              title="高難易度単語"
              score="TOEIC 800点以上"
              description="長文読解や高度なビジネス表現に対応する上級単語"
              words={highWords}
              accentClass="bg-rose-600"
              countClass="bg-rose-100 text-rose-800"
            />
          </div>
        </section>

        <LearningGuides
          importantCount={importantWords.length}
          mediumCount={mediumWords.length}
          highCount={highWords.length}
        />

        <section className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/study"
            prefetch={false}
            className="group flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-700 p-5 text-white no-underline shadow-lg shadow-blue-700/15 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            <span>
              <span className="block text-base font-bold">暗記テストモード</span>
              <span className="mt-1 block text-xs text-blue-100">ランダム出題で覚えた単語をチェック</span>
            </span>
            <BrainCircuit className="size-6 transition-transform group-hover:scale-110" />
          </Link>
          <Link
            href="/today-words/listen"
            prefetch={false}
            className="group flex items-center justify-between rounded-2xl border border-emerald-200 bg-white p-5 text-slate-900 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <span>
              <span className="block text-base font-bold">今日の単語を聞き流す</span>
              <span className="mt-1 block text-xs text-slate-500">単語・英語例文・日本語訳を連続再生</span>
            </span>
            <Headphones className="size-6 text-emerald-600 transition-transform group-hover:scale-110" />
          </Link>
        </section>

        <Link
          href="#word-explorer"
          className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-5 text-sm font-bold text-slate-700 no-underline shadow-sm transition hover:border-blue-300 hover:text-blue-700"
        >
          <Search className="size-4" />
          単語検索へ戻る
        </Link>
      </main>
    </div>
  );
}
