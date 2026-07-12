"use client";

import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  FAVORITES_STORAGE_KEY,
  FAVORITES_MERGED_AT_KEY,
  FAVORITES_OWNER_KEY,
  parseStoredFavorites,
  mergeFavorites,
  buildFavoriteRows,
  shouldMergeLocalFavorites,
} from "@/lib/favorites-sync";

type FavoritesContextType = {
  favorites: string[];
  addFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
  toggleFavorite: (slug: string) => void;
  clearFavorites: () => void;
  isFavorite: (slug: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // "local" = localStorage が正、"remote" = Supabase が正（ログイン済みで読み込み完了後）
  const [source, setSource] = useState<"local" | "remote">("local");
  // ログアウト時の書き戻しで最新値を参照するための ref（effect の依存に入れると再同期が走るため）
  const favoritesRef = useRef<string[]>([]);
  const sourceRef = useRef<"local" | "remote">("local");
  // ログアウト後（userId が null になった後）に「誰のデータだったか」を書き戻すための ref
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    if (userId) {
      lastUserIdRef.current = userId;
    }
  }, [userId]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      setFavorites(parseStoredFavorites(stored));
    } catch (error) {
      console.error("Failed to load favorites from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ログイン/ログアウトに応じてお気に入りの取得元を切り替える
  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      if (sourceRef.current === "remote") {
        // ログアウト直後: アカウントのお気に入りを localStorage へ書き戻して引き継ぐ
        // （D-2 改定 2026-07-12: ログアウトで「消えたように見える」問題への対応）
        // 持ち主のユーザー ID も記録し、同じブラウザで別アカウントがログインした際に
        // このデータが他人のアカウントへマージされるのを防ぐ。
        try {
          localStorage.setItem(
            FAVORITES_STORAGE_KEY,
            JSON.stringify(favoritesRef.current)
          );
          if (lastUserIdRef.current) {
            localStorage.setItem(FAVORITES_OWNER_KEY, lastUserIdRef.current);
          }
        } catch (error) {
          console.error("Failed to write favorites back to localStorage", error);
        }
        setSource("local");
        // favorites の state は書き戻した内容と一致しているのでそのまま
      } else {
        // 初期マウントなど、もともと未ログインの場合: localStorage の内容を表示
        setSource("local");
        try {
          setFavorites(
            parseStoredFavorites(localStorage.getItem(FAVORITES_STORAGE_KEY))
          );
        } catch (error) {
          console.error("Failed to load favorites from localStorage", error);
        }
      }
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    const syncFromServer = async () => {
      let localFavorites: string[] = [];
      let canMergeLocal = true;
      try {
        localFavorites = parseStoredFavorites(
          localStorage.getItem(FAVORITES_STORAGE_KEY)
        );
        // 別アカウントがログアウト時に書き戻したデータは、このアカウントへマージしない
        canMergeLocal = shouldMergeLocalFavorites(
          localStorage.getItem(FAVORITES_OWNER_KEY),
          userId
        );
      } catch (error) {
        console.error("Failed to read favorites from localStorage", error);
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("word_slug")
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (error) {
        // 取得失敗時は localStorage の内容のまま動作継続（次回ログイン時に再同期）
        console.error("Failed to load favorites from Supabase", error);
        return;
      }

      const remote = (data ?? []).map(
        (row: { word_slug: string }) => row.word_slug
      );

      // D-4: 初回ログイン時、localStorage のお気に入りをサーバーへマージ
      // （別アカウントの書き戻しデータの場合はマージも表示への合流もしない）
      if (canMergeLocal && localFavorites.length > 0) {
        const { error: mergeError } = await supabase
          .from("favorites")
          .upsert(buildFavoriteRows(userId, localFavorites), {
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
          try {
            localStorage.removeItem(FAVORITES_STORAGE_KEY);
            localStorage.removeItem(FAVORITES_OWNER_KEY);
            localStorage.setItem(
              FAVORITES_MERGED_AT_KEY,
              new Date().toISOString()
            );
          } catch (storageError) {
            console.error(
              "Failed to clear merged favorites from localStorage",
              storageError
            );
          }
        }
      }

      setFavorites(
        canMergeLocal ? mergeFavorites(remote, localFavorites) : remote
      );
      setSource("remote");
    };

    syncFromServer();

    return () => {
      cancelled = true;
    };
  }, [userId, isLoaded]);

  // Save to local storage whenever favorites change (未ログイン時のみ)
  useEffect(() => {
    if (!isLoaded || source !== "local") return;
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  }, [favorites, isLoaded, source]);

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

  const addFavorite = (slug: string) => {
    setFavorites((prev) => {
      if (prev.includes(slug)) return prev;
      return [...prev, slug];
    });
    syncAddToServer(slug);
  };

  const removeFavorite = (slug: string) => {
    setFavorites((prev) => prev.filter((item) => item !== slug));
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
    setFavorites([]);
    syncClearOnServer();
  };

  const isFavorite = (slug: string) => {
    return favorites.includes(slug);
  };

  return (
    <FavoritesContext
      value={{
        favorites,
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
