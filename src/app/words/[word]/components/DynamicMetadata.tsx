"use client";

import { use, useEffect } from "react";
import type { Word } from "@/data/words";

export function DynamicMetadata({
  wordPromise,
}: {
  wordPromise: Promise<Word | undefined>;
}) {
  const entry = use(wordPromise);

  useEffect(() => {
    if (entry) {
      document.title = `TOEIC重要単語`;
      
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) {
        descMeta.setAttribute(
          "content",
          `TOEIC重要単語「${entry.term}」の意味、語形変化、類義語、例文などをAIが詳しく解説します。`
        );
      }
    } else {
      document.title = "単語が見つかりません";
    }
  }, [entry]);

  return null;
}
