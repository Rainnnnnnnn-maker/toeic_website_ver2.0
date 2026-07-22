export const WORD_LEVEL_ORDER = ["important", "medium", "high"] as const;

export type WordLevel = (typeof WORD_LEVEL_ORDER)[number];

type WordLevelInfo = {
  readonly label: string;
  readonly indexTitle: string;
  readonly score: string;
  readonly indexDescription: string;
};

export const WORD_LEVEL_INFO: Readonly<Record<WordLevel, WordLevelInfo>> = {
  important: {
    label: "最重要",
    indexTitle: "最重要単語",
    score: "600点",
    indexDescription: "スコアアップの土台になる、最初に覚えたい基礎単語",
  },
  medium: {
    label: "中級",
    indexTitle: "中級単語",
    score: "730〜800点",
    indexDescription: "Part 5・6・7の正答率向上につながる応用単語",
  },
  high: {
    label: "上級",
    indexTitle: "高難易度単語",
    score: "800点以上",
    indexDescription: "長文読解や高度なビジネス表現に対応する上級単語",
  },
};
