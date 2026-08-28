import { sendGAEvent } from "@next/third-parties/google";

/**
 * マイページの計測イベント。クライアントコンポーネントから直接呼ぶため、
 * 親からコールバックを配る必要はない（"use client" は付けないこと）。
 */
export type MyPageCtaTarget =
  | "review_due"
  | "review_all"
  | "review_weak"
  | "listen"
  | "favorites"
  | "study"
  | "today_words"
  | "words"
  | "login";

export function trackMyPageCta(target: MyPageCtaTarget): void {
  sendGAEvent("event", "mypage_cta_click", { target });
}
