// localStorage の副作用はここに隔離し、分類・検証は純粋関数へ委譲する。
import {
  EMPTY_SAVED_STUDY_WORDS,
  STUDY_SAVED_WORDS_KEY,
  parseSavedStudyWords,
  updateSavedStudyWord,
  type SavedStudyWordKind,
  type SavedStudyWords,
} from "./study-saved-words";

const listeners = new Set<() => void>();
export type SavedStudyWordsPersistence = "persistent" | "memory-only" | "unsupported-version";

let cachedRaw: string | null | undefined;
let cachedWords = EMPTY_SAVED_STUDY_WORDS;
// cachedRaw は実際に読んだ／保存できた値。書けない間も同じ保存値ならメモリを保持する。
let hasVolatileFallback = false;
let storageReadable = true;
let hasUnsupportedVersion = false;

function emit(): void {
  for (const listener of listeners) listener();
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== STUDY_SAVED_WORDS_KEY) return;
  // sessionStorage の同名キーの変更には反応しない。
  try {
    if (event.storageArea !== null && event.storageArea !== window.localStorage) return;
  } catch {
    return;
  }
  emit();
}

export function subscribeSavedStudyWords(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
  };
}

/** useSyncExternalStore 用。値が変わらない限り同じ参照を返す。 */
export function getSavedStudyWordsSnapshot(): SavedStudyWords {
  if (typeof window === "undefined") return EMPTY_SAVED_STUDY_WORDS;
  try {
    const raw = window.localStorage.getItem(STUDY_SAVED_WORDS_KEY);
    storageReadable = true;
    if (raw !== cachedRaw) {
      const parsed = parseSavedStudyWords(raw);
      cachedRaw = raw;
      cachedWords = parsed.words;
      hasUnsupportedVersion = parsed.status === "unsupported-version";
      hasVolatileFallback = false;
    }
  } catch {
    storageReadable = false;
  }
  return cachedWords;
}

/** サーバー描画と初期ハイドレーションは必ず同じ空値にする。 */
export function getSavedStudyWordsServerSnapshot(): SavedStudyWords {
  return EMPTY_SAVED_STUDY_WORDS;
}

/** 読めない版を保護している場合と、ストレージを使えない場合を区別して案内する。 */
export function getSavedStudyWordsPersistenceSnapshot(): SavedStudyWordsPersistence {
  if (hasUnsupportedVersion) return "unsupported-version";
  return storageReadable && !hasVolatileFallback ? "persistent" : "memory-only";
}

/** 採点時に同期保存し、直後のページ離脱でも結果を持ち越せるようにする。 */
export function setSavedStudyWord(slug: string, kind: SavedStudyWordKind | null): boolean {
  if (typeof window === "undefined") return false;
  const current = getSavedStudyWordsSnapshot();
  const next = updateSavedStudyWord(current, slug, kind);
  // 一覧が変わらない採点（保存語がない状態での「覚えている」など）は何も書かず、
  // 空の値でキーを作ったり、他タブへの storage イベントや再描画を起こしたりしない。
  if (next === current) return getSavedStudyWordsPersistenceSnapshot() === "persistent";
  // 採点のたびに上の読み取りで最新値を確認する。別タブで未知の版に変わった場合も、
  // storage イベントの到着を待たずに保護する。読めない場合も既存値を推測して上書きしない。
  if (hasUnsupportedVersion || !storageReadable) {
    cachedWords = next;
    hasVolatileFallback = true;
    emit();
    return false;
  }
  const serialized = JSON.stringify(next);
  let persisted = false;
  try {
    window.localStorage.setItem(STUDY_SAVED_WORDS_KEY, serialized);
    hasVolatileFallback = false;
    storageReadable = true;
    cachedRaw = serialized;
    persisted = true;
  } catch {
    hasVolatileFallback = true;
  }
  cachedWords = next;
  emit();
  return persisted;
}
