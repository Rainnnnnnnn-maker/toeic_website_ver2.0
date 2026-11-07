'use client';

import { useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { Star } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { pickUnfavoritedSlugs } from '@/lib/favorites-sync';

export type BulkFavoriteSource = 'study_sidebar' | 'study_summary';

type Props = {
  slugs: string[];
  /** GA に送る押下場所。単語名は送らない。 */
  source: BulkFavoriteSource;
};

/**
 * 「覚えていない」一覧の未登録語をまとめてお気に入りに追加する。追加専用で、一括解除はしない。
 * 押せない状態でもフォーカスを失わないよう、disabled ではなく aria-disabled を使う。
 */
export default function StudyBulkFavoriteButton({ slugs, source }: Props) {
  const { favorites, favoritesStatus, addFavorites } = useFavorites();
  const [addedCount, setAddedCount] = useState<number | null>(null);
  const pendingSlugs = pickUnfavoritedSlugs(favorites, slugs);
  // ログイン直後はまだ localStorage の一覧が見えており、未登録数がずれるため待つ
  const isLoading = favoritesStatus === 'loading';
  const isDone = pendingSlugs.length === 0;
  const isUnavailable = isLoading || isDone;

  const handleClick = () => {
    if (isUnavailable) return;
    const count = addFavorites(pendingSlugs);
    if (count === 0) return;
    sendGAEvent('event', 'favorite_bulk_add', { count, source });
    setAddedCount(count);
  };

  // 狭いサイドバーでも語の途中で折り返さないよう、改行してよい位置で区切る
  const labelChunks = isLoading
    ? ['お気に入りを', '読み込み中…']
    : isDone
      ? ['すべて', 'お気に入り済み']
      : ['一括お気に入り', `（${pendingSlugs.length}語）`];
  // 新たな未登録語が増えたら、前回の結果は表示しない
  const message = addedCount !== null && isDone ? `${addedCount}語をお気に入りに追加しました` : '';
  const starColor = isLoading ? 'currentColor' : isDone ? '#F59E0B' : '#D97706';

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        aria-disabled={isUnavailable}
        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-center text-sm font-bold leading-tight transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${
          isUnavailable
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600'
            : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 active:bg-amber-200'
        }`}
      >
        <Star
          size={18}
          aria-hidden
          className="shrink-0"
          fill={!isLoading && isDone ? '#F59E0B' : 'none'}
          color={starColor}
        />
        <span>
          {labelChunks.map((chunk) => (
            <span key={chunk} className="inline-block whitespace-nowrap">{chunk}</span>
          ))}
        </span>
      </button>
      {/* 読み上げ環境へ結果を伝えるため、空でも領域は残す */}
      <p role="status" className={`text-xs font-medium leading-relaxed text-slate-600 ${message ? 'mt-1.5' : ''}`}>
        {message}
      </p>
    </div>
  );
}
