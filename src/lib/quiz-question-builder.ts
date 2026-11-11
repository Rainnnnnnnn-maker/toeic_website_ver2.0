import type { Word } from "@/data/words";
import type { WordDetails } from "@/types/word";
import { pickExample } from "@/lib/listen-utils";
import { hashString, parseTodayDateKey } from "@/lib/word-select";

/**
 * 既存の WordDetails（訳・品詞・類義語・例文）を、4択問題の選択肢に使える形へ整える純粋ロジック。
 * Redis / Gemini / Next.js のキャッシュ API に依存しない。
 *
 * 「今日の6語クイズ」（`daily-quiz.ts`）が次の2つに使う。
 * - 正解の選択肢：出題語の `japaneseTranslation` から訳語を選ぶ（`toQuizSourceWord`）。
 * - 代替の誤答：Gemini の誤答を使えないとき、他の収録語の訳から選ぶ（`pickDistractors`）。
 *
 * 新しい文章は生成しない。選択肢の文面は訳語の一部を選ぶだけで、書き換えはしない。
 * 組み立ては決定論的で、同じ入力なら同じ結果になる。
 *
 * 除外規則は「誤答が正解として成立する恐れ」を機械的に減らすだけで、正解の一意性を保証しない。
 * `buildQuizQuestion` と `flags` は、全語での品質を確かめる CLI（`scripts/prototype-quiz-questions.ts`）用である。
 */

export type TranslationClass = "verb" | "adjective" | "adverb" | "noun";
export type PartOfSpeech = TranslationClass | "other";

export type QuizSourceWord = {
  slug: string;
  term: string;
  level: Word["level"];
  /** `japaneseTranslation` の前後空白を除いたもの（選択肢にする前の原文） */
  translation: string;
  /** 比較用に正規化した訳語（原文のすべての訳語。括弧書きは除く） */
  terms: string[];
  /** 訳語から「する」「な」などの語尾を除いた比較用の語幹 */
  stems: string[];
  /** 先頭の訳語の語形。誤答はこれが同じ語から選ぶ */
  translationClass: TranslationClass;
  /** 選択肢として表示する文面。語形が同じ訳語を先頭から最大2つ並べたもの */
  optionText: string;
  /** `optionText` を構成する訳語の数 */
  optionTermCount: number;
  partsOfSpeech: PartOfSpeech[];
  /** 小文字化した英語の類義語（トップレベルと語義ごとの両方） */
  synonyms: string[];
  example: { en: string; ja: string } | null;
};

/** 訳の原文の形式上の特徴。コーパス全体の傾向を数えるために使う。 */
export type TranslationIssue =
  | "too-long"
  | "many-terms"
  | "has-latin"
  | "has-placeholder"
  | "has-parentheses"
  | "mixed-form"
  | "katakana-term";

/** 選択肢の文面に残る問題。1つでもあれば誤答の候補から外す。 */
export type OptionIssue =
  | "too-long"
  | "has-latin"
  | "has-placeholder"
  | "has-parentheses"
  | "katakana-only"
  | "irregular-form";

export type DistractorExclusion =
  | "different-form"
  | "unsuitable-format"
  | "listed-synonym"
  | "shared-synonym"
  | "shared-root"
  | "meaning-overlap"
  | "overlaps-other-option";

export type DistractorPick = {
  distractors: QuizSourceWord[];
  /** 語形が一致した候補の数（除外前） */
  sameFormCandidates: number;
  excluded: Record<DistractorExclusion, number>;
};

export type PrototypeQuizOption = {
  id: string;
  text: string;
  /** この訳の出どころの単語。確認用であり、配信データには含めない想定 */
  sourceSlug: string;
};

export type PrototypeQuizQuestion = {
  id: string;
  slug: string;
  term: string;
  type: "meaning-ja";
  prompt: string;
  options: PrototypeQuizOption[];
  correctOptionId: string;
  explanation: string;
  /** 人が優先して確認すべき点 */
  flags: string[];
};

