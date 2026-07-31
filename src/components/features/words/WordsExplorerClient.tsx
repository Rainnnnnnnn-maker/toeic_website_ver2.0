"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";
import type { Word } from "@/data/words";
import { WordLinkPending } from "@/components/features/words/WordLinkPending";
import { SemanticSearchPanel } from "@/components/features/words/SemanticSearchPanel";
import { WORD_LEVEL_CARD_STYLES } from "@/components/features/words/wordLevelStyles";
import { WORD_LEVEL_INFO, WORD_LEVEL_ORDER } from "@/lib/word-level";
import type { WordLevel } from "@/lib/word-level";
import { parseSemanticLaunchParams } from "@/lib/semantic-launch";
import { getSemanticLaunchQuery } from "@/lib/semantic-launch-store";

type LevelFilter = "all" | WordLevel;

type SearchMode = "term" | "meaning";

type Props = {
  readonly words: Word[];
};

const RESULT_PAGE_SIZE = 36;
const SEARCH_EVENT_DELAY_MS = 700;
const SEARCH_EVENT_MIN_LENGTH = 2;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const levelStyles = WORD_LEVEL_CARD_STYLES;

function matchesQuery(term: string, query: string): boolean {
  if (!query) return true;

  const normalizedTerm = term.toLowerCase();
  if (!query.includes("*")) return normalizedTerm.startsWith(query);

  try {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = escaped.replace(/\\\*/g, ".*");
    return new RegExp(`^${pattern}$`, "i").test(term);
  } catch {
    return false;
  }
}

