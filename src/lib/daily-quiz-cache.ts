import "server-only";
import {
  QUIZ_RETENTION_DAYS,
  parseStoredDailyQuiz,
  quizCacheKey,
  type DailyQuiz,
} from "./daily-quiz";
import { getRedis } from "./upstash";

/**
 * 日次クイズの保存先（Upstash Redis）。キーは `quiz:v1:<dateKey>`。
 * 生成は1日1回なので、単語詳細の L2 キャッシュと違い「消えたら作り直す」前提ではない。
 * 保持期間を過ぎた日のクイズは TTL で自然に消える。
 */

/** 指定した日付のクイズをまとめて読む。未生成や壊れた値は null。 */
export async function getStoredQuizzes(dateKeys: readonly string[]): Promise<Array<DailyQuiz | null>> {
  if (dateKeys.length === 0) return [];
  const values = await getRedis().mget<unknown[]>(...dateKeys.map(quizCacheKey));
  return dateKeys.map((dateKey, index) => {
    const quiz = parseStoredDailyQuiz(values[index]);
    // キーと中身の日付が食い違う値は使わない
    return quiz && quiz.dateKey === dateKey ? quiz : null;
  });
}

export async function setStoredQuiz(quiz: DailyQuiz): Promise<void> {
  await getRedis().set(quizCacheKey(quiz.dateKey), JSON.stringify(quiz), {
    ex: QUIZ_RETENTION_DAYS * 24 * 60 * 60,
  });
}
