import type { DailyQuiz, QuizDay } from "@/lib/daily-quiz";

/**
 * 「今日の6語クイズ」の回答の進み具合を端末に保存するための純粋ロジック。
 * localStorage の値は利用者が書き換えられるため、読むたびにクイズの内容と照合する。
 * 保存の副作用は `daily-quiz-session-store.ts` に分ける。
 */

/** キーは固定の1つ。日付ごとのキーにすると古い値が残り続ける */
export const QUIZ_SESSION_KEY = "toeic-daily-quiz:v1";

export type QuizDayProgress = {
  /** 保存時のクイズの生成日時。作り直されたクイズに古い回答を当てはめないために持つ */
  stamp: string;
  /** 出題順の回答（選択肢 ID）。長さが回答済みの問題数 */
  answers: string[];
  /** 表示中の問題の位置。回答済みの位置なら解説を、問題数と同じなら結果を表示する */
  position: number;
};

export type QuizSessionState = {
  v: 1;
  /**
   * 利用者が選んだ日と、選んだ時点の「今日」。
   * 単語詳細から戻ったときに同じ日を開くために持つ。日付が変わったら無視し、新しい今日を開く。
   */
  selected: { dateKey: string; todayKey: string } | null;
  days: Record<string, QuizDayProgress>;
};

export const EMPTY_QUIZ_SESSION: QuizSessionState = { v: 1, selected: null, days: {} };

const EMPTY_PROGRESS = { answers: [] as string[], position: 0 };

/** localStorage の生文字列を検証付きで読む。形が違えば空の状態を返す（例外は投げない）。 */
export function parseQuizSession(raw: string | null): QuizSessionState {
  if (!raw) return EMPTY_QUIZ_SESSION;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY_QUIZ_SESSION;
  }
  if (!data || typeof data !== "object") return EMPTY_QUIZ_SESSION;
  const obj = data as Record<string, unknown>;
  if (obj.v !== 1 || !obj.days || typeof obj.days !== "object") return EMPTY_QUIZ_SESSION;

  const days: Record<string, QuizDayProgress> = {};
  for (const [dateKey, value] of Object.entries(obj.days as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const { stamp, answers, position } = value as Record<string, unknown>;
    if (typeof stamp !== "string") continue;
    if (!Array.isArray(answers) || !answers.every((answer) => typeof answer === "string")) continue;
    if (typeof position !== "number" || !Number.isInteger(position) || position < 0) continue;
    days[dateKey] = { stamp, answers: answers as string[], position };
  }

  let selected: QuizSessionState["selected"] = null;
  if (obj.selected && typeof obj.selected === "object") {
    const { dateKey, todayKey } = obj.selected as Record<string, unknown>;
    if (typeof dateKey === "string" && typeof todayKey === "string") selected = { dateKey, todayKey };
  }

  return { v: 1, selected, days };
}

/**
 * 日付ボタンに並べ、選べる日か。過去の日はクイズがある日だけにする。
 * 今日は未生成でも選べるようにし、「準備中」の案内を開けるようにする。
 */
export function isSelectableQuizDay(day: QuizDay, todayKey: string): boolean {
  return day.quiz !== null || day.dateKey === todayKey;
}

/**
 * 表示する日を決める。同じ「今日」のうちに利用者が選んだ日があればそれを、
 * 無ければクイズのある最も新しい日（通常は今日）を返す。
 * 選んだ日はボタンと同じ `isSelectableQuizDay` で確かめる。選べるのに開けない日を作らないためである。
 */
export function resolveSelectedDateKey(
  state: QuizSessionState,
  days: ReadonlyArray<QuizDay>,
  todayKey: string,
): string | null {
  const selected = state.selected;
  if (selected && selected.todayKey === todayKey) {
    const day = days.find((entry) => entry.dateKey === selected.dateKey);
    if (day && isSelectableQuizDay(day, todayKey)) return day.dateKey;
  }
  return days.find((day) => day.quiz)?.dateKey ?? days[0]?.dateKey ?? null;
}

/**
 * 保存された進み具合を、いま配信しているクイズに当てはめる。
 * クイズが作り直されている、または回答が選択肢に存在しない場合は最初からにする。
 */
export function getDayProgress(state: QuizSessionState, quiz: DailyQuiz): { answers: string[]; position: number } {
  const saved = state.days[quiz.dateKey];
  if (!saved || saved.stamp !== quiz.generatedAt) return EMPTY_PROGRESS;

  const total = quiz.questions.length;
  if (saved.answers.length > total) return EMPTY_PROGRESS;
  const valid = saved.answers.every((answer, index) =>
    quiz.questions[index].options.some((option) => option.id === answer),
  );
  if (!valid) return EMPTY_PROGRESS;

  // 未回答の問題より先は表示させない
  return { answers: saved.answers, position: Math.min(saved.position, saved.answers.length) };
}

function withDay(state: QuizSessionState, quiz: DailyQuiz, answers: string[], position: number): QuizSessionState {
  return {
    ...state,
    days: { ...state.days, [quiz.dateKey]: { stamp: quiz.generatedAt, answers, position } },
  };
}

/** 表示中の問題に回答する。回答済みの問題や存在しない選択肢は無視する（二重採点の防止）。 */
export function answerQuestion(state: QuizSessionState, quiz: DailyQuiz, optionId: string): QuizSessionState {
  const { answers, position } = getDayProgress(state, quiz);
  const question = quiz.questions[position];
  if (!question || position !== answers.length) return state;
  if (!question.options.some((option) => option.id === optionId)) return state;
  return withDay(state, quiz, [...answers, optionId], position);
}

/** 回答済みの問題から次へ進む。未回答なら進まない。 */
export function advanceQuestion(state: QuizSessionState, quiz: DailyQuiz): QuizSessionState {
  const { answers, position } = getDayProgress(state, quiz);
  if (position >= answers.length) return state;
  return withDay(state, quiz, answers, position + 1);
}

/** その日の回答を消して最初からにする。 */
export function resetDay(state: QuizSessionState, quiz: DailyQuiz): QuizSessionState {
  return withDay(state, quiz, [], 0);
}

export function selectDay(state: QuizSessionState, dateKey: string, todayKey: string): QuizSessionState {
  if (state.selected?.dateKey === dateKey && state.selected.todayKey === todayKey) return state;
  return { ...state, selected: { dateKey, todayKey } };
}

/** 解ける期間から外れた日の回答を捨てる。変化が無ければ同じ参照を返す。 */
export function pruneDays(state: QuizSessionState, validDateKeys: readonly string[]): QuizSessionState {
  const entries = Object.entries(state.days).filter(([dateKey]) => validDateKeys.includes(dateKey));
  if (entries.length === Object.keys(state.days).length) return state;
  return { ...state, days: Object.fromEntries(entries) };
}
