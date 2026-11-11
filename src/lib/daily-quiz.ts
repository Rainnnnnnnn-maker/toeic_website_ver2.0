import type { Word } from "@/data/words";
import {
  MAX_OPTION_LENGTH,
  QUIZ_OPTION_COUNT,
  hasIrregularForm,
  normalizeTerm,
  pickDistractors,
  splitDisplayTerms,
  stemOfTerm,
  type QuizSourceWord,
  type TranslationClass,
} from "@/lib/quiz-question-builder";
import { TODAY_WORDS_COUNT, hashString, parseTodayDateKey } from "@/lib/word-select";

/**
 * 「今日の6語クイズ」の純粋ロジック。Redis / Gemini / Next.js のキャッシュ API に依存しない。
 *
 * 1日分のクイズは日次 Cron が1回だけ作り、Upstash Redis に保存する。
 * 正解は出題語の既存の訳（単語詳細と同じ `japaneseTranslation`）から選び、
 * 誤答だけを Gemini に作らせる。Gemini の出力はここで機械的に検証し、さらに別の依頼で
 * 「正解として成立してしまう候補」を除く。必要な数が残らなかった語は、
 * 他の収録語の訳を誤答にする方法（`pickDistractors`）で代替する。
 */

export const DAILY_QUIZ_VERSION = 1;
/** クイズ画面で解ける日数（今日を含む） */
export const QUIZ_HISTORY_DAYS = 7;
/** Redis に残す日数。解ける日数より1日長くし、日付の切り替わり前後でも欠けないようにする */
export const QUIZ_RETENTION_DAYS = 8;

/** 1語につき Gemini に作らせる誤答の候補数。検証と確認で落ちる分を見込んで多めに頼む */
export const AI_DISTRACTOR_CANDIDATES = 5;
/** 応答が指示より多くても、読むのはここまで */
const MAX_AI_CANDIDATES_READ = 8;

const DAY_MS = 24 * 60 * 60 * 1000;
const OPTION_IDS = ["a", "b", "c", "d"] as const;
const LEVELS: ReadonlyArray<Word["level"]> = ["important", "medium", "high"];
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
/** Redis から読んだ文字列の上限。壊れた値や想定外に長い値を画面へ流さない */
const MAX_STORED_TEXT_LENGTH = 400;

export type DistractorSource = "ai" | "fallback";

export type DailyQuizOption = { id: string; text: string };

export type DailyQuizQuestion = {
  /** `<dateKey>:<slug>`。端末に保存した回答との照合に使う */
  id: string;
  slug: string;
  term: string;
  level: Word["level"];
  options: DailyQuizOption[];
  correctOptionId: string;
  /** 回答後に見せる既存の例文。単語詳細に例文が無ければ null */
  example: { en: string; ja: string } | null;
  distractorSource: DistractorSource;
};

export type DailyQuiz = {
  version: typeof DAILY_QUIZ_VERSION;
  /** 出題日の日付キー（JST 7:00 切り替えの YYYY-MM-DD） */
  dateKey: string;
  /** 生成時のコーパス版。当日の6語と食い違っていないかの確認に使う */
  wordListVersion: string;
  generatedAt: string;
  questions: DailyQuizQuestion[];
};

export type QuizDay = { dateKey: string; quiz: DailyQuiz | null };

export function quizCacheKey(dateKey: string): string {
  return `quiz:v${DAILY_QUIZ_VERSION}:${dateKey}`;
}

/** 今日から過去へさかのぼる日付キーを返す（先頭が今日）。 */
export function listRecentDateKeys(todayKey: string, days: number): string[] {
  const today = parseTodayDateKey(todayKey);
  if (!today || !Number.isInteger(days) || days <= 0) return [];
  const todayTime = Date.parse(`${today}T00:00:00Z`);
  return Array.from({ length: days }, (_, offset) =>
    new Date(todayTime - offset * DAY_MS).toISOString().slice(0, 10),
  );
}

