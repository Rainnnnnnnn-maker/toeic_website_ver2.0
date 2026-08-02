"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_COOKIE_NAME,
  type ConsentValue,
} from "@/lib/cookieConsent";

function setConsentCookie(value: ConsentValue) {
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function CookieConsent() {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  const handleAccept = () => {
    setConsentCookie("true");
    setDismissed(true);
    router.refresh();
  };

  const handleDecline = () => {
    setConsentCookie("declined");
    setDismissed(true);
    router.refresh();
  };

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-black/95">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-xs leading-relaxed text-black/70 dark:text-white/70 sm:text-left">
          当サイトでは、利用状況の分析（Google Analytics）にCookieを使用します。許可しない場合も、単語学習機能はそのまま利用できます。詳しくは
          <Link
            href="/privacy"
            prefetch={false}
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            プライバシーポリシー
          </Link>
          をご確認ください。
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleDecline}
            className="rounded-lg border border-black/20 px-6 py-2 text-xs font-medium text-black/70 transition-colors hover:bg-black/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/5"
          >
            同意しない
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
          >
            同意する
          </button>
        </div>
      </div>
    </div>
  );
}
