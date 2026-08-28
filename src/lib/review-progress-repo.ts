import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildReviewProgressRow,
  buildStreakRow,
  parseReviewProgressRow,
  parseStreakRow,
  type ReviewRecord,
  type StreakState,
} from "@/lib/review-schedule";

/**
 * 復習進捗（word_review_progress / learning_streaks）への薄いアクセス層。
 *
 * 行 <-> ドメイン型の変換は review-schedule.ts の純関数に委譲し、ここには
 * クエリの組み立てだけを置く。ネットワークを伴うためユニットテストは書かず、
 * 手動スモークテストで担保する（AGENTS.md のテスト方針）。
 *
 * ブラウザから呼ぶ前提のモジュール。Supabase クライアントは呼び出し側が
 * `@/lib/supabase/client` で生成して渡す。
 */

const PROGRESS_TABLE = "word_review_progress";
const STREAK_TABLE = "learning_streaks";

const PROGRESS_COLUMNS =
  "word_slug, box, review_count, forgot_count, last_reviewed_at, next_review_at";

/** ログイン中ユーザーの復習進捗をすべて取得する（RLS により自分の行のみ）。 */
export async function fetchReviewRecords(
  supabase: SupabaseClient
): Promise<ReviewRecord[]> {
  const { data, error } = await supabase
    .from(PROGRESS_TABLE)
    .select(PROGRESS_COLUMNS);

  if (error) throw error;

  return (data ?? [])
    .map(parseReviewProgressRow)
    .filter((record): record is ReviewRecord => record !== null);
}

/** 1 単語分の進捗を保存する。既存行があれば上書きする。 */
export async function upsertReviewRecord(
  supabase: SupabaseClient,
  userId: string,
  record: ReviewRecord
): Promise<void> {
  const { error } = await supabase
    .from(PROGRESS_TABLE)
    .upsert(buildReviewProgressRow(userId, record), {
      onConflict: "user_id,word_slug",
    });

  if (error) throw error;
}

/** 連続学習日数を取得する。未作成なら初期値が返る。 */
export async function fetchStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<StreakState> {
  const { data, error } = await supabase
    .from(STREAK_TABLE)
    .select("last_study_date, current_streak, best_streak")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return parseStreakRow(data);
}

export async function upsertStreak(
  supabase: SupabaseClient,
  userId: string,
  streak: StreakState
): Promise<void> {
  const { error } = await supabase
    .from(STREAK_TABLE)
    .upsert(buildStreakRow(userId, streak), { onConflict: "user_id" });

  if (error) throw error;
}
