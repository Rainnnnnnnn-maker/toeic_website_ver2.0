import "server-only";
import { GoogleGenAI } from "@google/genai";
import { cacheLife, cacheTag } from "next/cache";
import { getEditorialWord } from "@/data/word-editorial";
import { getWordDetail } from "@/data/word-detail";
import { getAllWords, getTodayRecommendedSelection, type Word } from "@/data/words";
import {
  DAILY_QUIZ_VERSION,
  QUIZ_HISTORY_DAYS,
  buildDailyQuizQuestion,
  buildFallbackDistractors,
  listRecentDateKeys,
  filterAiDistractors,
  pickVerifiedDistractors,
  quizMatchesWords,
  type DailyQuiz,
  type DailyQuizQuestion,
  type QuizDay,
} from "@/lib/daily-quiz";
import { getStoredQuizzes, setStoredQuiz } from "@/lib/daily-quiz-cache";
import { generateQuizDistractors, verifyQuizDistractors } from "@/lib/daily-quiz-gemini";
import { HTTP_TIMEOUT_MS, classifyUpstreamFailure, runWithTimeout } from "@/lib/http-retry";
import { toQuizSourceWord, type QuizSourceWord } from "@/lib/quiz-question-builder";
import { getRedis } from "@/lib/upstash";
import { parseStoredWordDetails } from "@/lib/word-detail-parse";
import { TODAY_WORDS_COUNT, getTodayKey, getWordListVersion, selectTodayWords } from "@/lib/word-select";

const REDIS_MGET_BATCH = 100;

export type RecentQuizzes = {
  /** 画面の「今日」。サイトの「今日の6単語」と同じ日付キー */
  todayKey: string;
  /** 今日から過去へ並べた解ける日。未生成の日は quiz が null */
  days: QuizDay[];
};

/**
 * クイズ画面に渡す直近のクイズ（今日を含む QUIZ_HISTORY_DAYS 日分）を返す。
 *
 * ここでは Redis を読むだけで、Gemini は呼ばない。生成は日次 Cron
 * （`/api/revalidate/today-words` → `ensureDailyQuiz`）だけが行う。
 * 「今日」は `getTodayRecommendedSelection()` の日付キーに合わせるため、
 * サイトに表示中の6語とクイズの6語が食い違わない。
 *
 * 当日分が揃っていれば翌朝の Cron による再検証まで保持する。欠けている間
 * （生成前・生成失敗・Redis の一時的な障害）は1時間ごとに読み直し、手作業なしで回復させる。
 */
export async function getRecentQuizzes(): Promise<RecentQuizzes> {
  "use cache";
  cacheTag("today-recommended-words", "word-list");

  const selection = await getTodayRecommendedSelection();
  const dateKeys = listRecentDateKeys(selection.dateKey, QUIZ_HISTORY_DAYS);

  let stored: Array<DailyQuiz | null>;
  try {
    stored = await getStoredQuizzes(dateKeys);
  } catch (error) {
    console.warn("[daily-quiz] failed to read quizzes:", classifyUpstreamFailure(error).reason);
    stored = dateKeys.map(() => null);
  }

  const days = dateKeys.map((dateKey, index) => {
    const quiz = stored[index];
    // 当日分だけは表示中の6語と照合する。単語リストの更新で6語が変わっていたら出さない
    if (index === 0 && quiz && !quizMatchesWords(quiz, selection.words)) return { dateKey, quiz: null };
    return { dateKey, quiz };
  });

  // cacheLife は1回の実行につき1度だけ呼ぶ（分岐ごとに別のプロファイルを選べる）
  if (days[0]?.quiz) cacheLife("max");
  else cacheLife("hours");
  return { todayKey: selection.dateKey, days };
}

export type QuizGenerationResult =
  | { status: "exists"; dateKey: string }
  | { status: "generated"; dateKey: string; ai: number; fallback: number; skipped: number }
  | { status: "failed"; dateKey: string; reason: string };

/** 代替の誤答に使う、収録語すべての訳を Redis から読む（MGET のみ）。 */
async function loadFallbackPool(words: readonly Word[], signal: AbortSignal): Promise<QuizSourceWord[]> {
  const redis = getRedis();
  const pool: QuizSourceWord[] = [];
  for (let offset = 0; offset < words.length; offset += REDIS_MGET_BATCH) {
    signal.throwIfAborted();
    const batch = words.slice(offset, offset + REDIS_MGET_BATCH);
    const values = await redis.mget<unknown[]>(...batch.map((word) => `word:${word.slug}`));
    signal.throwIfAborted();
    batch.forEach((word, index) => {
      // サイトと同じく、編集済みデータがあれば Redis より優先する
      const detail = getEditorialWord(word.slug)?.detail ?? parseStoredWordDetails(values[index]);
      const source = detail ? toQuizSourceWord(word, detail) : null;
      if (source) pool.push(source);
    });
  }
  return pool;
}

async function loadTargets(words: readonly Word[], signal: AbortSignal): Promise<QuizSourceWord[]> {
  const targets: QuizSourceWord[] = [];
  for (const word of words) {
    signal.throwIfAborted();
    try {
      // 共有キャッシュの取得自体はキャンセルできない。完了後も期限を確認し、次の語へ進めない
      const detail = await getWordDetail(word.slug);
      signal.throwIfAborted();
      const source = detail ? toQuizSourceWord(word, detail) : null;
      if (source) targets.push(source);
    } catch (error) {
      signal.throwIfAborted();
      console.warn("[daily-quiz] word detail unavailable:", classifyUpstreamFailure(error).reason);
    }
  }
  return targets;
}

