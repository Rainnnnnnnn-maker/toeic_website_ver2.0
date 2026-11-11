import "server-only";
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ensureDailyQuiz, type QuizGenerationResult } from '@/data/daily-quiz';
import { classifyUpstreamFailure } from '@/lib/http-retry';
import { safeEqual } from '@/lib/safe-compare';
import { getTodayKey, parseTodayDateKey } from '@/lib/word-select';

// クイズの生成（Gemini 2 依頼 x 最大 2 試行 x 10 秒 + 代替用の Redis 読み取り）が収まる上限
export const maxDuration = 60;

// Vercel Cron からは Authorization: Bearer <CRON_SECRET> ヘッダ、
// 手動実行時は ?token=<REVALIDATION_TOKEN> クエリの両方を受け付ける
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const authHeader = request.headers.get('authorization');
  const secret = process.env.REVALIDATION_TOKEN;
  const cronSecret = process.env.CRON_SECRET;

  const bearer = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;
  const validQueryToken = safeEqual(token, secret);
  const validCronAuth = safeEqual(bearer, cronSecret);

  if (!validQueryToken && !validCronAuth) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // 手動実行用。quizDate=YYYY-MM-DD で過去1週間以内の日を指定でき、quiz=regenerate で作り直す
  const quizDateParam = request.nextUrl.searchParams.get('quizDate');
  const quizDate = quizDateParam === null ? undefined : parseTodayDateKey(quizDateParam);
  const force = request.nextUrl.searchParams.get('quiz') === 'regenerate';

  // 当日のクイズを先に用意してから再検証する（再描画されたページが Redis から読めるようにするため）。
  // クイズの生成に失敗しても「今日の6単語」の切り替えは止めない。
  let quiz: QuizGenerationResult;
  if (quizDate === null) {
    quiz = { status: 'failed', dateKey: '', reason: 'invalid-quiz-date' };
  } else {
    try {
      quiz = await ensureDailyQuiz({ dateKey: quizDate, force });
    } catch (error) {
      const { reason } = classifyUpstreamFailure(error);
      console.error('[daily-quiz] generation failed:', reason);
      quiz = { status: 'failed', dateKey: quizDate ?? getTodayKey(), reason };
    }
  }

  // 'today-recommended-words' タグを無効化し、次回アクセス時に当日分を再選定
  revalidateTag('today-recommended-words', 'max');
  return NextResponse.json({ revalidated: true, tag: 'today-recommended-words', now: Date.now(), quiz });
}
