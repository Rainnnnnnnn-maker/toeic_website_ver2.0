"use client";

import { Word } from "@/data/words";
import { useListenPlayer } from "@/hooks/useListenPlayer";
import ListenPlayerView from "@/components/features/listen/ListenPlayerView";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";

type Props = {
  words: Word[];
};

export default function TodayWordsListenClient({ words }: Props) {
  const player = useListenPlayer({ words, backHref: "/" });

  return (
    <ListenPlayerView
      player={player}
      title="今日の単語 聞き流し"
      completionMessage={`${TODAY_WORDS_COUNT}単語の再生が完了しました。再生ボタンでもう一度聞けます。`}
    />
  );
}
