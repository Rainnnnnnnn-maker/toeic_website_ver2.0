"use client";

import Link, { useLinkStatus } from "next/link";
import { CircleUserRound, LoaderCircle, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MyPageLinkButton from "@/components/features/mypage/MyPageLinkButton";

function LoginLinkContent() {
  const { pending } = useLinkStatus();

  return (
    <span className="inline-flex items-center gap-1.5" aria-live="polite">
      {pending ? (
        <>
          <span className="animate-spin text-emerald-600 motion-reduce:animate-none" aria-hidden>
            <LoaderCircle size={16} />
          </span>
          <span>移動中…</span>
        </>
      ) : (
        <>
          <CircleUserRound size={16} className="text-emerald-600" aria-hidden />
          <span>ログイン</span>
        </>
      )}
    </span>
  );
}

// ホーム上部の認証導線。未ログイン時はログイン、ログイン済みなら
// 同じ位置をマイページ導線へ切り替え、ログアウト操作を隣に置く。
export function AuthStatus() {
  const { user, isAuthLoading, signOut } = useAuth();

  if (isAuthLoading) {
    // 判定中はほぼ同サイズのスケルトンを出してレイアウトシフトを防ぐ
    return <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        prefetch={false}
        className="inline-flex h-8 w-24 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
      >
        <LoginLinkContent />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MyPageLinkButton />
      <button
        type="button"
        onClick={signOut}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
      >
        <LogOut size={13} />
        ログアウト
      </button>
    </div>
  );
}
