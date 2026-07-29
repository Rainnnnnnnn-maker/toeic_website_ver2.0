// お気に入りの localStorage を useSyncExternalStore で購読するための外部ストア。
// 副作用（localStorage / window）を持つため、純ロジックの favorites-sync とは分けている。
// 呼び出し元が Client Component であればよいので "use client" は付けないこと
// （付けるとサーバーから import した際にエクスポートが undefined になる）。

import {
  FAVORITES_STORAGE_KEY,
  FAVORITES_MERGED_AT_KEY,
  FAVORITES_OWNER_KEY,
  parseStoredFavorites,
} from "./favorites-sync";

// SSR・ハイドレーション時に返す不変の空配列（毎回同じ参照であること）
const EMPTY: string[] = [];

const listeners = new Set<() => void>();

// useSyncExternalStore は内容が同じなら同一参照を返すことを要求する
// （新しい配列を返し続けると再レンダリングが無限に走る）。
// 生の文字列が変わったときだけパースし直してキャッシュする。
let cachedRaw: string | null | undefined;
let cachedFavorites: string[] = EMPTY;
// localStorage が拒否された場合も、現在のタブではお気に入り操作を継続する。
// volatile中は読み直した古い永続値でメモリ上の最新値を上書きしない。
let hasVolatileFallback = false;

type ReadRawResult =
  | { ok: true; raw: string | null }
  | { ok: false };

function readRaw(): ReadRawResult {
  try {
    return { ok: true, raw: localStorage.getItem(FAVORITES_STORAGE_KEY) };
  } catch (error) {
    console.error("Failed to read favorites from localStorage", error);
    return { ok: false };
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeLocalFavorites(listener: () => void): () => void {
  listeners.add(listener);
  // 他タブでの変更にも追随する（storage イベントは他タブでのみ発火するため、
  // 自タブの書き込みは emit() で明示的に通知している）
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function getLocalFavoritesSnapshot(): string[] {
  if (hasVolatileFallback) return cachedFavorites;

  const result = readRaw();
  if (!result.ok) return cachedFavorites;

  if (result.raw !== cachedRaw) {
    cachedRaw = result.raw;
    cachedFavorites =
      result.raw === null ? EMPTY : parseStoredFavorites(result.raw);
  }
  return cachedFavorites;
}

// SSR とハイドレーション時は常に空。React がハイドレーション後に
// getLocalFavoritesSnapshot へ切り替えるため、描画の食い違いが起きない。
export function getLocalFavoritesServerSnapshot(): string[] {
  return EMPTY;
}

export function writeLocalFavorites(slugs: string[]): void {
  const serialized = JSON.stringify(slugs);
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, serialized);
    hasVolatileFallback = false;
  } catch (error) {
    console.error("Failed to save favorites to localStorage", error);
    hasVolatileFallback = true;
  }

  cachedRaw = serialized;
  cachedFavorites = slugs.length === 0 ? EMPTY : [...slugs];
  emit();
}

export function readLocalFavoritesOwner(): string | null {
  try {
    return localStorage.getItem(FAVORITES_OWNER_KEY);
  } catch (error) {
    console.error("Failed to read favorites owner from localStorage", error);
    return null;
  }
}

export function setLocalFavoritesOwner(userId: string): void {
  try {
    localStorage.setItem(FAVORITES_OWNER_KEY, userId);
  } catch (error) {
    console.error("Failed to record favorites owner to localStorage", error);
  }
}

// Supabase へマージ済みのローカルデータを片付ける。
export function clearMergedLocalFavorites(): void {
  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    localStorage.removeItem(FAVORITES_OWNER_KEY);
    localStorage.setItem(FAVORITES_MERGED_AT_KEY, new Date().toISOString());
    hasVolatileFallback = false;
  } catch (error) {
    console.error("Failed to clear merged favorites from localStorage", error);
    hasVolatileFallback = true;
  }

  cachedRaw = null;
  cachedFavorites = EMPTY;
  emit();
}
