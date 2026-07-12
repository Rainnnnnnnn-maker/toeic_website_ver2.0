"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function Footer() {
  const [year, setYear] = useState<number | null>(null);
  const { user, isAuthLoading, signOut } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-black/60 dark:text-white/60">
          <Link
            href="/"
            prefetch={false}
            className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
          >
            トップ
          </Link>
          <Link
            href="/about"
            prefetch={false}
            className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
          >
            当サイトについて
          </Link>
          <Link
            href="/guide"
            prefetch={false}
            className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
          >
            学習ガイド
          </Link>
          <Link
            href="/privacy"
            prefetch={false}
            className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/terms"
            prefetch={false}
            className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
          >
            利用規約
          </Link>
          <Link
            href="/contact"
            prefetch={false}
            className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
          >
            お問い合わせ
          </Link>
          <Link
            href="/donate"
            prefetch={false}
            className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
          >
            寄付のお願い
          </Link>
          {!isAuthLoading &&
            (user ? (
              <button
                type="button"
                onClick={signOut}
                className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
              >
                ログアウト
              </button>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className="underline underline-offset-4 hover:text-black/80 dark:hover:text-white/80"
              >
                ログイン
              </Link>
            ))}
        </div>
        <p className="mt-4 text-center text-xs text-black/40 dark:text-white/40">
          © {year ? `${year} ` : ""}TOEIC重要単語
        </p>
      </div>
    </footer>
  );
}
