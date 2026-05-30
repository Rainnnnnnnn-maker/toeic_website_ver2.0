"use client";

import { Word } from "@/data/words";
import { useListenPlayer } from "@/hooks/useListenPlayer";
import ListenPlayerView from "@/components/features/listen/ListenPlayerView";

type Props = {
  words: Word[];
};

export default function TodayWordsListenClient({ words }: Props) {
  const player = useListenPlayer({ words, backHref: "/" });

  return (
    <ListenPlayerView
      player={player}
      title="今日の単語 聞き流し"
      completionMessage="5単語の再生が完了しました。再生ボタンでもう一度聞けます。"
    />
  );
}
