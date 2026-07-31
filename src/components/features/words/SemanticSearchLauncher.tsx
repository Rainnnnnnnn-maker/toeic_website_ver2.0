"use client";

import { useState, useTransition } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import {
  SEMANTIC_QUERY_MAX_LENGTH,
  buildSemanticSearchUrl,
} from "@/lib/semantic-launch";
import { createSemanticLaunch } from "@/lib/semantic-launch-store";

const EXAMPLE_QUERIES = ["延期する", "感謝を伝えるメールで使う単語", "会議の日程調整"] as const;

/**
 * TOP ページ用の AI 意味検索カード。
 * 結果表示は持たず、送信で /words の「意味で探す」タブへ遷移して自動実行する
 * （結果 UI を SemanticSearchPanel の1箇所に保つため）。
 */
export function SemanticSearchLauncher() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isNavigating, startNavigation] = useTransition();

  const launch = (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed || isNavigating) return;
    const launchId = createSemanticLaunch(trimmed);
    if (!launchId) return;
    sendGAEvent("event", "semantic_search_launch", {
      query_length: Array.from(trimmed).length,
      source: "top",
    });
    startNavigation(() => {
      router.push(buildSemanticSearchUrl(launchId));
    });
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    launch(query);
  };

  return (
    <section
      aria-labelledby="semantic-launcher-title"
      className="rounded-xl border border-violet-200 bg-white/90 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-4"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
          <Sparkles className="size-4" />
        </span>
        <h2 id="semantic-launcher-title" className="text-sm font-bold text-slate-900 sm:text-base">
          意味からTOEIC単語をAI検索
        </h2>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
          AI
        </span>
      </div>

      <form onSubmit={handleSubmit} role="search" className="relative mt-3">
        <label htmlFor="semantic-launcher-input" className="sr-only">
          意味や使う場面からTOEIC英単語を検索
        </label>
        <input
          id="semantic-launcher-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength={SEMANTIC_QUERY_MAX_LENGTH}
          placeholder="例：延期する / 感謝を伝えるメールで使う単語"
          autoComplete="off"
          spellCheck={false}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-4 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          aria-label="意味で検索する"
          aria-busy={isNavigating}
          disabled={isNavigating || !query.trim()}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          {isNavigating ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </button>
      </form>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => launch(example)}
            disabled={isNavigating}
            className="inline-flex min-h-8 items-center rounded-full border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {example}
          </button>
        ))}
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
        検索語はGemini APIへ送信されます。個人情報・機密情報は入力しないでください。
      </p>
    </section>
  );
}
