// お気に入り同期の純ロジック。
// クライアント（FavoritesContext）とテストの両方から import される中立モジュールのため、
// "use client" / "server-only" のどちらも付けないこと。

export const FAVORITES_STORAGE_KEY = "toeic_favorites";
export const FAVORITES_MERGED_AT_KEY = "toeic_favorites_merged_at";

function dedupe(slugs: string[]): string[] {
  return [...new Set(slugs)];
}

// localStorage の生値を安全にパースする。壊れた JSON・配列以外・文字列以外の要素は捨てる。
export function parseStoredFavorites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return dedupe(
      parsed.filter(
        (item): item is string => typeof item === "string" && item.length > 0
      )
    );
  } catch {
    return [];
  }
}

// サーバー側（remote）を先頭に、ローカルにしかないものを後ろに足した和集合を返す。
export function mergeFavorites(remote: string[], local: string[]): string[] {
  return dedupe([...remote, ...local]);
}

// Supabase favorites テーブルへの upsert 行を組み立てる。
export function buildFavoriteRows(
  userId: string,
  slugs: string[]
): { user_id: string; word_slug: string }[] {
  return dedupe(slugs.filter((slug) => slug.length > 0)).map((slug) => ({
    user_id: userId,
    word_slug: slug,
  }));
}
