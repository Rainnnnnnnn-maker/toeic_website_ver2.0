"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Word } from "@/data/words";
import { useFavorites } from "@/context/FavoritesContext";
import { useListenPlayer } from "@/hooks/useListenPlayer";
import ListenPlayerView from "@/components/features/listen/ListenPlayerView";

type Props = {
  allWords: Word[];
};

export default function FavoritesListenClient({ allWords }: Props) {
  const router = useRouter();
  const { favorites } = useFavorites();

  const words = useMemo(() => {
    // favoritesは追加順のslug配列。これに沿ってallWordsから検索して並べる
    return favorites
      .map(slug => allWords.find(w => w.slug === slug))
      .filter((w): w is Word => w !== undefined);
  }, [favorites, allWords]);

  const player = useListenPlayer({ words, backHref: "/favorites" });

  if (words.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto w-full text-center py-20">
        <p className="text-slate-500">お気に入りに登録された単語がありません。</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-blue-600 hover:underline"
        >
          単語一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <ListenPlayerView
      player={player}
      title="お気に入り単語 聞き流し"
      completionMessage="すべての単語の再生が完了しました。再生ボタンでもう一度聞けます。"
    />
  );
}