export function WordsExplorerClient({ words }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const launchParams = parseSemanticLaunchParams(`?${searchParams.toString()}`);
  const initialSemanticQuery = getSemanticLaunchQuery(launchParams.launchId);
  const searchMode = launchParams.mode;
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [letter, setLetter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(RESULT_PAGE_SIZE);
  const lastTrackedSearchRef = useRef("");

  const handleModeChange = (nextMode: SearchMode) => {
    if (nextMode === searchMode) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextMode === "meaning") {
      nextParams.set("mode", "meaning");
    } else {
      nextParams.delete("mode");
    }
    nextParams.delete("launch");
    const nextSearch = nextParams.toString();
    router.replace(`/words${nextSearch ? `?${nextSearch}` : ""}#word-explorer`, {
      scroll: false,
    });
    sendGAEvent("event", "words_filter", {
      filter_type: "search_mode",
      filter_value: nextMode,
    });
  };

  const normalizedQuery = query.trim().toLowerCase();
  const queryAndLetterMatchedWords = words.filter((word) => {
    const matchesLetter = letter === "all" || word.term[0]?.toUpperCase() === letter;
    return matchesLetter && matchesQuery(word.term, normalizedQuery);
  });
  const filteredWords = queryAndLetterMatchedWords.filter((word) => level === "all" || word.level === level);

  if (normalizedQuery && !normalizedQuery.includes("*")) {
    filteredWords.sort((a, b) => {
      const aExact = a.term.toLowerCase() === normalizedQuery ? 0 : 1;
      const bExact = b.term.toLowerCase() === normalizedQuery ? 0 : 1;
      return aExact - bExact;
    });
  }

  const visibleWords = filteredWords.slice(0, visibleCount);
  const counts: Record<LevelFilter, number> = {
    all: queryAndLetterMatchedWords.length,
    important: queryAndLetterMatchedWords.filter((word) => word.level === "important").length,
    medium: queryAndLetterMatchedWords.filter((word) => word.level === "medium").length,
    high: queryAndLetterMatchedWords.filter((word) => word.level === "high").length,
  };

  const levelOptions: Array<{
    id: LevelFilter;
    label: string;
    score: string;
    count: number;
    activeClass: string;
  }> = [
    {
      id: "all",
      label: "すべて",
      score: "全レベル",
      count: counts.all,
      activeClass: "border-slate-800 bg-slate-800 text-white shadow-slate-900/15",
    },
    ...WORD_LEVEL_ORDER.map((id) => ({
      id,
      label: WORD_LEVEL_INFO[id].label,
      score: WORD_LEVEL_INFO[id].score,
      count: counts[id],
      activeClass: levelStyles[id].activeClass,
    })),
  ];

  const trackSettledSearch = useEffectEvent((searchTerm: string) => {
    if (lastTrackedSearchRef.current === searchTerm) return;

    lastTrackedSearchRef.current = searchTerm;
    sendGAEvent("event", "search", {
      search_term: searchTerm,
      result_count: filteredWords.length,
    });
  });

  useEffect(() => {
    if (normalizedQuery.length < SEARCH_EVENT_MIN_LENGTH) {
      lastTrackedSearchRef.current = "";
      return;
    }

    const timeoutId = window.setTimeout(() => {
      trackSettledSearch(normalizedQuery);
    }, SEARCH_EVENT_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [normalizedQuery]);

  const handleSearchSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleLevelChange = (nextLevel: LevelFilter) => {
    setLevel(nextLevel);
    setVisibleCount(RESULT_PAGE_SIZE);
    sendGAEvent("event", "words_filter", {
      filter_type: "level",
      filter_value: nextLevel,
    });
  };

  const handleLetterChange = (nextLetter: string) => {
    if (nextLetter !== "all") setQuery("");
    setLetter(nextLetter);
    setVisibleCount(RESULT_PAGE_SIZE);
    sendGAEvent("event", "words_filter", {
      filter_type: "letter",
      filter_value: nextLetter,
    });
  };

  const handleReset = () => {
    setQuery("");
    setLevel("all");
    setLetter("all");
    setVisibleCount(RESULT_PAGE_SIZE);
  };

  return (
    <section
      id="word-explorer"
      aria-labelledby="word-explorer-title"
      className="scroll-mt-3 rounded-3xl border border-white/80 bg-white/90 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm"
    >
      <div className="border-b border-slate-200 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-blue-600">FIND YOUR WORDS</p>
            <h2 id="word-explorer-title" className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              目標スコアや英単語から探す
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 sm:max-w-[310px] sm:text-right">
            英単語の先頭一致・ワイルドカード（*）検索と、日本語の意味からのAI検索に対応しています。
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.5)] backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mb-3 grid grid-cols-2 gap-2" role="group" aria-label="検索モード切替">
          <button
            type="button"
            aria-pressed={searchMode === "term"}
            onClick={() => handleModeChange("term")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              searchMode === "term"
                ? "border-slate-800 bg-slate-800 text-white shadow-lg shadow-slate-900/15"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Search className="size-4" />
            英単語で探す
          </button>
          <button
            type="button"
            aria-pressed={searchMode === "meaning"}
            onClick={() => handleModeChange("meaning")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
              searchMode === "meaning"
                ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            }`}
          >
            <Sparkles className="size-4" />
            意味で探す
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                searchMode === "meaning" ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700"
              }`}
            >
              AI
            </span>
          </button>
        </div>

        {searchMode === "term" && (
          <>
          <form onSubmit={handleSearchSubmit} role="search" className="relative">
            <label htmlFor="words-search" className="sr-only">
              TOEIC英単語を検索
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
            />
            <input
              id="words-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLetter("all");
                setVisibleCount(RESULT_PAGE_SIZE);
              }}
              placeholder="英単語を入力（例：implement / impl*）"
              autoComplete="off"
              spellCheck={false}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setVisibleCount(RESULT_PAGE_SIZE);
                }}
                aria-label="検索語をクリア"
                className="absolute right-12 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="size-4" />
              </button>
            )}
            <button
              type="submit"
              aria-label="検索する"
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div
            className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
            role="group"
            aria-label="目標スコアで絞り込み"
          >
            {levelOptions.map((option) => {
              const isActive = option.id === level;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleLevelChange(option.id)}
                  className={`min-h-14 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? `${option.activeClass} shadow-lg`
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold">{option.label}</span>
                    <span className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-900"}`}>
                      {option.count}
                    </span>
                  </span>
                  <span className={`mt-0.5 block text-[11px] ${isActive ? "text-white/80" : "text-slate-500"}`}>
                    {option.score}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-1" role="group" aria-label="頭文字で絞り込み">
              <button
                type="button"
                aria-pressed={letter === "all"}
                onClick={() => handleLetterChange("all")}
                className={`min-h-10 rounded-lg px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  letter === "all"
                    ? "bg-slate-800 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                A–Z
              </button>
              {LETTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={letter === item}
                  onClick={() => handleLetterChange(item)}
                  className={`size-10 rounded-lg text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    letter === item
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          </>
        )}
      </div>

      {searchMode === "meaning" ? (
        <SemanticSearchPanel
          key={launchParams.launchId || "manual"}
          initialQuery={initialSemanticQuery}
        />
      ) : (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p aria-live="polite" className="text-sm font-semibold text-slate-700">
            {filteredWords.length.toLocaleString("ja-JP")}語が見つかりました
          </p>
          {(query || level !== "all" || letter !== "all") && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-blue-600 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-800"
            >
              条件をすべてリセット
            </button>
          )}
        </div>

        {visibleWords.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {visibleWords.map((word) => {
                const info = WORD_LEVEL_INFO[word.level];
                const styles = levelStyles[word.level];
                return (
                  <Link
                    key={word.slug}
                    href={`/words/${word.slug}`}
                    prefetch={false}
                    onClick={() =>
                      sendGAEvent("event", "word_detail_open", {
                        word: word.slug,
                        source: "words_explorer",
                      })
                    }
                    className={`group relative flex min-h-16 items-center justify-between gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2.5 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${styles.cardClass}`}
                  >
                    <WordLinkPending />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-900 sm:text-base">{word.term}</span>
                      <span className="mt-1 block text-[10px] text-slate-400">AI解説・例文・発音</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${styles.badgeClass}`}>
                      {info.score}
                    </span>
                  </Link>
                );
              })}
            </div>

            {visibleCount < filteredWords.length && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => current + RESULT_PAGE_SIZE)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  さらに{Math.min(RESULT_PAGE_SIZE, filteredWords.length - visibleCount)}語を表示
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-base font-bold text-slate-800">該当する単語が見つかりませんでした</p>
            <p className="mt-2 text-sm text-slate-500">スペルやレベル、頭文字の条件を変えてお試しください。</p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 min-h-11 rounded-xl bg-slate-800 px-5 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 focus-visible:ring-offset-2"
            >
              全単語を表示する
            </button>
          </div>
        )}
      </div>
      )}
    </section>
  );
}
