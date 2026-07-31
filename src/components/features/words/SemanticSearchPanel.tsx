"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { ArrowRight, LoaderCircle, Sparkles, X } from "lucide-react";
import { WordLinkPending } from "@/components/features/words/WordLinkPending";
import { WORD_LEVEL_CARD_STYLES } from "@/components/features/words/wordLevelStyles";
import { WORD_LEVEL_INFO } from "@/lib/word-level";
import { SEMANTIC_QUERY_MAX_LENGTH } from "@/lib/semantic-launch";
import type { SemanticSearchResult } from "@/lib/semantic-search";

type SearchStatus = "idle" | "loading" | "success" | "error";

const EXAMPLE_QUERIES = ["延期する", "感謝を伝えるメールで使う単語", "会議の日程調整", "お金・支払いに関する単語"] as const;

type SearchOutcome =
  | { ok: true; results: SemanticSearchResult[] }
  | { ok: false; message: string };

async function fetchSemanticResults(query: string): Promise<SearchOutcome> {
  try {
    const response = await fetch("/api/search/semantic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Source": "toeic-client",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return { ok: false, message: "検索が混み合っています。1分ほど待ってからお試しください。" };
      }
      if (response.status === 503) {
        return { ok: false, message: "意味検索は現在準備中です。しばらくしてからお試しください。" };
      }
      return { ok: false, message: "検索に失敗しました。時間をおいてお試しください。" };
    }

    const data = (await response.json()) as { results?: SemanticSearchResult[] };
    return { ok: true, results: Array.isArray(data.results) ? data.results : [] };
  } catch {
    return { ok: false, message: "検索に失敗しました。通信環境をご確認ください。" };
  }
}

type Props = {
  /** TOP の AI 検索カードから `/words?mode=meaning&q=...` で渡された初期クエリ。マウント時に1回だけ自動実行する。 */
  readonly initialQuery?: string;
};

export function SemanticSearchPanel({ initialQuery = "" }: Props) {
  const trimmedInitialQuery = initialQuery.trim().slice(0, SEMANTIC_QUERY_MAX_LENGTH);
  const [query, setQuery] = useState(trimmedInitialQuery);
  const [status, setStatus] = useState<SearchStatus>(trimmedInitialQuery ? "loading" : "idle");
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");

  const applyOutcome = (searched: string, outcome: SearchOutcome, source: "form" | "url") => {
    if (outcome.ok) {
      setResults(outcome.results);
      setSearchedQuery(searched);
      setErrorMessage("");
      setStatus("success");
      sendGAEvent("event", "semantic_search", {
        query_length: Array.from(searched).length,
        result_count: outcome.results.length,
        source,
      });
    } else {
      setErrorMessage(outcome.message);
      setStatus("error");
    }
  };

  const applyInitialOutcome = useEffectEvent((searched: string, outcome: SearchOutcome) => {
    applyOutcome(searched, outcome, "url");
  });

  // TOP からの遷移時（?mode=meaning&q=...）はマウント時に1回だけ自動検索する。
  // setState はすべて await 後（非同期）なので set-state-in-effect には該当しない。
  useEffect(() => {
    if (!trimmedInitialQuery) return;
    let cancelled = false;
    void (async () => {
      const outcome = await fetchSemanticResults(trimmedInitialQuery);
      if (cancelled) return;
      applyInitialOutcome(trimmedInitialQuery, outcome);
    })();
    return () => {
      cancelled = true;
    };
  }, [trimmedInitialQuery]);

  const runSearch = async (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    const outcome = await fetchSemanticResults(trimmed);
    applyOutcome(trimmed, outcome, "form");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runSearch(query);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    void runSearch(example);
  };

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <form onSubmit={handleSubmit} role="search" className="relative">
        <label htmlFor="semantic-search" className="sr-only">
          意味や使う場面からTOEIC英単語を検索
        </label>
        <Sparkles
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-violet-400"
        />
        <input
          id="semantic-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength={SEMANTIC_QUERY_MAX_LENGTH}
          placeholder="例：延期する / 感謝を伝えるメールで使う単語"
          autoComplete="off"
          spellCheck={false}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="検索語をクリア"
            className="absolute right-12 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <X className="size-4" />
          </button>
        )}
        <button
          type="submit"
          aria-label="意味で検索する"
          disabled={status === "loading" || !query.trim()}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          {status === "loading" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </button>
      </form>

      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        日本語の意味や使う場面から、AIが関連の強い単語を探します。検索語はGemini APIへ送信されるため、個人情報・機密情報は入力しないでください。
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            disabled={status === "loading"}
            className="inline-flex min-h-9 items-center rounded-full border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-5" aria-live="polite">
        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 px-6 py-10 text-sm font-semibold text-violet-700">
            <LoaderCircle className="size-4 animate-spin" />
            AIが意味の近い単語を探しています…
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
            <p className="text-sm font-bold text-rose-800">{errorMessage}</p>
          </div>
        )}

        {status === "success" && results.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-base font-bold text-slate-800">関連する単語が見つかりませんでした</p>
            <p className="mt-2 text-sm text-slate-500">別の言い回しでお試しください。</p>
          </div>
        )}

        {status === "success" && results.length > 0 && (
          <>
            <p className="mb-3 text-sm font-semibold text-slate-700">
              「{searchedQuery}」に関連の強い{results.length}語（関連度順）
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {results.map((result) => {
                const info = WORD_LEVEL_INFO[result.level];
                const styles = WORD_LEVEL_CARD_STYLES[result.level];
                return (
                  <Link
                    key={result.slug}
                    href={`/words/${result.slug}`}
                    prefetch={false}
                    onClick={() =>
                      sendGAEvent("event", "word_detail_open", {
                        word: result.slug,
                        source: "semantic_search",
                      })
                    }
                    className={`group relative flex min-h-16 items-center justify-between gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${styles.cardClass}`}
                  >
                    <WordLinkPending />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-900 sm:text-base">
                        {result.term}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {result.japaneseTranslation || "AI解説・例文・発音"}
                      </span>
                    </span>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${styles.badgeClass}`}>
                      {info.score}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
