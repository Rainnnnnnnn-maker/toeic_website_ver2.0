"use client";

import { LogOut, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User;
  onSignOut: () => void;
};

/** マイページ上部のアカウント行。表示する情報は必要最小限に留める。 */
export default function MyPageAccountCard({ user, onSignOut }: Props) {
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;
  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : (user.email ?? "ログイン中");

  return (
    <section className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative shrink-0">
          {avatarUrl ? (
            // 外部アバターの小画像のみ。Vercel の画像最適化コストを避けるため next/image は使わない
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-full border border-white shadow-sm"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <UserRound size={18} />
            </span>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">
            {displayName}
          </p>
          <p className="text-xs text-slate-500">
            復習の記録はアカウントに保存され、他の端末でも続きから学習できます
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
      >
        <LogOut size={13} />
        ログアウト
      </button>
    </section>
  );
}
