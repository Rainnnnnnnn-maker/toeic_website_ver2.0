import "server-only";
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { deleteWordDetails } from '@/lib/wordCache';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const slug = request.nextUrl.searchParams.get('slug');
  const secret = process.env.REVALIDATION_TOKEN;

  if (!secret || token !== secret) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json({ message: 'Missing slug parameter' }, { status: 400 });
  }

  try {
    // 1. Upstash Redis (L2) のキャッシュを削除
    await deleteWordDetails(slug);

    // 2. Next.js Data Cache (L1) をパージ
    const revalidateTagForWord = `word-detail-${slug}`;
    revalidateTag(revalidateTagForWord, 'max');

    return NextResponse.json({ 
      revalidated: true, 
      slug,
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
