"use client";

import {
  isValidSemanticLaunchId,
  normalizeSemanticLaunchQuery,
} from "@/lib/semantic-launch";

const STORAGE_KEY_PREFIX = "semantic-search:launch:";
const memoryQueries = new Map<string, string>();

function storageKey(launchId: string): string {
  return `${STORAGE_KEY_PREFIX}${launchId}`;
}

/**
 * TOP で入力された検索語を同一タブ内だけに保存し、URL 用の不透明な ID を返す。
 * sessionStorage が利用できない場合も、SPA 遷移中はメモリ上の値を利用できる。
 */
export function createSemanticLaunch(rawQuery: string): string {
  const query = normalizeSemanticLaunchQuery(rawQuery);
  if (!query) return "";

  const launchId = crypto.randomUUID();
  memoryQueries.set(launchId, query);

  try {
    window.sessionStorage.setItem(storageKey(launchId), query);
  } catch {
    // ストレージ拒否時も、現在の SPA セッションではメモリから受け渡せる。
  }

  return launchId;
}

/** 不透明な ID に対応する検索語を、現在のタブ内から取得する。 */
export function getSemanticLaunchQuery(launchId: string): string {
  if (!isValidSemanticLaunchId(launchId)) return "";

  const inMemory = memoryQueries.get(launchId);
  if (inMemory) return inMemory;

  try {
    const stored = window.sessionStorage.getItem(storageKey(launchId)) ?? "";
    const query = normalizeSemanticLaunchQuery(stored);
    if (query) memoryQueries.set(launchId, query);
    return query;
  } catch {
    return "";
  }
}
