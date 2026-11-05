/** 学習モードで持ち越す単語だけを保存する。カードや連続正解数は含めない。 */
export type SavedStudyWords = {
  v: 1;
  forgottenSlugs: string[];
  laterSlugs: string[];
};

export type SavedStudyWordKind = "forgotten" | "later";

/** 未対応の版は、編集可能な空一覧や復旧可能な不正値とは区別する。 */
export type SavedStudyWordsParseResult = {
  status: "ready" | "invalid" | "unsupported-version";
  words: SavedStudyWords;
};

export const STUDY_SAVED_WORDS_KEY = "toeic-study-saved-words-v1";

/** SSR と未保存時に共有する、参照が変わらない空のスナップショット。 */
export const EMPTY_SAVED_STUDY_WORDS: SavedStudyWords = {
  v: 1,
  forgottenSlugs: [],
  laterSlugs: [],
};

/** 配列なら文字列の要素だけを返す。配列でなければ null。壊れた要素1つで他の単語まで失わないようにする。 */
function pickStringSlugs(value: unknown): string[] | null {
  return Array.isArray(value)
    ? value.filter((slug): slug is string => typeof slug === "string")
    : null;
}

function uniqueNonblankSlugs(slugs: string[]): string[] {
  return [...new Set(slugs.filter((slug) => slug.trim().length > 0))];
}

/**
 * 保存値を検証する。重複分類は「覚えていない」を優先する。
 * 配列内の文字列以外の要素は個別に捨てて残りの単語を守り、
 * 未対応の版は中身を解釈せず、呼び出し元が元データを保護できる状態を返す。
 * JSON として壊れている値と、既知の版の不正な構造は復旧可能な不正値として返す。
 */
export function parseSavedStudyWords(raw: string | null): SavedStudyWordsParseResult {
  if (raw === null) return { status: "ready", words: EMPTY_SAVED_STUDY_WORDS };
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return { status: "invalid", words: EMPTY_SAVED_STUDY_WORDS };
    }
    const source = value as Record<string, unknown>;
    // 未知の版ではスキーマ自体が異なる可能性があるため、配列に触れる前に判定する。
    if (Object.hasOwn(source, "v") && source.v !== 1) {
      return { status: "unsupported-version", words: EMPTY_SAVED_STUDY_WORDS };
    }
    const savedForgotten = pickStringSlugs(source.forgottenSlugs);
    const savedLater = pickStringSlugs(source.laterSlugs);
    if (source.v !== 1 || savedForgotten === null || savedLater === null) {
      return { status: "invalid", words: EMPTY_SAVED_STUDY_WORDS };
    }

    const forgottenSlugs = uniqueNonblankSlugs(savedForgotten);
    const forgotten = new Set(forgottenSlugs);
    const laterSlugs = uniqueNonblankSlugs(savedLater).filter((slug) => !forgotten.has(slug));
    if (forgottenSlugs.length === 0 && laterSlugs.length === 0) {
      return { status: "ready", words: EMPTY_SAVED_STUDY_WORDS };
    }
    return { status: "ready", words: { v: 1, forgottenSlugs, laterSlugs } };
  } catch {
    return { status: "invalid", words: EMPTY_SAVED_STUDY_WORDS };
  }
}

function includeSlug(slugs: string[], slug: string): string[] {
  return slugs.includes(slug) ? slugs : [...slugs, slug];
}

function excludeSlug(slugs: string[], slug: string): string[] {
  return slugs.includes(slug) ? slugs.filter((value) => value !== slug) : slugs;
}

/** 同じ語は一方にだけ置く。null は両方から外し、変更のない既存順序を保つ。 */
export function updateSavedStudyWord(
  state: SavedStudyWords,
  slug: string,
  kind: SavedStudyWordKind | null,
): SavedStudyWords {
  if (slug.trim().length === 0) return state;
  const forgottenSlugs = kind === "forgotten"
    ? includeSlug(state.forgottenSlugs, slug)
    : excludeSlug(state.forgottenSlugs, slug);
  const laterSlugs = kind === "later"
    ? includeSlug(state.laterSlugs, slug)
    : excludeSlug(state.laterSlugs, slug);
  if (forgottenSlugs === state.forgottenSlugs && laterSlugs === state.laterSlugs) return state;
  if (forgottenSlugs.length === 0 && laterSlugs.length === 0) return EMPTY_SAVED_STUDY_WORDS;
  return { v: 1, forgottenSlugs, laterSlugs };
}

/** 収録から外れた語を表示対象から除外する。保存値や渡された集合は変更しない。 */
export function filterSavedStudyWords(
  state: SavedStudyWords,
  knownSlugs: ReadonlySet<string>,
): SavedStudyWords {
  const forgottenSlugs = state.forgottenSlugs.filter((slug) => knownSlugs.has(slug));
  const laterSlugs = state.laterSlugs.filter((slug) => knownSlugs.has(slug));
  if (
    forgottenSlugs.length === state.forgottenSlugs.length &&
    laterSlugs.length === state.laterSlugs.length
  ) return state;
  if (forgottenSlugs.length === 0 && laterSlugs.length === 0) return EMPTY_SAVED_STUDY_WORDS;
  return { v: 1, forgottenSlugs, laterSlugs };
}
