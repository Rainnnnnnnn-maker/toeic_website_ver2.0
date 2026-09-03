import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Supabase Auth のセッションリフレッシュ専用 proxy。
// Vercel の Proxy 実行量を抑えるため、matcher は認証関連ページに最小化している
// （認証状態の表示はクライアント側 onAuthStateChange で解決する方針。
//   docs/operations/phase1-login-favorites-sync-setup.md §6 N-1 / N-2 参照）。
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() がトークン検証と cookie 更新（期限切れ時のリフレッシュ）を行う
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/login", "/auth/:path*"],
};
