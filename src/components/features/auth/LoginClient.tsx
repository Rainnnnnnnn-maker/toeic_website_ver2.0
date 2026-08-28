"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNextPath } from "@/lib/auth-redirect";
import { LoginCardFallback } from "@/components/features/auth/LoginFallback";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function LoginClient() {
  const { user, isAuthLoading, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  // マイページのログインゲートなど、戻り先を指定された場合に引き継ぐ
  const nextPath = sanitizeNextPath(searchParams.get("next"));

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setClientError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) {
      console.error("Failed to start Google sign-in", error);
      setClientError(
        "ログインを開始できませんでした。時間をおいて再度お試しください。"
      );
      setIsSigningIn(false);
    }
    // 成功時は Google の認証画面へリダイレクトされる
  };

  if (isAuthLoading) {
    return <LoginCardFallback />;
  }

  if (user) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <UserRound size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800">ログイン中です</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          お気に入りはアカウントに保存され、他の端末でも同じお気に入りを利用できます。
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={nextPath}
            prefetch={false}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            {nextPath === "/"
              ? "トップへ戻る"
              : nextPath === "/mypage"
                ? "マイページへ"
                : "元のページへ戻る"}
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <LogOut size={14} />
            ログアウト
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-slate-900">ログイン</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          ログインは<strong>任意</strong>です。複数の端末でお気に入りを同期したい方向けの機能で、ログインしなくてもすべての学習機能を今まで通り無料で利用できます。
        </p>
      </div>

      {(callbackError || clientError) && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {clientError ??
            "ログインに失敗しました。時間をおいて再度お試しください。"}
        </p>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSigningIn}
        className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <GoogleLogo />
        {isSigningIn ? "リダイレクト中..." : "Google でログイン"}
      </button>

      <ul className="flex list-inside list-disc flex-col gap-1 text-xs leading-relaxed text-slate-500">
        <li>初回ログイン時に、この端末のお気に入りがアカウントへ引き継がれます。</li>
        <li>
          保存されるのはお気に入りの単語とメールアドレス等のアカウント情報のみです。詳しくは
          <Link
            href="/privacy"
            prefetch={false}
            className="text-blue-600 underline hover:text-blue-800"
          >
            プライバシーポリシー
          </Link>
          をご覧ください。
        </li>
      </ul>

      <div className="flex items-center">
        <Link
          href="/"
          prefetch={false}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
