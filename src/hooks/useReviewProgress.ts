"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  buildRecordMap,
  createReviewRecord,
  EMPTY_STREAK,
  gradeRecord,
  mergePendingReviewRecord,
  mergePendingStreak,
  nextStreak,
  type ReviewGrade,
  type ReviewRecord,
  type StreakState,
} from "@/lib/review-schedule";
import { getTodayKey } from "@/lib/word-select";
import {
  fetchReviewRecords,
  fetchStreak,
  flushReviewProgressOutbox,
} from "@/lib/review-progress-repo";
import {
  acknowledgeReviewRecord,
  acknowledgeReviewStreak,
  enqueueReviewRecord,
  enqueueReviewStreak,
  hasPendingReviewProgress,
  readReviewProgressOutbox,
} from "@/lib/review-progress-outbox";

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
 * - 採点は楽観的更新し、ユーザー別アウトボックスへ同期保存してから upsert する。
 *   失敗分は次回マウントまたは次回採点で再送する。
 */
export function useReviewProgress() {
  const { user, isAuthLoading, authEpoch } = useAuth();
  const userId = user?.id ?? null;

  const [loaded, setLoaded] = useState<LoadedProgress | null>(null);
  const loadedRef = useRef<LoadedProgress | null>(null);
  const [failedSession, setFailedSession] = useState<{
    userId: string;
    authEpoch: number;
  } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [syncErrorSession, setSyncErrorSession] = useState<{
    userId: string;
    authEpoch: number;
  } | null>(null);

  const isReady = isCurrentSession(loaded, userId, authEpoch);
  const hasFailed = isCurrentSession(failedSession, userId, authEpoch);
  const hasSyncError = isCurrentSession(syncErrorSession, userId, authEpoch);

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
        const recordMap = buildRecordMap(records);
        const outbox = readReviewProgressOutbox(userId);
        for (const pending of outbox.records) {
          const server = recordMap.get(pending.slug);
          const merged = mergePendingReviewRecord(server, pending);
          recordMap.set(pending.slug, merged);
          if (merged === server) acknowledgeReviewRecord(userId, pending);
          else if (merged !== pending) enqueueReviewRecord(userId, merged);
        }

        const mergedStreak = outbox.streak
          ? mergePendingStreak(streak, outbox.streak)
          : streak;
        if (outbox.streak) {
          const serverAlreadyNewer =
            mergedStreak.lastStudyDateKey === streak.lastStudyDateKey &&
            mergedStreak.currentStreak === streak.currentStreak &&
            mergedStreak.bestStreak === streak.bestStreak;
          if (serverAlreadyNewer) acknowledgeReviewStreak(userId, outbox.streak);
          else enqueueReviewStreak(userId, mergedStreak);
        }

        const nextLoaded = {
          userId,
          authEpoch,
          records: recordMap,
          streak: mergedStreak,
        };
        loadedRef.current = nextLoaded;
        setLoaded(nextLoaded);
        flushReviewProgressOutbox(supabase, userId)
          .then(() => {
            if (cancelled || hasPendingReviewProgress(userId)) return;
            setSyncErrorSession((current) =>
              isCurrentSession(current, userId, authEpoch) ? null : current
            );
          })
          .catch((error) => {
            if (cancelled) return;
            console.error("Failed to save review progress to Supabase", error);
            setSyncErrorSession({ userId, authEpoch });
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
    const currentLoaded = loadedRef.current;
    if (
      !userId ||
      currentLoaded === null ||
      !isCurrentSession(currentLoaded, userId, authEpoch)
    ) {
      return;
    }

    const now = new Date();
    const current = currentLoaded.records.get(slug) ?? createReviewRecord(slug);
    const graded = gradeRecord(current, grade, now);
    const updatedStreak = nextStreak(currentLoaded.streak, getTodayKey(now));
    const streakChanged = updatedStreak !== currentLoaded.streak;
    const records = new Map(currentLoaded.records);
    records.set(slug, graded);
    const nextLoaded = { ...currentLoaded, records, streak: updatedStreak };
    loadedRef.current = nextLoaded;
    setLoaded(nextLoaded);

    // 遷移・アンマウントより前にアウトボックスへ同期保存してから送信を開始する。
    enqueueReviewRecord(userId, graded);

    if (streakChanged) {
      enqueueReviewStreak(userId, updatedStreak);
    }
    flushReviewProgressOutbox(createClient(), userId)
      .then(() => {
        if (hasPendingReviewProgress(userId)) return;
        setSyncErrorSession((current) =>
          isCurrentSession(current, userId, authEpoch) ? null : current
        );
      })
      .catch((error) => {
        console.error("Failed to save review progress to Supabase", error);
        setSyncErrorSession({ userId, authEpoch });
      });
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