/** 日付の切り替えボタンに出す表記。「今日」「昨日」、それ以前は「11/8（日）」。 */
export function formatQuizDayLabel(dateKey: string, todayKey: string): string {
  const date = parseTodayDateKey(dateKey);
  const today = parseTodayDateKey(todayKey);
  if (!date) return dateKey;
  const time = Date.parse(`${date}T00:00:00Z`);
  if (today) {
    const diff = Math.round((Date.parse(`${today}T00:00:00Z`) - time) / DAY_MS);
    if (diff === 0) return "今日";
    if (diff === 1) return "昨日";
  }
  const parsed = new Date(time);
  return `${parsed.getUTCMonth() + 1}/${parsed.getUTCDate()}（${WEEKDAYS[parsed.getUTCDay()]}）`;
}

const CLASS_LABELS: Record<TranslationClass, string> = {
  verb: "動詞（「〜する」などの辞書形）",
  adjective: "形容詞（「〜な」「〜の」「〜い」など名詞を修飾する形）",
  adverb: "副詞",
  noun: "名詞",
};

/** Gemini に誤答を作らせるプロンプト。6語を1回の依頼にまとめる。 */
export function buildDistractorPrompt(targets: readonly QuizSourceWord[]): string {
  const input = targets.map((target) => ({
    slug: target.slug,
    word: target.term,
    form: CLASS_LABELS[target.translationClass],
    termCount: target.optionTermCount,
    correct: target.optionText,
    allMeanings: target.translation,
    synonyms: target.synonyms.slice(0, 8),
  }));

  return `あなたはTOEIC語彙クイズの作問者です。4択問題の「不正解の選択肢」を作ります。

各英単語について、その単語の意味では「ない」日本語を${AI_DISTRACTOR_CANDIDATES}つ書いてください。学習者が正解と迷うように、同じ品詞の「別の英単語」の訳を使います（つづりや音が似た単語、同じビジネス場面に出てくる単語など）。

厳守事項:
1. correct と allMeanings に書かれた意味、その言い換え、synonyms の単語の訳は絶対に書かない。それらは正解であり、不正解の選択肢にできない。
2. 書式は correct と同じにする。termCount が 2 のときは「訳語、訳語」（1つの別単語が持つ2つの訳語を読点でつなぐ）、1 のときは訳語を1つだけ書く。
3. 語形は form に合わせる。
4. 各選択肢は${MAX_OPTION_LENGTH}文字以内。括弧、英字、「〜」「…」は使わない。
5. ${AI_DISTRACTOR_CANDIDATES}つの選択肢どうしで意味が重ならない。
6. JSON以外のテキストは出力しない。

例:
入力 {"slug":"purchase","word":"purchase","form":"動詞（「〜する」などの辞書形）","termCount":2,"correct":"購入する、買う","allMeanings":"購入する、買う、購入","synonyms":["buy","acquire"]}
出力 {"slug":"purchase","distractors":["売却する、手放す","借りる、賃借する","修理する、直す","配達する、届ける","返品する、送り返す"]}
入力 {"slug":"aisle","word":"aisle","form":"名詞","termCount":1,"correct":"通路","allMeanings":"通路","synonyms":["passage"]}
出力 {"slug":"aisle","distractors":["島","階段","入口","座席","棚"]}

入力:
${JSON.stringify(input)}

出力形式（items に入力と同じ順で並べる）:
{"items":[{"slug":"<入力のslug>","distractors":["...","...","...","...","..."]}]}
`;
}

