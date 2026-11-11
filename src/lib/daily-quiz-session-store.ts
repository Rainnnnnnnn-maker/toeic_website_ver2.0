// localStorage の副作用はここに隔離し、検証と状態遷移は daily-quiz-session.ts の純粋関数へ委譲する。
import {
  EMPTY_QUIZ_SESSION,
  QUIZ_SESSION_KEY,
  parseQuizSession,
  type QuizSessionState,
} from "./daily-quiz-session";

const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedState: QuizSessionState = EMPTY_QUIZ_SESSION;
// 書き込めない環境（プライベートモードや容量超過）では、メモリ上の値でそのまま続ける
let hasVolatileState = false;

function emit(): void {
  for (const listener of listeners) listener();
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== QUIZ_SESSION_KEY) return;
  try {
    if (event.storageArea !== null && event.storageArea !== window.localStorage) return;
  } catch {
    return;
  }
  emit();
}

export function subscribeQuizSession(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
  };
}

/** useSyncExternalStore 用。保存値が変わらない限り同じ参照を返す。 */
export function getQuizSessionSnapshot(): QuizSessionState {
  if (typeof window === "undefined") return EMPTY_QUIZ_SESSION;
  if (hasVolatileState) return cachedState;
  try {
    const raw = window.localStorage.getItem(QUIZ_SESSION_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedState = parseQuizSession(raw);
    }
  } catch {
    // 読めない場合は直前の値のまま続ける
  }
  return cachedState;
}

/** サーバー描画と初期ハイドレーションは必ず同じ空の状態にする。 */
export function getQuizSessionServerSnapshot(): QuizSessionState {
  return EMPTY_QUIZ_SESSION;
}

/** 回答のたびに同期保存し、直後に単語詳細へ移っても同じ問題へ戻れるようにする。 */
export function updateQuizSession(update: (state: QuizSessionState) => QuizSessionState): void {
  if (typeof window === "undefined") return;
  const current = getQuizSessionSnapshot();
  const next = update(current);
  if (next === current) return;

  const serialized = JSON.stringify(next);
  try {
    window.localStorage.setItem(QUIZ_SESSION_KEY, serialized);
    cachedRaw = serialized;
    hasVolatileState = false;
  } catch {
    hasVolatileState = true;
  }
  cachedState = next;
  emit();
}
