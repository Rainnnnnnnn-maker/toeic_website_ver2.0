"use client";

import { useEffect, useRef } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { TriangleAlert } from "lucide-react";
import type { Word } from "@/data/words";
import { buildWordMap } from "@/lib/study-utils";
import { getTodayKey } from "@/lib/word-select";
import {
  countReviewedOnDay,
  countReviewedSince,
  getDueSlugs,
  getRetentionLevel,
  getLastWeekStart,
  getNextDueAt,
  getWeakSlugs,
  resolveDisplayStreak,
  sortByRecentReview,
  summarizeReview,
  REVIEW_SESSION_LIMIT,
  type ReviewRecord,
  type StreakState,
} from "@/lib/review-schedule";
import RetentionBreakdown from "@/components/features/mypage/RetentionBreakdown";
import StreakPanel from "@/components/features/mypage/StreakPanel";
import TodayReviewCard from "@/components/features/mypage/TodayReviewCard";
import WeakWordsPanel from "@/components/features/mypage/WeakWordsPanel";

type Props = {
  allWords: Word[];
  /** Supabase から取得済みのお気に入り（登録が古い順） */
  favorites: string[];
  records: ReadonlyMap<string, ReviewRecord>;
  streak: StreakState;
  hasSyncError: boolean;
};

/**
 * マイページの集計パーツ（今日の復習・継続・定着度・苦手単語）。
 * Supabase のデータが揃ってからのみマウントされ、それまでは
 * MyPageClient が同じ位置に MyPageDashboardFallback を表示する。
 *
 * 現在時刻に依存する集計をここに閉じ込めることで、プリレンダリング時に
 * `new Date()` が評価されない（Cache Components の制約）。
 */
export default function MyPageDashboard({
  allWords,
  favorites,
  records,
  streak,
  hasSyncError,
}: Props) {
  const now = new Date();
  const todayKey = getTodayKey(now);
  const wordBySlug = buildWordMap(allWords);
  // 単語リストから消えた slug は集計に含めない
  const favoriteSlugs = favorites.filter((slug) => wordBySlug.has(slug));

  const summary = summarizeReview(favoriteSlugs, records, now);
  const dueCount = getDueSlugs(favoriteSlugs, records, now).length;
  const sessionCount = Math.min(dueCount, REVIEW_SESSION_LIMIT);
  const reviewedToday = countReviewedOnDay(favoriteSlugs, records, todayKey);
  const weeklyReviewedCount = countReviewedSince(
    favoriteSlugs,
    records,
    getLastWeekStart(now)
  );
  const nextDueAt = getNextDueAt(favoriteSlugs, records, now);
  const currentStreak = resolveDisplayStreak(streak, todayKey);

  // 定着度別一覧は最近採点した順（定着済みなら最近覚えた順）に並べる
  const retentionWords = sortByRecentReview(favoriteSlugs, records).map((slug) => ({
    word: wordBySlug.get(slug)!,
    level: getRetentionLevel(records.get(slug)),
  }));
  const weakSessionCount = getWeakSlugs(favoriteSlugs, records, REVIEW_SESSION_LIMIT).length;

  const weakItems = getWeakSlugs(favoriteSlugs, records)
    .map((slug) => {
      const word = wordBySlug.get(slug);
      return word
        ? { word, forgotCount: records.get(slug)?.forgotCount ?? 0 }
        : null;
    })
    .filter((item): item is { word: Word; forgotCount: number } => item !== null);

  // 表示計測はマウント時に 1 回だけ送る（Strict Mode の二重実行を ref で抑える）
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    sendGAEvent("event", "mypage_view", {
      due_count: dueCount,
      favorite_count: favoriteSlugs.length,
      streak: currentStreak,
    });
  }, [dueCount, favoriteSlugs.length, currentStreak]);

  return (
    <>
      {hasSyncError && (
        <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <TriangleAlert size={14} />
          一部の学習記録を保存できませんでした。次回の復習時に再送されます。
        </p>
      )}

      <TodayReviewCard
        dueCount={dueCount}
        sessionCount={sessionCount}
        reviewedToday={reviewedToday}
        totalFavorites={favoriteSlugs.length}
        nextDueAt={nextDueAt}
      />

      <StreakPanel
        currentStreak={currentStreak}
        bestStreak={streak.bestStreak}
        weeklyReviewedCount={weeklyReviewedCount}
      />

      {favoriteSlugs.length > 0 && <RetentionBreakdown summary={summary} words={retentionWords} />}

      <WeakWordsPanel items={weakItems} sessionCount={weakSessionCount} />
    </>
  );
}
