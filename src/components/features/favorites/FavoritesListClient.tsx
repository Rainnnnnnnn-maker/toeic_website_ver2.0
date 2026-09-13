"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import type { Word } from "@/data/words";
import { filterWordsByTermPrefix, normalizeTermQuery } from "@/lib/word-search";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search, X } from "lucide-react";

export default function FavoritesListClient({ allWords }: { allWords: Word[] }) {
  const { favorites, clearFavorites } = useFavorites();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pageSize = 20;

  const handleClearClick = () => {
    setShowConfirmModal(true);
  };

  const confirmClear = () => {
    clearFavorites();
    setQuery("");
    setShowConfirmModal(false);
  };

  const handleQueryClear = () => {
    setQuery("");
    setPage(1);
    inputRef.current?.focus();
  };

  const favoriteWords = (() => {
    const wordMap = new Map(allWords.map((w) => [w.slug, w]));
    // お気に入り追加順（逆順：最新が先頭）で表示
    return [...favorites]
      .reverse()
      .map((slug) => wordMap.get(slug))
      .filter((w): w is Word => w !== undefined);
  })();

  const isSearching = normalizeTermQuery(query) !== "";
  const matchedWords = filterWordsByTermPrefix(favoriteWords, query);

  const totalPages = Math.max(1, Math.ceil(matchedWords.length / pageSize));
  // ページ数が減った場合に現在のページが範囲外にならないように調整
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const start = (currentPage - 1) * pageSize;
  const current = matchedWords.slice(start, start + pageSize);

  if (favoriteWords.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg font-medium mb-3">
          お気に入りの単語はまだありません
        </p>
        <p className="text-sm leading-[1.6]">
          単語詳細ページの星マーク（☆）をクリックすると、
          <br />
          ここにリストとして保存されます。
        </p>
        <div className="mt-8">
          <Link href="/" prefetch={false} className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
            <Search size={16} className="transition-transform group-hover:scale-110" />
            <span className="relative z-10">単語を探す</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative">
        <label htmlFor="favorites-search" className="sr-only">
          お気に入り単語を検索
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          id="favorites-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") handleQueryClear();
          }}
          placeholder="英単語の先頭から検索（例：acc）"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-11 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={handleQueryClear}
            aria-label="検索語をクリア"
            className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearClick}
            className="px-3 py-2 rounded-[10px] border border-gray-200 bg-white text-gray-900 text-[13px] transition-all duration-180 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="お気に入りをすべて削除"
          >
            すべて削除
          </button>
          <p aria-live="polite" className="text-xs font-medium text-slate-500">
            {isSearching
              ? `${matchedWords.length}件 / 全${favoriteWords.length}件`
              : `全${favoriteWords.length}件`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            className="p-1.5 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-180 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            aria-label="最初のページ"
            title="最初のページ"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="p-1.5 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-180 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="前のページ"
            title="前のページ"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-gray-500 min-w-[3rem] text-center font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            className="p-1.5 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-180 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="次のページ"
            title="次のページ"
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="p-1.5 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-180 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="最後のページ"
            title="最後のページ"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>

      {current.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {current.map((word) => (
            <Link
              key={word.slug}
              href={`/words/${word.slug}?from=favorites`}
              className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-slate-200 no-underline transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
            >
              <span className="text-lg font-semibold text-gray-900">{word.term}</span>
              <span className="mt-2 text-[11px] text-gray-400">
                クリックしてAIによる解説を見る
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center">
          <p className="text-base font-bold text-slate-800 break-words">
            「{query.trim()}」で始まるお気に入り単語はありません
          </p>
          <p className="mt-2 text-sm text-slate-500">
            スペルを確認するか、検索語を短くしてお試しください。
          </p>
          <button
            type="button"
            onClick={handleQueryClear}
            className="mt-5 min-h-11 rounded-xl bg-slate-800 px-5 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 focus-visible:ring-offset-2"
          >
            検索をクリア
          </button>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">確認</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              お気に入り単語をすべて削除してもよろしいですか？
              <br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmClear}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
