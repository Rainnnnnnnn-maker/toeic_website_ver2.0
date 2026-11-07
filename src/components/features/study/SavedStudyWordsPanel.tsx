'use client';

import { useId, useState } from 'react';
import { ChevronDown, Clock3, RotateCcw, Star } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import type { Word } from '@/data/words';
import { WORD_LEVEL_INFO } from '@/lib/word-level';
import StudyBulkFavoriteButton, { type BulkFavoriteSource } from './StudyBulkFavoriteButton';

type Props = {
  words: Word[];
  kind: 'forgotten' | 'later';
  currentSlug?: string;
  onSelect: (word: Word) => void;
  collapsible?: boolean;
  /** 指定すると「覚えていない」一覧に一括お気に入りボタンを出す。値は GA の押下場所。 */
  bulkFavoriteSource?: BulkFavoriteSource;
};

export default function SavedStudyWordsPanel({
  words,
  kind,
  currentSlug,
  onSelect,
  collapsible = true,
  bulkFavoriteSource,
}: Props) {
  const { isFavorite } = useFavorites();
  const panelId = useId();
  const titleId = `${panelId}-title`;
  const listId = `${panelId}-list`;
  const [isExpanded, setIsExpanded] = useState(false);
  const isForgotten = kind === 'forgotten';
  const title = isForgotten ? '覚えていない' : 'あとで確認';
  const Icon = isForgotten ? RotateCcw : Clock3;

  return (
    <aside
      aria-labelledby={titleId}
      className="min-w-0 w-full rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm lg:sticky lg:top-8"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isForgotten ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <Icon size={18} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-bold leading-tight text-slate-900">
              {title}
            </h2>
            <p role="status" className="mt-1 text-xs font-medium text-slate-600">
              {words.length}語
            </p>
          </div>
        </div>
        {collapsible && (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={listId}
            aria-label={`${title}の一覧を${isExpanded ? '閉じる' : '開く'}`}
            onClick={() => setIsExpanded((expanded) => !expanded)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none lg:hidden"
          >
            {isExpanded ? '閉じる' : '開く'}
            <ChevronDown
              size={18}
              aria-hidden
              className={`transition-transform motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* 折りたたみ中のモバイルでも押せるよう、一覧の外に置く */}
      {isForgotten && bulkFavoriteSource && words.length > 0 && (
        <div className="mt-4">
          <StudyBulkFavoriteButton
            slugs={words.map((word) => word.slug)}
            source={bulkFavoriteSource}
          />
        </div>
      )}

      <div
        id={listId}
        className={`mt-4 ${collapsible ? 'max-h-96 overflow-y-auto pr-1' : ''} ${
          !collapsible || isExpanded ? 'block' : 'hidden lg:block'
        }`}
      >
        {words.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-3 py-4 text-sm leading-relaxed text-slate-600">
            {isForgotten
              ? '「覚えていない」を選んだ単語がここにたまります。'
              : '「あとで」を選んだ単語を、ここから確認できます。'}
          </p>
        ) : (
          <ul className="space-y-2">
            {words.map((word) => {
              const isActive = currentSlug === word.slug;
              const showFavoriteMark = isForgotten && isFavorite(word.slug);

              return (
                <li key={word.slug}>
                  <button
                    type="button"
                    onClick={() => onSelect(word)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`group flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                      isActive
                        ? 'border-blue-300 bg-blue-50 text-blue-900'
                        : isForgotten
                          ? 'border-slate-200 bg-white text-slate-800 hover:border-orange-300 hover:bg-orange-50 active:bg-orange-100'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-amber-300 hover:bg-amber-50 active:bg-amber-100'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block break-words text-sm font-bold">
                        {word.term}
                        {showFavoriteMark && (
                          <>
                            <Star
                              size={13}
                              aria-hidden
                              className="ml-1 inline-block align-[-1px]"
                              fill="#F59E0B"
                              color="#F59E0B"
                            />
                            <span className="sr-only">（お気に入り登録済み）</span>
                          </>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-600">
                        {WORD_LEVEL_INFO[word.level].label}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                        isActive
                          ? 'bg-blue-100 text-blue-800'
                          : isForgotten
                            ? 'bg-orange-50 text-orange-800 group-hover:bg-orange-100'
                            : 'bg-amber-50 text-amber-800 group-hover:bg-amber-100'
                      }`}
                    >
                      確認
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
