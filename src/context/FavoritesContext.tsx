"use client";

import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  isCurrentFavoriteSession,
  isPreviousFavoriteSession,
  mergeFavorites,
  buildFavoriteRows,
  shouldMergeLocalFavorites,
} from "@/lib/favorites-sync";
import {
  subscribeLocalFavorites,
  getLocalFavoritesSnapshot,
  getLocalFavoritesServerSnapshot,
  writeLocalFavorites,
  readLocalFavoritesOwner,
  setLocalFavoritesOwner,
  clearMergedLocalFavorites,
} from "@/lib/favorites-store";

// お気に入りの読み込み状態。ログイン必須機能（マイページ / 復習キュー）は
// "ready"（＝Supabase から取得済み）でのみ描画し、localStorage の値を混ぜない。
export type FavoritesStatus = "guest" | "loading" | "ready" | "error";

type FavoritesContextType = {
  favorites: string[];
  favoritesStatus: FavoritesStatus;
  retryFavoritesSync: () => void;
  addFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
  toggleFavorite: (slug: string) => void;
  clearFavorites: () => void;
  isFavorite: (slug: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

// ログアウト時の localStorage 書き戻しはペイント前に完了させる必要がある。
// useEffect だと「リモート表示 → 空の localStorage」の1フレームが描画され、
// D-2 で修正した「ログアウトでお気に入りが消えたように見える」症状が再発する。
// SSR では layout effect は動かず、かつログアウト遷移も起きないため useEffect で代替する。
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthLoading, authEpoch } = useAuth();
  const userId = user?.id ?? null;
  // localStorage を外部ストアとして直接購読する。これによりマウント時に
  // effect から setState する必要がなくなる（react-hooks/set-state-in-effect）。
  // ハイドレーション中はサーバースナップショット（空配列）が使われるため不整合も起きない。
  const localFavorites = useSyncExternalStore(
    subscribeLocalFavorites,
    getLocalFavoritesSnapshot,
    getLocalFavoritesServerSnapshot
  );
  // Supabase から読み込んだお気に入りと、その持ち主。
  // 「どちらを正とするか」を別の state で持つとログアウト時に effect 内から
  // setState する必要が出るため、userId との一致で導出する。
  const [remote, setRemote] = useState<{
    userId: string;
    authEpoch: number;
    favorites: string[];
  } | null>(null);

  // Supabase からの取得に失敗した認証セッション。マイページなど
  // 「Supabase のお気に入りだけを見せる」画面がエラーを検知するために持つ。
  const [failedSession, setFailedSession] = useState<{
    userId: string;
    authEpoch: number;
  } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // 同じユーザーでもログアウトを挟んだ古いremoteは再利用せず、
  // 現在の認証世代でSupabaseから取得済みの場合だけremoteを正とする。
  const isRemote = isCurrentFavoriteSession(remote, userId, authEpoch);
  const favorites = isRemote ? remote.favorites : localFavorites;

  // ログアウト検知用。remote 自体はログアウトでは変化しないため、
  // 「直前までリモートを表示していたか」を effect 内から安全に参照できる。
  const remoteRef = useRef(remote);

  useIsomorphicLayoutEffect(() => {
    remoteRef.current = remote;
  }, [remote]);

  // ログアウト直後: アカウントのお気に入りを localStorage へ書き戻して引き継ぐ
  // （D-2 改定 2026-07-12: ログアウトで「消えたように見える」問題への対応）
  // 持ち主のユーザー ID も記録し、同じブラウザで別アカウントがログインした際に
  // このデータが他人のアカウントへマージされるのを防ぐ。
  // remote は userId が null になっても変化しないため、直前の値を ref から取得できる。
  useIsomorphicLayoutEffect(() => {
    if (userId) return;
    const previous = remoteRef.current;
    if (!isPreviousFavoriteSession(previous, userId, authEpoch)) return;
    writeLocalFavorites(previous.favorites);
    setLocalFavoritesOwner(previous.userId);
    // 表示は isRemote === false により自動的に localFavorites へ切り替わる
  }, [userId, authEpoch]);

  // ログイン時に Supabase からお気に入りを読み込む
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const supabase = createClient();

    const syncFromServer = async () => {
      // ハイドレーション時のスナップショットではなく、実行時点の localStorage を読む
      const storedFavorites = getLocalFavoritesSnapshot();
      // 別アカウントがログアウト時に書き戻したデータは、このアカウントへマージしない
      const canMergeLocal = shouldMergeLocalFavorites(
        readLocalFavoritesOwner(),
        userId
      );

      const { data, error } = await supabase
        .from("favorites")
        .select("word_slug")
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (error) {
        // 取得失敗時も localStorage の内容で動作継続（ゲスト相当の体験は維持）。
        // ただし favoritesStatus は "error" になり、ログイン必須画面は
        // ローカル値を表示せず再試行 UI を出す。
        console.error("Failed to load favorites from Supabase", error);
        setFailedSession({ userId, authEpoch });
        return;
      }

      const remoteSlugs = (data ?? []).map(
        (row: { word_slug: string }) => row.word_slug
      );

      // D-4: 初回ログイン時、localStorage のお気に入りをサーバーへマージ
      // （別アカウントの書き戻しデータの場合はマージも表示への合流もしない）
      if (canMergeLocal && storedFavorites.length > 0) {
        const { error: mergeError } = await supabase
          .from("favorites")
          .upsert(buildFavoriteRows(userId, storedFavorites), {
            onConflict: "user_id,word_slug",
            ignoreDuplicates: true,
          });

        if (cancelled) return;
        if (mergeError) {
          // 失敗時は localStorage を残す（次回ログイン時に再マージされる）
          console.error(
            "Failed to merge local favorites into Supabase",
            mergeError
          );
        } else {
          clearMergedLocalFavorites();
        }
      }

      setRemote({
        userId,
        authEpoch,
        favorites: canMergeLocal
          ? mergeFavorites(remoteSlugs, storedFavorites)
          : remoteSlugs,
      });
    };

    syncFromServer();

    return () => {
      cancelled = true;
    };
  }, [userId, authEpoch, reloadToken]);

  // 未ログイン時の更新は localStorage を直接書き換える（ストアが再購読を通知する）。
  // 変更のたびに保存用 effect を回す必要がなくなるため、書き込み漏れも起きない。
  const updateLocalFavorites = (
    updater: (current: string[]) => string[]
  ): void => {
    // 同一レンダー内で連続操作されてもクロージャの古い値を使わないよう、
    // 書き込み直前の localStorage を読み直す
    writeLocalFavorites(updater(getLocalFavoritesSnapshot()));
  };

  // ログイン中のみ、サーバーへ変更を反映する（楽観的更新の裏側）
  const syncAddToServer = (slug: string) => {
    if (!userId) return;
    createClient()
      .from("favorites")
      .upsert(buildFavoriteRows(userId, [slug]), {
        onConflict: "user_id,word_slug",
        ignoreDuplicates: true,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to add favorite to Supabase", error);
      });
  };

  const syncRemoveFromServer = (slug: string) => {
    if (!userId) return;
    createClient()
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("word_slug", slug)
      .then(({ error }) => {
        if (error)
          console.error("Failed to remove favorite from Supabase", error);
      });
  };

  const syncClearOnServer = () => {
    if (!userId) return;
    createClient()
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .then(({ error }) => {
        if (error)
          console.error("Failed to clear favorites on Supabase", error);
      });
  };

  // リモート表示中はサーバー由来の state を、未ログイン時は localStorage を更新する
  const updateRemoteFavorites = (
    updater: (current: string[]) => string[]
  ): void => {
    setRemote((prev) =>
      prev === null ? prev : { ...prev, favorites: updater(prev.favorites) }
    );
  };

  const addFavorite = (slug: string) => {
    const add = (current: string[]) =>
      current.includes(slug) ? current : [...current, slug];
    if (isRemote) {
      updateRemoteFavorites(add);
    } else {
      updateLocalFavorites(add);
    }
    syncAddToServer(slug);
  };

  const removeFavorite = (slug: string) => {
    const remove = (current: string[]) =>
      current.filter((item) => item !== slug);
    if (isRemote) {
      updateRemoteFavorites(remove);
    } else {
      updateLocalFavorites(remove);
    }
    syncRemoveFromServer(slug);
  };

  const toggleFavorite = (slug: string) => {
    if (favorites.includes(slug)) {
      sendGAEvent("event", "favorite_toggle", { action: "remove", word: slug });
      removeFavorite(slug);
    } else {
      sendGAEvent("event", "favorite_toggle", { action: "add", word: slug });
      addFavorite(slug);
    }
  };

  const clearFavorites = () => {
    if (isRemote) {
      updateRemoteFavorites(() => []);
    } else {
      updateLocalFavorites(() => []);
    }
    syncClearOnServer();
  };

  const isFavorite = (slug: string) => {
    return favorites.includes(slug);
  };

  const favoritesStatus: FavoritesStatus = (() => {
    if (isAuthLoading) return "loading";
    if (!userId) return "guest";
    if (isRemote) return "ready";
    if (isCurrentFavoriteSession(failedSession, userId, authEpoch)) {
      return "error";
    }
    return "loading";
  })();

  const retryFavoritesSync = () => {
    setFailedSession(null);
    setReloadToken((token) => token + 1);
  };

  return (
    <FavoritesContext
      value={{
        favorites,
        favoritesStatus,
        retryFavoritesSync,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        clearFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext>
  );
}

export function useFavorites() {
  const context = use(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
