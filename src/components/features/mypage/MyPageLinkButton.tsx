"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Props = {
  /** pill: AuthStatus 内の小さめのボタン / solid: 各ページのヘッダー CTA */
  variant?: "pill" | "solid";
};

/**
 * マイページへの導線。ログイン必須の画面なので、
 * ログイン中のユーザーにだけ表示する（壁に突き当たる導線を作らない）。
 */
export default function MyPageLinkButton({ variant = "pill" }: Props) {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading || !user) return null;

  if (variant === "solid") {
    return (
      <Link
        href="/mypage"
        prefetch={false}
        className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-lg font-bold text-sm shadow-[0_4px_14px_0_rgba(5,150,105,0.39)] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
      >
        <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
          <div className="relative h-full w-8 bg-white/20" />
        </div>
        <LayoutDashboard size={16} className="transition-transform group-hover:scale-110" />
        <span className="relative z-10">マイページ</span>
      </Link>
    );
  }

  return (
    <Link
      href="/mypage"
      prefetch={false}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 text-xs font-bold text-emerald-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
    >
      <LayoutDashboard size={14} />
      マイページ
    </Link>
  );
}