export const QUIZ_OPTION_COUNT = 4;
/** 選択肢に並べる訳語の上限。語数を揃えて、長さで正解を推測されにくくする */
export const MAX_OPTION_TERMS = 2;
/** これより長い文面は選択肢として読みにくい */
export const MAX_OPTION_LENGTH = 20;
/** 訳の原文で「訳語が多い」とみなす数 */
export const MAX_TRANSLATION_TERMS = 3;
/** 正解だけが他より何文字以上長い／短いときに警告するか */
const LENGTH_OUTLIER_MARGIN = 4;

const OPTION_IDS = ["a", "b", "c", "d"] as const;
const CONTENT_CLASSES: TranslationClass[] = ["verb", "adjective", "adverb", "noun"];

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

/** 比較用の正規化。NFKC で全角記号を揃え、括弧書き・波ダッシュ・句点・空白を除く。 */
export function normalizeTerm(term: string): string {
  return term
    .normalize("NFKC")
    .replace(/\([^)]*\)/g, "")
    .replace(/[~〜.。\s]/g, "");
}

/**
 * 訳を表示用の訳語に分割する。文面は書き換えない。
 * 括弧の中の区切り文字では分けない（「農産物（果物・野菜）」を1語として扱う）。
 */
export function splitDisplayTerms(translation: string): string[] {
  const terms: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of translation) {
    if (char === "（" || char === "(") depth += 1;
    else if (char === "）" || char === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && /[、，,；;／/]/.test(char)) {
      terms.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  terms.push(current);
  return terms.map((term) => term.trim()).filter(Boolean);
}

/** 訳を比較用の訳語に分割する。中黒でも区切り、重複を除く。 */
export function splitTranslationTerms(translation: string): string[] {
  return unique(
    splitDisplayTerms(translation)
      .flatMap((term) => normalizeTerm(term).split("・"))
      .filter(Boolean),
  );
}

const STEM_SUFFIXES = [
  "している",
  "させる",
  "される",
  "できる",
  "する",
  "した",
  "的な",
  "的に",
  "的",
  "な",
  "の",
  "に",
];

/** 「承認する」と「承認」を同じ意味として扱えるよう、語尾を除いた語幹を返す（最低2文字残す）。 */
export function stemOfTerm(term: string): string {
  for (const suffix of STEM_SUFFIXES) {
    if (term.endsWith(suffix) && term.length - suffix.length >= 2) {
      return term.slice(0, -suffix.length);
    }
  }
  return term;
}

/** 「プレビュー」「タイムリーな」のように、見出し語の音写である恐れが高い訳語か。 */
export function isKatakanaTerm(term: string): boolean {
  return /^[ァ-ヺー]+$/.test(term.replace(/(する|な|の|に)$/, ""));
}

const PART_OF_SPEECH_RULES: Array<[RegExp, PartOfSpeech]> = [
  // 「形容動詞」「助動詞」「代名詞」「adverb」「pronoun」は部分一致で別の品詞に化けるため先に判定する
  [/形容|adjective/, "adjective"],
  [/副詞|adverb/, "adverb"],
  [/助動詞|代名詞|pronoun/, "other"],
  [/動詞|verb/, "verb"],
  [/名詞|noun/, "noun"],
];

/** 「名詞/動詞」「動詞（他動詞）」のような品詞表記を正規化する。 */
export function parsePartsOfSpeech(raw: string): PartOfSpeech[] {
  const pieces = raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .split(/[、,;/・\s]+/)
    .filter(Boolean);
  return unique(
    pieces.map((piece) => PART_OF_SPEECH_RULES.find(([pattern]) => pattern.test(piece))?.[1] ?? "other"),
  );
}

/**
 * 訳語の語形（動詞形・形容詞形・副詞形・名詞形）を決める。
 * 選択肢の語形が混ざると語形だけで正解を絞れるため、誤答は同じ語形から選ぶ。
 *
 * 品詞表記が1つならそれに従う。「隣接した」「価値のある」のような形容詞の訳は
 * 語尾だけでは動詞や名詞と区別できないためである。品詞が複数ある語だけ、
 * その品詞の範囲で語尾から選ぶ。
 */
export function classifyTranslationTerm(term: string, partsOfSpeech: PartOfSpeech[]): TranslationClass {
  const labelled = CONTENT_CLASSES.filter((contentClass) => partsOfSpeech.includes(contentClass));
  if (labelled.length === 1) return labelled[0];

  const allowed = labelled.length > 0 ? labelled : CONTENT_CLASSES;
  const can = (contentClass: TranslationClass) => allowed.includes(contentClass);

  if (can("verb") && /(する|させる|される)$/.test(term)) return "verb";
  if (can("adverb") && /(に|て|と|へ)$/.test(term)) return "adverb";
  // 「目的」のような2文字の名詞を「客観的」と同じ扱いにしない
  if (can("adjective") && term.endsWith("的") && term.length >= 3) return "adjective";
  if (can("adjective") && /(な|の|い|た|だ|ある|ない|できる)$/.test(term)) return "adjective";
  if (can("verb") && /[るすくぐむぶつぬう]$/.test(term)) return "verb";
  if (can("adverb") && term.endsWith("く")) return "adverb";
  return can("noun") ? "noun" : allowed[0];
}

/** 単語と WordDetails から、出題・誤答の両方に使う材料を取り出す。訳が無ければ null。 */
export function toQuizSourceWord(word: Word, detail: WordDetails): QuizSourceWord | null {
  const translation = (detail.japaneseTranslation ?? "").trim();
  const meanings = detail.meanings ?? [];
  const partsOfSpeech = unique(meanings.flatMap((meaning) => parsePartsOfSpeech(meaning.partOfSpeech ?? "")));

  const seen = new Set<string>();
  const classified = splitDisplayTerms(translation).flatMap((text) => {
    const normalized = normalizeTerm(text);
    if (!normalized || seen.has(normalized)) return [];
    seen.add(normalized);
    return [{ text, normalized, contentClass: classifyTranslationTerm(normalized, partsOfSpeech) }];
  });
  if (classified.length === 0) return null;

  // 先頭の訳語と同じ語形だけを残し、音写と思われるカタカナ語は他に訳語があれば外す
  const translationClass = classified[0].contentClass;
  const sameForm = classified.filter((entry) => entry.contentClass === translationClass);
  const withoutKatakana = sameForm.filter((entry) => !isKatakanaTerm(entry.normalized));
  const chosen = (withoutKatakana.length > 0 ? withoutKatakana : sameForm).slice(0, MAX_OPTION_TERMS);

  const terms = splitTranslationTerms(translation);
  const synonyms = unique(
    [
      ...(detail.synonyms ?? []),
      ...meanings.flatMap((meaning) =>
        (meaning.detailedMeanings ?? []).flatMap((detailed) => detailed.synonyms ?? []),
      ),
    ]
      .map((synonym) => synonym.trim().toLowerCase())
      .filter(Boolean),
  );
  const example = pickExample(detail);

  return {
    slug: word.slug,
    term: word.term,
    level: word.level,
    translation,
    terms,
    stems: unique(terms.map(stemOfTerm)),
    translationClass,
    optionText: chosen.map((entry) => entry.text).join("、"),
    optionTermCount: chosen.length,
    partsOfSpeech,
    synonyms,
    example: example.en.trim() && example.ja.trim() ? { en: example.en.trim(), ja: example.ja.trim() } : null,
  };
}

/** 訳の原文の形式上の特徴を返す。選択肢の文面ではなく、元データの傾向を見るためのもの。 */
export function getTranslationIssues(source: QuizSourceWord): TranslationIssue[] {
  const issues: TranslationIssue[] = [];
  const normalized = source.translation.normalize("NFKC");
  const displayTerms = splitDisplayTerms(source.translation).map(normalizeTerm).filter(Boolean);

  if (source.translation.length > MAX_OPTION_LENGTH) issues.push("too-long");
  if (displayTerms.length > MAX_TRANSLATION_TERMS) issues.push("many-terms");
  if (/[a-z]/i.test(normalized)) issues.push("has-latin");
  if (/[~〜]|\.{2,}/.test(normalized)) issues.push("has-placeholder");
  if (/[()]/.test(normalized)) issues.push("has-parentheses");
  const classes = unique(displayTerms.map((term) => classifyTranslationTerm(term, source.partsOfSpeech)));
  if (classes.length > 1) issues.push("mixed-form");
  if (displayTerms.some(isKatakanaTerm)) issues.push("katakana-term");

  return issues;
}

/**
 * 同じ語形の中でも、辞書に載る形から外れていて並べると浮く訳語か。
 * 動詞形の「占められている」、形容詞形の「喜んで」「最新式」、名詞形の「新しい」などが該当する。
 * 品詞表記と訳の書き方が食い違っている語を拾う目的も兼ねる。
 */
export function hasIrregularForm(term: string, contentClass: TranslationClass): boolean {
  if (contentClass === "verb") return /(ている|でいる)$/.test(term) || !/[るすくぐむぶつぬう]$/.test(term);
  if (contentClass === "adjective") return !/(な|の|い|た|だ|る|的|き)$/.test(term);
  if (contentClass === "noun") return /(する|な|しい)$/.test(term);
  return false;
}

/** 選択肢の文面に残る問題を返す。 */
export function getOptionIssues(source: QuizSourceWord): OptionIssue[] {
  const issues: OptionIssue[] = [];
  const normalized = source.optionText.normalize("NFKC");
  const optionTerms = splitDisplayTerms(source.optionText).map(normalizeTerm).filter(Boolean);

  if (source.optionText.length > MAX_OPTION_LENGTH) issues.push("too-long");
  if (/[a-z]/i.test(normalized)) issues.push("has-latin");
  if (/[~〜]|\.{2,}/.test(normalized)) issues.push("has-placeholder");
  if (/[()]/.test(normalized)) issues.push("has-parentheses");
  if (optionTerms.every(isKatakanaTerm)) issues.push("katakana-only");
  if (optionTerms.some((term) => hasIrregularForm(term, source.translationClass))) issues.push("irregular-form");

  return issues;
}

/** 語幹が一致、または一方が他方を含む訳語があれば、意味が重なるとみなす。 */
export function hasMeaningOverlap(a: QuizSourceWord, b: QuizSourceWord): boolean {
  return a.stems.some((stemA) =>
    b.stems.some((stemB) => stemA === stemB || stemA.includes(stemB) || stemB.includes(stemA)),
  );
}

/** employ / employee / employment のような派生語どうしか（先頭一致の長さで近似する）。 */
export function sharesRoot(a: string, b: string): boolean {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  const shorter = Math.min(left.length, right.length);
  let common = 0;
  while (common < shorter && left[common] === right[common]) common += 1;
  return common >= 5 && common >= shorter * 0.6;
}

function isListedSynonym(a: QuizSourceWord, b: QuizSourceWord): boolean {
  const termA = a.term.toLowerCase();
  const termB = b.term.toLowerCase();
  return a.synonyms.includes(termB) || b.synonyms.includes(termA);
}

/** 互いを類義語に挙げていなくても、同じ英語の類義語を共有していれば近い意味とみなす。 */
function hasSharedSynonym(a: QuizSourceWord, b: QuizSourceWord): boolean {
  return a.synonyms.some((synonym) => b.synonyms.includes(synonym));
}

function emptyExclusions(): Record<DistractorExclusion, number> {
  return {
    "different-form": 0,
    "unsuitable-format": 0,
    "listed-synonym": 0,
    "shared-synonym": 0,
    "shared-root": 0,
    "meaning-overlap": 0,
    "overlaps-other-option": 0,
  };
}

/**
 * 出題語に対する誤答を選ぶ。
 * 語形が同じ候補だけを残し、類義語・派生語・訳語の重なりがあるものを外したうえで、
 * 訳語の数とレベルが近い候補を優先し、同順位は `出題語:候補` のハッシュ順にする。
 */
export function pickDistractors(
  target: QuizSourceWord,
  pool: readonly QuizSourceWord[],
  count: number = QUIZ_OPTION_COUNT - 1,
): DistractorPick {
  const excluded = emptyExclusions();
  const eligible: QuizSourceWord[] = [];
  let sameFormCandidates = 0;

  for (const candidate of pool) {
    if (candidate.slug === target.slug) continue;
    if (candidate.translationClass !== target.translationClass) {
      excluded["different-form"] += 1;
      continue;
    }
    sameFormCandidates += 1;
    if (getOptionIssues(candidate).length > 0) excluded["unsuitable-format"] += 1;
    else if (isListedSynonym(target, candidate)) excluded["listed-synonym"] += 1;
    else if (hasSharedSynonym(target, candidate)) excluded["shared-synonym"] += 1;
    else if (sharesRoot(target.term, candidate.term)) excluded["shared-root"] += 1;
    else if (hasMeaningOverlap(target, candidate)) excluded["meaning-overlap"] += 1;
    else eligible.push(candidate);
  }

  const preference = (candidate: QuizSourceWord) =>
    (candidate.optionTermCount === target.optionTermCount ? 0 : 2) + (candidate.level === target.level ? 0 : 1);
  const order = (candidate: QuizSourceWord) => hashString(`${target.slug}:${candidate.slug}`);
  eligible.sort(
    (a, b) => preference(a) - preference(b) || order(a) - order(b) || a.slug.localeCompare(b.slug),
  );

  const distractors: QuizSourceWord[] = [];
  for (const candidate of eligible) {
    if (distractors.length >= count) break;
    if (distractors.some((picked) => hasMeaningOverlap(picked, candidate) || hasSharedSynonym(picked, candidate))) {
      excluded["overlaps-other-option"] += 1;
      continue;
    }
    distractors.push(candidate);
  }

  return { distractors, sameFormCandidates, excluded };
}

function lengthFlags(target: QuizSourceWord, distractors: QuizSourceWord[]): string[] {
  const lengths = distractors.map((distractor) => distractor.optionText.length);
  const correct = target.optionText.length;
  if (correct >= Math.max(...lengths) + LENGTH_OUTLIER_MARGIN) return ["correct-longest"];
  if (correct <= Math.min(...lengths) - LENGTH_OUTLIER_MARGIN) return ["correct-shortest"];
  return [];
}

/**
 * 4択問題を組み立てる。誤答が足りなければ `question` は null。
 * 選択肢の並びは `出題語:option:出どころ` のハッシュ順で、正解の位置は語ごとに変わる。
 */
export function buildQuizQuestion(
  target: QuizSourceWord,
  pool: readonly QuizSourceWord[],
): { question: PrototypeQuizQuestion | null; pick: DistractorPick } {
  const pick = pickDistractors(target, pool);
  if (pick.distractors.length < QUIZ_OPTION_COUNT - 1) return { question: null, pick };

  const order = (source: QuizSourceWord) => hashString(`${target.slug}:option:${source.slug}`);
  const sources = [target, ...pick.distractors].sort(
    (a, b) => order(a) - order(b) || a.slug.localeCompare(b.slug),
  );
  const options = sources.map((source, index) => ({
    id: OPTION_IDS[index],
    text: source.optionText,
    sourceSlug: source.slug,
  }));
  const correctOptionId = options.find((option) => option.sourceSlug === target.slug)?.id ?? OPTION_IDS[0];

  const flags = [
    ...getOptionIssues(target).map((issue) => `correct:${issue}`),
    ...lengthFlags(target, pick.distractors),
    ...(target.example ? [] : ["no-example"]),
  ];

  return {
    question: {
      id: `meaning-${target.slug}-001`,
      slug: target.slug,
      term: target.term,
      type: "meaning-ja",
      prompt: `${target.term} の意味として最も適切なものは？`,
      options,
      correctOptionId,
      explanation: target.example ? `${target.example.en} = ${target.example.ja}` : "",
      flags,
    },
    pick,
  };
}

/** 日付キー（YYYY-MM-DD）から連続する日付キーを返す。先読み期間の出題語を計算するために使う。 */
export function listUpcomingDateKeys(startKey: string, days: number): string[] {
  const start = parseTodayDateKey(startKey);
  if (!start || !Number.isInteger(days) || days <= 0) return [];
  const startTime = Date.parse(`${start}T00:00:00Z`);
  return Array.from({ length: days }, (_, offset) =>
    new Date(startTime + offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
}