/**
 * Gemini で誤答を用意する。語ごとに「作らせる → 機械的に検証 → 別の依頼で確認」を通し、
 * 3つ残った語だけ結果に入れる。Gemini を使えない・失敗した場合は空の Map を返し、
 * 呼び出し側がすべての語を代替の誤答に切り替える。
 */
async function buildAiDistractors(targets: readonly QuizSourceWord[], signal: AbortSignal): Promise<Map<string, string[]>> {
  signal.throwIfAborted();
  const result = new Map<string, string[]>();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[daily-quiz] GEMINI_API_KEY is not configured; using fallback distractors");
    return result;
  }

  try {
    // retryOptions を指定すると SDK が 429 も再送する。再送は daily-quiz-gemini.ts の共通ラッパーに任せる
    const client = new GoogleGenAI({ apiKey });
    const candidates = await generateQuizDistractors(client, targets, signal);
    signal.throwIfAborted();

    const toVerify = targets.flatMap((target) => {
      const { accepted, rejected } = filterAiDistractors(target, candidates.get(target.slug));
      if (rejected.length > 0) console.info("[daily-quiz] AI candidates rejected:", rejected.join(","));
      // 確認で落ちる分を見込んでも3つに届かない語は、確認に出さない
      return accepted.length >= 3 ? [{ target, distractors: accepted }] : [];
    });
    if (toVerify.length === 0) return result;

    const invalid = await verifyQuizDistractors(client, toVerify, signal);
    signal.throwIfAborted();
    for (const { target, distractors } of toVerify) {
      const flagged = invalid.get(target.slug);
      // 確認の応答に含まれなかった語は未確認として扱い、AI の誤答を使わない
      const verified = flagged ? pickVerifiedDistractors(distractors, flagged) : null;
      if (verified) result.set(target.slug, verified);
    }
  } catch (error) {
    signal.throwIfAborted();
    console.warn("[daily-quiz] Gemini request failed:", classifyUpstreamFailure(error).reason);
    return new Map();
  }
  return result;
}

/**
 * 指定した日（既定は今日）のクイズを用意して Redis に保存する。日次 Cron から1日1回呼ばれる。
 *
 * 1. その日の6語を、キャッシュ済みの「今日の6単語」ではなく単語リストから計算する
 *    （Cron は再検証の前にこれを呼ぶため、キャッシュはまだ前日の内容）。
 * 2. 保存済みで6語が一致していれば何もしない。Cron の再実行で Gemini を呼び直さない。
 * 3. 正解は既存の訳。誤答だけ Gemini に依頼し、語ごとに検証と確認を通す。
 * 4. 3つ残らなかった語は、他の収録語の訳から誤答を選ぶ。
 */
export async function ensureDailyQuiz(
  options: { dateKey?: string; force?: boolean } = {},
): Promise<QuizGenerationResult> {
  return runWithTimeout((signal) => generateDailyQuiz(options, signal), {
    timeoutMs: HTTP_TIMEOUT_MS.quizGeneration,
    label: "daily quiz generation",
  });
}

async function generateDailyQuiz(
  options: { dateKey?: string; force?: boolean },
  signal: AbortSignal,
): Promise<QuizGenerationResult> {
  const todayKey = getTodayKey();
  const dateKey = options.dateKey ?? todayKey;
  if (!listRecentDateKeys(todayKey, QUIZ_HISTORY_DAYS).includes(dateKey)) {
    return { status: "failed", dateKey, reason: "date-out-of-range" };
  }

  const allWords = await getAllWords();
  signal.throwIfAborted();
  const picks = selectTodayWords(allWords, dateKey, TODAY_WORDS_COUNT);
  if (picks.length === 0) return { status: "failed", dateKey, reason: "empty-word-list" };

  if (!options.force) {
    const [existing] = await getStoredQuizzes([dateKey]);
    signal.throwIfAborted();
    if (existing && quizMatchesWords(existing, picks)) return { status: "exists", dateKey };
  }

  const targets = await loadTargets(picks, signal);
  if (targets.length === 0) return { status: "failed", dateKey, reason: "no-usable-words" };

  const aiDistractors = await buildAiDistractors(targets, signal);
  signal.throwIfAborted();
  const questions = new Map<string, DailyQuizQuestion>();
  const needsFallback: QuizSourceWord[] = [];
  for (const target of targets) {
    const distractors = aiDistractors.get(target.slug);
    if (distractors) questions.set(target.slug, buildDailyQuizQuestion(dateKey, target, distractors, "ai"));
    else needsFallback.push(target);
  }
  const aiCount = questions.size;

  if (needsFallback.length > 0) {
    let pool: QuizSourceWord[] = [];
    try {
      pool = await loadFallbackPool(allWords, signal);
    } catch (error) {
      signal.throwIfAborted();
      console.warn("[daily-quiz] fallback pool unavailable:", classifyUpstreamFailure(error).reason);
    }
    for (const target of needsFallback) {
      const distractors = buildFallbackDistractors(target, pool);
      if (distractors) questions.set(target.slug, buildDailyQuizQuestion(dateKey, target, distractors, "fallback"));
    }
  }

  const ordered = picks.flatMap((word) => {
    const question = questions.get(word.slug);
    return question ? [question] : [];
  });
  if (ordered.length === 0) return { status: "failed", dateKey, reason: "no-questions" };

  signal.throwIfAborted();
  await setStoredQuiz({
    version: DAILY_QUIZ_VERSION,
    dateKey,
    wordListVersion: getWordListVersion(allWords),
    generatedAt: new Date().toISOString(),
    questions: ordered,
  });

  return {
    status: "generated",
    dateKey,
    ai: aiCount,
    fallback: ordered.length - aiCount,
    skipped: picks.length - ordered.length,
  };
}
