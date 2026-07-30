import "server-only";
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { deleteWordDetails } from '@/lib/wordCache';
import { safeEqual } from '@/lib/safe-compare';
import { getWordBySlug } from '@/data/words';
import { getWordDetailFresh } from '@/data/word-detail';
import { upsertWordEmbedding } from '@/lib/word-embedding';
import { isVectorConfigured } from '@/lib/vector';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const slug = request.nextUrl.searchParams.get('slug');
  const clearUpstash = request.nextUrl.searchParams.get('upstash') === 'true';
  const refreshVector = request.nextUrl.searchParams.get('vector') === 'true';
  const secret = process.env.REVALIDATION_TOKEN;

  if (!safeEqual(token, secret)) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json({ message: 'Missing slug parameter' }, { status: 400 });
  }

  try {
    // 1. Upstash Redis (L2) のキャッシュを削除 (upstash=true の場合のみ)
    if (clearUpstash) {
      await deleteWordDetails(slug);
    }

    // 2. Next.js Data Cache (L1) をパージ
    const revalidateTagForWord = `word-detail-${slug}`;
    revalidateTag(revalidateTagForWord, 'max');

    // 3. Upstash Vector の embedding を再生成 (vector=true の場合のみ)。
    //    L1 パージ直後のため getWordDetailFresh で L2/L3 から最新内容を取得し、
    //    表示内容と embedding のズレを防ぐ。upstash=true と併用すると Gemini で再生成される。
    let vectorUpdated = false;
    if (refreshVector && isVectorConfigured()) {
      const entry = await getWordBySlug(slug);
      const detail = entry ? await getWordDetailFresh(slug) : null;
      if (entry && detail) {
        await upsertWordEmbedding(entry, detail);
        vectorUpdated = true;
      }
    }

    return NextResponse.json({
      revalidated: true,
      slug,
      vectorUpdated,
      message: `Cache for word '${slug}' has been cleared.`
    });
  } catch (error) {
    console.error("Failed to revalidate word:", error);
    return NextResponse.json({ 
      message: 'Failed to revalidate word', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
