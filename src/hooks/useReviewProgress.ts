"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  buildRecordMap,
  createReviewRecord,
  EMPTY_STREAK,
  gradeRecord,
  nextStreak,
  type ReviewGrade,
  type ReviewRecord,
  type StreakState,
} from "@/lib/review-schedule";
import { getTodayKey } from "@/lib/word-select";
import {
  fetchReviewRecords,
  fetchStreak,
  upsertReviewRecord,
  upsertStreak,
} from "@/lib/review-progress-repo";

export type ReviewProgressStatus = "guest" | "loading" | "ready" | "error";

type LoadedProgress = {
  userId: string;
  authEpoch: number;
  records: Map<string, ReviewRecord>;
  streak: StreakState;
};

const EMPTY_RECORDS: Map<string, ReviewRecord> = new Map();

// 同じユーザーでもログアウトを挟んだ古い取得結果は使わない（FavoritesContext と同じ規約）。
function isCurrentSession(
  session: { userId: string; authEpoch: number } | null,
  userId: string | null,
  authEpoch: number
): boolean {
  return (
    session !== null &&
    userId !== null &&
    session.userId === userId &&
    session.authEpoch === authEpoch
  );
}

/**
 * ログイン中ユーザーの復習進捗（Supabase）を読み書きするフック。
 *
 * - 復習導線はログイン必須の機能なので、未ログイン時は "guest" を返すだけで
 *   localStorage へのフォールバックはしない。
 * - 採点は楽観的更新 + 投げっぱなしの upsert（FavoritesContext と同じ流儀）。
 *   失敗しても次回採点時に最新値で上書きされるため、恒久的な破損はしない。
 */
export function useReviewProgress() {
  const { user, isAuthLoading, authEpoch } = useAuth();
  const userId = user?.id ?? null;

  const [loaded, setLoaded] = useState<LoadedProgress | null>(null);
  const [failedSession, setFailedSession] = useState<{
    userId: string;
    authEpoch: number;
  } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [hasSyncError, setHasSyncError] = useState(false);

  const isReady = isCurrentSession(loaded, userId, authEpoch);
  const hasFailed = isCurrentSession(failedSession, userId, authEpoch);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const supabase = createClient();

    const load = async () => {
      try {
        const [records, streak] = await Promise.all([
          fetchReviewRecords(supabase),
          fetchStreak(supabase, userId),
        ]);
        if (cancelled) return;
        setLoaded({
          userId,
          authEpoch,
          records: buildRecordMap(records),
          streak,
        });
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load review progress from Supabase", error);
        setFailedSession({ userId, authEpoch });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, authEpoch, reloadToken]);

  const status: ReviewProgressStatus = (() => {
    if (isAuthLoading) return "loading";
    if (!userId) return "guest";
    if (isReady) return "ready";
    if (hasFailed) return "error";
    return "loading";
  })();

  /** 採点を 1 件記録する。ログイン中かつ読み込み完了時のみ有効。 */
  const recordGrade = (slug: string, grade: ReviewGrade) => {
    if (!userId || !isReady || loaded === null) return;

    const now = new Date();
    const current = loaded.records.get(slug) ?? createReviewRecord(slug);
    const graded = gradeRecord(current, grade, now);
    const updatedStreak = nextStreak(loaded.streak, getTodayKey(now));
    const streakChanged = updatedStreak !== loaded.streak;

    setLoaded((previous) => {
      if (previous === null) return previous;
      const records = new Map(previous.records);
      records.set(slug, graded);
      return { ...previous, records, streak: updatedStreak };
    });

    // 「覚えていない」の直後は単語詳細へ遷移してアンマウントされるため、
    // ここで同期的にリクエストを投げておく（完了は待たない）。
    const supabase = createClient();
    upsertReviewRecord(supabase, userId, graded).catch((error) => {
      console.error("Failed to save review progress to Supabase", error);
      setHasSyncError(true);
    });

    if (streakChanged) {
      upsertStreak(supabase, userId, updatedStreak).catch((error) => {
        console.error("Failed to save learning streak to Supabase", error);
        setHasSyncError(true);
      });
    }
  };

  const retry = () => {
    setFailedSession(null);
    setReloadToken((token) => token + 1);
  };

  return {
    status,
    records: isReady && loaded !== null ? loaded.records : EMPTY_RECORDS,
    streak: isReady && loaded !== null ? loaded.streak : EMPTY_STREAK,
    hasSyncError,
    recordGrade,
    retry,
  };
}
