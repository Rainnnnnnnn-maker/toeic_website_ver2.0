import "server-only";
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { safeEqual } from '@/lib/safe-compare';

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

  // 'today-recommended-words' タグを無効化し、次回アクセス時に当日分を再選定
  revalidateTag('today-recommended-words', 'max');
  return NextResponse.json({ revalidated: true, tag: 'today-recommended-words', now: Date.now() });
}