function parseItems(text: string): unknown[] {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return [];
  try {
    const items = (JSON.parse(text.slice(start, end + 1)) as { items?: unknown } | null)?.items;
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/** Gemini の応答から slug ごとの誤答候補を取り出す。形が違えば空の Map を返す。 */
export function parseDistractorResponse(text: string): Map<string, unknown> {
  const result = new Map<string, unknown>();
  for (const item of parseItems(text)) {
    if (!item || typeof item !== "object") continue;
    const { slug, distractors } = item as { slug?: unknown; distractors?: unknown };
    if (typeof slug === "string" && !result.has(slug)) result.set(slug, distractors);
  }
  return result;
}

export type DistractorRejection = "bad-format" | "term-count" | "form" | "overlaps-correct" | "duplicate";

export type DistractorFilterResult = {
  /** 検証に通った候補（応答の順） */
  accepted: string[];
  /** 通らなかった候補の理由。件数の把握とログ用 */
  rejected: DistractorRejection[];
};

function stemsOf(text: string): string[] {
  return splitDisplayTerms(text)
    .flatMap((term) => normalizeTerm(term).split("・"))
    .filter(Boolean)
    .map(stemOfTerm);
}

function stemsOverlap(left: readonly string[], right: readonly string[]): boolean {
  return left.some((a) => right.some((b) => a === b || a.includes(b) || b.includes(a)));
}

/** 候補1件を文字列に揃える。2つの訳語を配列で返してきた場合は読点でつなぐ。 */
function toCandidateText(item: unknown): string | null {
  const raw = Array.isArray(item) && item.every((part) => typeof part === "string") ? item.join("、") : item;
  if (typeof raw !== "string") return null;
  // 区切り文字を読点に揃える。文面そのものは書き換えない
  return splitDisplayTerms(raw.replace(/。$/, "")).join("、");
}

function rejectionFor(
  text: string,
  target: QuizSourceWord,
  acceptedStems: readonly string[][],
): DistractorRejection | null {
  const normalized = text.normalize("NFKC");
  if (!text || text.length > MAX_OPTION_LENGTH || /[a-z]/i.test(normalized) || /[~〜()]|\.{2,}/.test(normalized)) {
    return "bad-format";
  }
  const terms = splitDisplayTerms(text).map(normalizeTerm).filter(Boolean);
  if (terms.length !== target.optionTermCount) return "term-count";
  if (terms.some((term) => hasIrregularForm(term, target.translationClass))) return "form";
  const stems = stemsOf(text);
  if (stemsOverlap(stems, target.stems)) return "overlaps-correct";
  if (acceptedStems.some((previous) => stemsOverlap(stems, previous))) return "duplicate";
  return null;
}

/**
 * Gemini が作った誤答の候補を1件ずつ検証し、通ったものだけを返す。
 * 形式・語形・訳語の数を正解と揃え、正解の訳（原文のすべての訳語）や他の候補と
 * 訳語が重なっていないことを機械的に確かめる。意味の近さまでは判断できないため、
 * 通った候補はさらに `buildVerificationPrompt` による確認にかける。
 */
export function filterAiDistractors(target: QuizSourceWord, value: unknown): DistractorFilterResult {
  const accepted: string[] = [];
  const rejected: DistractorRejection[] = [];
  if (!Array.isArray(value)) return { accepted, rejected };

  const acceptedStems: string[][] = [];
  for (const item of value.slice(0, MAX_AI_CANDIDATES_READ)) {
    const text = toCandidateText(item);
    const rejection = text === null ? "bad-format" : rejectionFor(text, target, acceptedStems);
    if (text === null || rejection) {
      rejected.push(rejection ?? "bad-format");
      continue;
    }
    accepted.push(text);
    acceptedStems.push(stemsOf(text));
  }
  return { accepted, rejected };
}

export type VerificationItem = { target: QuizSourceWord; distractors: readonly string[] };

/**
 * 誤答の候補が「実はその単語の訳として成立してしまう」ものでないかを Gemini に確認させるプロンプト。
 * 訳語の文字列が重ならない近い意味（corp に対する「法人」など）は機械的な検証では拾えないため、
 * 作問とは別の依頼で確かめる。
 */
export function buildVerificationPrompt(items: readonly VerificationItem[]): string {
  const input = items.map(({ target, distractors }) => ({
    slug: target.slug,
    word: target.term,
    meanings: target.translation,
    candidates: distractors,
  }));

  return `あなたは英和辞書の校閲者です。次の各英単語について、candidates（4択クイズの誤答の候補）を1つずつ確認してください。

候補が次のどれかに当てはまる場合、その候補の番号（0始まり）を invalid に入れてください。
- その英単語の訳として辞書に載る、または訳として通用する。
- meanings のいずれかとほぼ同じ意味、言い換え、上位語・下位語である。
- 学習者が「これも正解では」と迷う程度に意味が近い。

当てはまる候補が無ければ invalid は空の配列にします。判断に迷う場合は invalid に入れてください。
JSON以外のテキストは出力しない。

入力:
${JSON.stringify(input)}

出力形式:
{"items":[{"slug":"<入力のslug>","invalid":[0,2]}]}
`;
}

/** 確認の応答から、slug ごとの「使えない候補の番号」を取り出す。応答に無い slug は Map に入らない。 */
export function parseVerificationResponse(text: string): Map<string, Set<number>> {
  const result = new Map<string, Set<number>>();
  for (const item of parseItems(text)) {
    if (!item || typeof item !== "object") continue;
    const { slug, invalid } = item as { slug?: unknown; invalid?: unknown };
    if (typeof slug !== "string" || !Array.isArray(invalid) || result.has(slug)) continue;
    result.set(slug, new Set(invalid.filter((index): index is number => Number.isInteger(index) && index >= 0)));
  }
  return result;
}

/** 確認で使えないとされた候補を除き、先頭から必要な数だけ取る。足りなければ null。 */
export function pickVerifiedDistractors(
  candidates: readonly string[],
  invalidIndexes: ReadonlySet<number>,
): string[] | null {
  const usable = candidates.filter((_, index) => !invalidIndexes.has(index));
  return usable.length >= QUIZ_OPTION_COUNT - 1 ? usable.slice(0, QUIZ_OPTION_COUNT - 1) : null;
}

/** Gemini を使えない・検証に通らない語の誤答を、他の収録語の訳から選ぶ。足りなければ null。 */
export function buildFallbackDistractors(
  target: QuizSourceWord,
  pool: readonly QuizSourceWord[],
): string[] | null {
  const { distractors } = pickDistractors(target, pool);
  if (distractors.length < QUIZ_OPTION_COUNT - 1) return null;
  return distractors.map((distractor) => distractor.optionText);
}

/**
 * 1問を組み立てる。選択肢の並びは `日付:slug:文面` のハッシュ順で、
 * 同じ日・同じ語なら同じ並びになり、正解の位置は語ごとに変わる。
 */
export function buildDailyQuizQuestion(
  dateKey: string,
  target: QuizSourceWord,
  distractors: readonly string[],
  distractorSource: DistractorSource,
): DailyQuizQuestion {
  const entries = [target.optionText, ...distractors].map((text, index) => ({
    text,
    isCorrect: index === 0,
    order: hashString(`${dateKey}:${target.slug}:${text}`),
  }));
  entries.sort((a, b) => a.order - b.order || a.text.localeCompare(b.text));

  const options = entries.map((entry, index) => ({ id: OPTION_IDS[index], text: entry.text }));
  const correctIndex = entries.findIndex((entry) => entry.isCorrect);

  return {
    id: `${dateKey}:${target.slug}`,
    slug: target.slug,
    term: target.term,
    level: target.level,
    options,
    correctOptionId: OPTION_IDS[correctIndex],
    example: target.example,
    distractorSource,
  };
}

function isBoundedString(value: unknown, max: number = MAX_STORED_TEXT_LENGTH): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function parseStoredQuestion(value: unknown): DailyQuizQuestion | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (!isBoundedString(raw.id) || !isBoundedString(raw.slug) || !isBoundedString(raw.term)) return null;
  if (!LEVELS.includes(raw.level as Word["level"])) return null;
  if (!Array.isArray(raw.options) || raw.options.length !== QUIZ_OPTION_COUNT) return null;

  const options: DailyQuizOption[] = [];
  for (const option of raw.options) {
    if (!option || typeof option !== "object") return null;
    const { id, text } = option as Record<string, unknown>;
    if (!isBoundedString(id, 8) || !isBoundedString(text)) return null;
    if (options.some((existing) => existing.id === id)) return null;
    options.push({ id, text });
  }
  if (!options.some((option) => option.id === raw.correctOptionId)) return null;

  let example: DailyQuizQuestion["example"] = null;
  if (raw.example !== null && raw.example !== undefined) {
    const { en, ja } = raw.example as Record<string, unknown>;
    if (!isBoundedString(en) || !isBoundedString(ja)) return null;
    example = { en, ja };
  }
  if (raw.distractorSource !== "ai" && raw.distractorSource !== "fallback") return null;

  return {
    id: raw.id,
    slug: raw.slug,
    term: raw.term,
    level: raw.level as Word["level"],
    options,
    correctOptionId: raw.correctOptionId as string,
    example,
    distractorSource: raw.distractorSource,
  };
}

/**
 * Redis から読んだ値を検証付きで DailyQuiz に戻す。形が違えば null。
 * Upstash のクライアントは JSON を自動で復元するため、文字列とオブジェクトの両方を受け付ける。
 */
export function parseStoredDailyQuiz(value: unknown): DailyQuiz | null {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  if (data.version !== DAILY_QUIZ_VERSION) return null;
  const dateKey = typeof data.dateKey === "string" ? parseTodayDateKey(data.dateKey) : null;
  if (!dateKey) return null;
  if (!isBoundedString(data.wordListVersion, 32) || !isBoundedString(data.generatedAt, 40)) return null;
  if (!Array.isArray(data.questions)) return null;
  if (data.questions.length === 0 || data.questions.length > TODAY_WORDS_COUNT) return null;

  const questions: DailyQuizQuestion[] = [];
  for (const item of data.questions) {
    const question = parseStoredQuestion(item);
    if (!question || questions.some((existing) => existing.id === question.id)) return null;
    questions.push(question);
  }

  return {
    version: DAILY_QUIZ_VERSION,
    dateKey,
    wordListVersion: data.wordListVersion,
    generatedAt: data.generatedAt,
    questions,
  };
}

/**
 * 保存済みのクイズが、その日の6語から同じ順序で作られたものか。
 * 解説を取得できなかった語は問題にならないため、問題数が6語より少ないことは許す。
 * 6語に無い語が混ざっている、または順序が違う場合は、別の6語から作られたとみなす。
 */
export function quizMatchesWords(quiz: DailyQuiz, words: readonly Pick<Word, "slug">[]): boolean {
  let cursor = 0;
  for (const question of quiz.questions) {
    const found = words.findIndex((word, index) => index >= cursor && word.slug === question.slug);
    if (found === -1) return false;
    cursor = found + 1;
  }
  return true;
}

export type QuizDaySummary = {
  total: number;
  answered: number;
  correctCount: number;
  completed: boolean;
  /** 不正解だった語（出題順） */
  wrongSlugs: string[];
};

/** 回答（出題順の選択肢 ID）から、その日の結果を集計する。 */
export function summarizeQuizDay(quiz: DailyQuiz, answers: readonly string[]): QuizDaySummary {
  const answered = Math.min(answers.length, quiz.questions.length);
  const wrongSlugs: string[] = [];
  let correctCount = 0;
  for (let index = 0; index < answered; index += 1) {
    const question = quiz.questions[index];
    if (answers[index] === question.correctOptionId) correctCount += 1;
    else wrongSlugs.push(question.slug);
  }
  return {
    total: quiz.questions.length,
    answered,
    correctCount,
    completed: answered === quiz.questions.length,
    wrongSlugs,
  };
}
