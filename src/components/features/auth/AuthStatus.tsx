"use client";

import Link from "next/link";
import { CircleUserRound, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ホーム上部などに置くコンパクトなログイン状態表示。
// 隣に並ぶ SNS シェアボタン（32px 丸アイコン）と高さを揃えたピル型 UI。
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
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
      >
        <CircleUserRound size={16} className="text-emerald-600" />
        ログイン
      </Link>
    );
  }

  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;
  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : (user.email ?? undefined);

  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 py-0 pl-1 pr-3 shadow-sm"
        title={displayName}
      >
        <span className="relative">
          {avatarUrl ? (
            // Vercel の画像最適化コストを避けるため next/image は使わない（外部アバターの小画像のみ）
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-6 w-6 rounded-full border border-white"
            />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <UserRound size={14} />
            </span>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500" />
        </span>
        <span className="text-xs font-bold text-emerald-700">ログイン中</span>
      </span>
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
