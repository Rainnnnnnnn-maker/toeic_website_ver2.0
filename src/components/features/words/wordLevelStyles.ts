import type { WordLevel } from "@/lib/word-level";

/**
 * 単語カード・レベルフィルタで共有する Tailwind クラス。
 * WordsExplorerClient（英単語検索）と SemanticSearchPanel（意味検索）で共通利用する。
 * "use client" を付けない中立モジュール（定数のみ）。
 */
export const WORD_LEVEL_CARD_STYLES: Readonly<
  Record<
    WordLevel,
    {
      readonly activeClass: string;
      readonly badgeClass: string;
      readonly cardClass: string;
    }
  >
> = {
  important: {
    activeClass: "border-blue-600 bg-blue-600 text-white shadow-blue-600/20",
    badgeClass: "bg-blue-100 text-blue-700",
    cardClass: "hover:border-blue-300 hover:bg-blue-50/70",
  },
  medium: {
    activeClass: "border-violet-600 bg-violet-600 text-white shadow-violet-600/20",
    badgeClass: "bg-violet-100 text-violet-700",
    cardClass: "hover:border-violet-300 hover:bg-violet-50/70",
  },
  high: {
    activeClass: "border-rose-600 bg-rose-600 text-white shadow-rose-600/20",
    badgeClass: "bg-rose-100 text-rose-700",
    cardClass: "hover:border-rose-300 hover:bg-rose-50/70",
  },
};
