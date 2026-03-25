import "server-only";
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const secret = process.env.REVALIDATION_TOKEN;

  // トークンが設定されていない、または一致しない場合は拒否
  // 開発環境ではトークンチェックをスキップすることも可能ですが、
  // 安全のため設定を推奨します。
  if (!secret || token !== secret) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // maxを指定すると、データはstale（古い）とマークされ、
  // 次のリクエストではstaleなデータを返しつつバックグラウンドで再取得します（stale-while-revalidate）。
  // 即時反映が必要な場合は { expire: 0 } を使用しますが、通常は 'max' が推奨されます。
  revalidateTag('word-list', 'max');
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
