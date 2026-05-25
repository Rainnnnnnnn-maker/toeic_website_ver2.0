import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Server Actions以外のページに対するPOSTリクエストを弾く
  // (APIルートはmatcherで除外されているためここには到達しない)
  if (
    request.method === "POST" &&
    !request.headers.get("Next-Action")
  ) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 以下のパスで始まるもの以外のすべてのリクエストパスにマッチさせます：
     * - api (APIルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - public/ や metadata routes の拡張子付き静的ファイル
     */
    '/((?!api|_next/static|_next/image|.*\\..*$).*)',
  ],
};
