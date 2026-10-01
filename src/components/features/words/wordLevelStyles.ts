import type { WordLevel } from "@/lib/word-level";

/**
 * 単語カード・レベルフィルタで共有する Tailwind クラス。
 * TOP・単語一覧・意味検索・単語詳細・今日のおすすめで共通利用する。
 * "use client" を付けない中立モジュール（定数のみ）。
 */
export const WORD_LEVEL_CARD_STYLES: Readonly<
  Record<
    WordLevel,
    {
      readonly activeClass: string;
      readonly accentClass: string;
      readonly summaryClass: string;
      readonly badgeClass: string;
      readonly cardClass: string;
    }
  >
> = {
  important: {
    accentClass: "bg-blue-600",
    summaryClass: "bg-blue-50 border-blue-200 text-blue-700",
    activeClass: "border-blue-600 bg-blue-600 text-white shadow-blue-600/20",
    badgeClass: "bg-blue-100 text-blue-700",
    cardClass: "hover:border-blue-300 hover:bg-blue-50/70",
  },
  medium: {
    accentClass: "bg-violet-600",
    summaryClass: "bg-violet-50 border-violet-200 text-violet-700",
    activeClass: "border-violet-600 bg-violet-600 text-white shadow-violet-600/20",
    badgeClass: "bg-violet-100 text-violet-700",
    cardClass: "hover:border-violet-300 hover:bg-violet-50/70",
  },
  high: {
    accentClass: "bg-rose-600",
    summaryClass: "bg-rose-50 border-rose-200 text-rose-700",
    activeClass: "border-rose-600 bg-rose-600 text-white shadow-rose-600/20",
    badgeClass: "bg-rose-100 text-rose-700",
    cardClass: "hover:border-rose-300 hover:bg-rose-50/70",
  },
};
