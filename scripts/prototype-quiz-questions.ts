/**
 * 「今日の6語チャレンジ」E案の試作 CLI（読み取り専用）。
 *
 * 既存の WordDetails だけから4択問題を組めるかを確かめる。正解は出題語の
 * `japaneseTranslation`、誤答は他の収録語の `japaneseTranslation` から選ぶ。
 * 設計の背景は docs/plans/TOEIC_今日の6語チャレンジ_実装イメージ_実現性評価.md の 6.4。
 *
 * 実行方法:
 *   npm run quiz:prototype                        # 今日から14日分
 *   npm run quiz:prototype -- --days=30           # 先読み日数を変える
 *   npm run quiz:prototype -- --start=2026-12-01  # 起点の日付キーを指定
 *   npm run quiz:prototype -- --source=local      # 単語リストを __words__/*.txt から読む
 *   npm run quiz:prototype -- --snapshot          # 前回取得した解説を使い、通信しない
 *
 * 行うこと:
 *   単語リストの読込（既定は本番と同じ Vercel Blob）→ Redis から `word:<slug>` を MGET
 *   → 編集済みデータ（word-editorial.json）を優先 → 問題の組み立てと集計
 *   → `.artifacts/quiz-prototype/`（git 管理外）へ出力
 *        report.md                    集計と、先読み期間の問題の一覧（目視確認用）
 *        questions.json               先読み期間の問題データ
 *        preview/index.html           ブラウザで実際に解いて確かめる画面（単独の HTML）
 *        word-details.snapshot.json   取得した単語リストと解説（--snapshot で再利用）
 *
 * 画面で確かめるには、出力後に preview/index.html を開く。Claude Code のブラウザでは
 * .claude/launch.json の "Quiz Prototype Preview" を起動する。
 *
 * 行わないこと:
 *   Gemini による生成、Redis・Vector・Blob への書き込み。Redis に無い語は「未キャッシュ」として数えるだけ。
 *
 * 必要な環境変数（--env-file=.env.local で読み込む。--snapshot のときは不要）:
 *   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN,
 *   BLOB_URL_IMPORTANT / BLOB_URL_MEDIUM / BLOB_URL_HIGH もしくは BLOB_READ_WRITE_TOKEN
 *   （--source=local のときは Blob 系は不要）
 *
 * `tsx` で直接動かす Node.js CLI なので `server-only` は import しない。
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { getEditorialWord } from "../src/data/word-editorial";
import { HTTP_TIMEOUT_MS } from "../src/lib/http-retry";
import {
  buildQuizQuestion,
  getOptionIssues,
  getTranslationIssues,
  listUpcomingDateKeys,
  toQuizSourceWord,
  type DistractorExclusion,
  type OptionIssue,
  type PrototypeQuizQuestion,
  type QuizSourceWord,
  type TranslationClass,
  type TranslationIssue,
} from "../src/lib/quiz-question-builder";
import { parseStoredWordDetails } from "../src/lib/word-detail-parse";
import { TODAY_WORDS_COUNT, getTodayKey, parseTodayDateKey, selectTodayWords } from "../src/lib/word-select";
import {
  hasDirectBlobUrls,
  loadWordData,
  resolveDefaultWordSource,
  type WordSource,
} from "../src/lib/word-source";
import type { Word } from "../src/data/words";
import type { WordDetails } from "../src/types/word";
import { renderPreviewHtml, type PreviewQuestion } from "./quiz-prototype-preview";

const REDIS_MGET_BATCH = 100;
const DEFAULT_DAYS = 14;
const MAX_DAYS = 365;
const OUTPUT_DIR = path.join(".artifacts", "quiz-prototype");
const SNAPSHOT_FILE = path.join(OUTPUT_DIR, "word-details.snapshot.json");
// 確認用の画面だけを置くフォルダ。ローカルで配信しても解説のスナップショットは公開されない
const PREVIEW_DIR = path.join(OUTPUT_DIR, "preview");

type Args = {
  days: number;
  startKey: string;
  source: WordSource;
  useSnapshot: boolean;
};

type DetailOrigin = "editorial" | "redis";
type DetailEntry = { origin: DetailOrigin; detail: WordDetails };

type Snapshot = {
  capturedAt: string;
  source: WordSource;
  words: Word[];
  details: Record<string, DetailEntry>;
};

type BuildResult = {
  source: QuizSourceWord;
  question: PrototypeQuizQuestion | null;
  excluded: Record<DistractorExclusion, number>;
};

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    days: DEFAULT_DAYS,
    startKey: getTodayKey(),
    source: resolveDefaultWordSource(),
    useSnapshot: false,
  };
  for (const arg of argv) {
    if (arg === "--snapshot") {
      args.useSnapshot = true;
    } else if (arg.startsWith("--days=")) {
      const days = Number(arg.slice("--days=".length));
      if (!Number.isInteger(days) || days <= 0 || days > MAX_DAYS) {
        fail(`Invalid --days (expected an integer from 1 to ${MAX_DAYS})`);
      }
      args.days = days;
    } else if (arg.startsWith("--start=")) {
      const startKey = parseTodayDateKey(arg.slice("--start=".length));
      if (!startKey) fail("Invalid --start (expected YYYY-MM-DD)");
      args.startKey = startKey;
    } else if (arg.startsWith("--source=")) {
      const value = arg.slice("--source=".length);
      if (value !== "local" && value !== "blob") fail('Invalid --source (expected "local" or "blob")');
      args.source = value;
    } else {
      console.warn(`Unknown argument ignored: ${arg}`);
    }
  }
  return args;
}

/** 値は表示しない。不足している変数名だけを伝える。 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) fail(`Missing required environment variable: ${name}`);
  return value;
}

/** 単語リストと解説を上流から読む（Blob の取得と Redis の MGET のみ）。 */
async function fetchSnapshot(source: WordSource, setStage: (stage: string) => void): Promise<Snapshot> {
  const redisUrl = requireEnv("UPSTASH_REDIS_REST_URL");
  const redisToken = requireEnv("UPSTASH_REDIS_REST_TOKEN");
  if (source === "blob" && !hasDirectBlobUrls()) requireEnv("BLOB_READ_WRITE_TOKEN");

  setStage("loading the word list");
  const words = (await loadWordData(source)).allWords;

  setStage("reading word details from Redis");
  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
    retry: { retries: 1, backoff: () => 200 },
    signal: () => AbortSignal.timeout(HTTP_TIMEOUT_MS.redis),
  });
  const details: Record<string, DetailEntry> = {};
  for (let offset = 0; offset < words.length; offset += REDIS_MGET_BATCH) {
    const batch = words.slice(offset, offset + REDIS_MGET_BATCH);
    const values = await redis.mget<unknown[]>(...batch.map((word) => `word:${word.slug}`));
    batch.forEach((word, index) => {
      // サイトと同じく、編集済みデータがあれば Redis より優先する
      const editorial = getEditorialWord(word.slug);
      if (editorial) {
        details[word.slug] = { origin: "editorial", detail: editorial.detail };
        return;
      }
      const detail = parseStoredWordDetails(values[index]);
      if (detail) details[word.slug] = { origin: "redis", detail };
    });
  }
  return { capturedAt: new Date().toISOString(), source, words, details };
}

async function readSnapshot(): Promise<Snapshot> {
  const raw = await readFile(SNAPSHOT_FILE, "utf8").catch(() => null);
  if (raw === null) fail(`Snapshot not found: ${SNAPSHOT_FILE}. Run once without --snapshot first.`);
  const snapshot = JSON.parse(raw) as Partial<Snapshot>;
  if (!Array.isArray(snapshot.words) || typeof snapshot.details !== "object" || snapshot.details === null) {
    fail(`Snapshot is malformed: ${SNAPSHOT_FILE}. Run once without --snapshot to recreate it.`);
  }
  return snapshot as Snapshot;
}

function percent(count: number, total: number): string {
  return total === 0 ? "0.0%" : `${((count / total) * 100).toFixed(1)}%`;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
}

function countBy<T extends string>(values: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

const CLASS_LABELS: Record<TranslationClass, string> = {
  verb: "動詞形",
  adjective: "形容詞形",
  adverb: "副詞形",
  noun: "名詞形",
};

const TRANSLATION_ISSUE_LABELS: Record<TranslationIssue, string> = {
  "too-long": "20文字を超える",
  "many-terms": "訳語が4つ以上",
  "has-latin": "英字を含む",
  "has-placeholder": "「〜」「…」を含む",
  "has-parentheses": "括弧書きを含む",
  "mixed-form": "訳語の語形が混在",
  "katakana-term": "カタカナだけの訳語を含む",
};

const OPTION_ISSUE_LABELS: Record<OptionIssue, string> = {
  "too-long": "20文字を超える",
  "has-latin": "英字を含む",
  "has-placeholder": "「〜」「…」を含む",
  "has-parentheses": "括弧書きを含む",
  "katakana-only": "カタカナ語だけ（音写の恐れ）",
  "irregular-form": "並べると浮く語形（「〜ている」「〜して」など）",
};

/** 確認用の画面で、問題ごとの確認点を短い日本語で示すためのラベル */
const FLAG_LABELS: Record<string, string> = {
  "correct-longest": "正解だけが長い",
  "correct-shortest": "正解だけが短い",
  "correct:too-long": "正解が20文字を超える",
  "correct:has-latin": "正解に英字",
  "correct:has-placeholder": "正解に「〜」",
  "correct:has-parentheses": "正解に括弧書き",
  "correct:katakana-only": "正解がカタカナ語だけ",
  "correct:irregular-form": "正解の語形が浮く",
  "no-example": "例文なし",
};

const EXCLUSION_LABELS: Record<DistractorExclusion, string> = {
  "different-form": "語形が違う",
  "unsuitable-format": "選択肢に向かない形式",
  "listed-synonym": "類義語として登録済み",
  "shared-synonym": "同じ類義語を共有",
  "shared-root": "派生語（先頭一致）",
  "meaning-overlap": "訳語が重なる",
  "overlaps-other-option": "他の誤答と意味が重なる",
};

function tableRows(rows: string[][]): string[] {
  return rows.map((row) => `| ${row.join(" | ")} |`);
}

function countRows<K extends string>(labels: Record<K, string>, counts: Map<K, number>, total: number): string[] {
  return tableRows(
    (Object.keys(labels) as K[]).map((key) => [
      `${labels[key]}（\`${key}\`）`,
      String(counts.get(key) ?? 0),
      percent(counts.get(key) ?? 0, total),
    ]),
  );
}

function renderQuestion(result: BuildResult): string[] {
  const { source, question } = result;
  const heading = `**${source.term}**（${CLASS_LABELS[source.translationClass]}・${source.level}）`;
  const original = source.optionText === source.translation ? [] : [`- 訳の原文：${source.translation}`];
  if (!question) {
    return [heading, "", "- 問題を組めなかった（誤答の候補が不足）。", ...original, ""];
  }
  return [
    heading,
    "",
    "| | 選択肢 | 訳の出どころ |",
    "|---|---|---|",
    ...tableRows(
      question.options.map((option) => [
        option.id === question.correctOptionId ? `正解 ${option.id}` : option.id,
        option.text,
        option.sourceSlug,
      ]),
    ),
    "",
    ...original,
    `- 解説：${question.explanation || "（例文なし）"}`,
    `- 確認点：${question.flags.length > 0 ? question.flags.map((flag) => `\`${flag}\``).join("、") : "なし"}`,
    "",
  ];
}

function renderReport(input: {
  args: Args;
  generatedAt: string;
  snapshot: Snapshot;
  missingSlugs: string[];
  noTranslationSlugs: string[];
  pool: QuizSourceWord[];
  results: Map<string, BuildResult>;
  schedule: Array<{ dateKey: string; words: Word[] }>;
}): string {
  const { args, snapshot, pool, results, schedule } = input;
  const corpus = snapshot.words;
  const origins = countBy(Object.values(snapshot.details).map((entry) => entry.origin));
  const all = [...results.values()];
  const built = all.filter((result) => result.question !== null);
  const failed = all.filter((result) => result.question === null);
  const flagged = built.filter((result) => (result.question?.flags.length ?? 0) > 0);

  const translationIssues = countBy(pool.flatMap((source) => getTranslationIssues(source)));
  const cleanTranslations = pool.filter((source) => getTranslationIssues(source).length === 0).length;
  const optionIssues = countBy(pool.flatMap((source) => getOptionIssues(source)));
  const cleanOptions = pool.filter((source) => getOptionIssues(source).length === 0).length;
  const trimmed = pool.filter((source) => source.optionText !== source.translation).length;
  const classCounts = countBy(pool.map((source) => source.translationClass));
  const rawLengths = pool.map((source) => source.translation.length).sort((a, b) => a - b);
  const optionLengths = pool.map((source) => source.optionText.length).sort((a, b) => a - b);
  const positions = countBy(built.map((result) => result.question?.correctOptionId ?? "?"));
  const flagKinds = countBy(built.flatMap((result) => result.question?.flags ?? []));
  const exclusionTotals = new Map<DistractorExclusion, number>();
  for (const result of all) {
    for (const [reason, count] of Object.entries(result.excluded) as Array<[DistractorExclusion, number]>) {
      exclusionTotals.set(reason, (exclusionTotals.get(reason) ?? 0) + count);
    }
  }

  const windowWords = Array.from(new Map(schedule.flatMap((day) => day.words).map((word) => [word.slug, word])).values());
  const windowBuilt = windowWords.filter((word) => results.get(word.slug)?.question);
  const windowFlagged = windowBuilt.filter((word) => (results.get(word.slug)?.question?.flags.length ?? 0) > 0);
  const playableDays = schedule.filter((day) => day.words.every((word) => results.get(word.slug)?.question)).length;

  const lines: string[] = [
    "# 今日の6語チャレンジ E案 試作レポート",
    "",
    "正解は出題語の `japaneseTranslation`、誤答は他の収録語の `japaneseTranslation` から機械的に選んだ結果である。",
    "**人による確認は行っていない。** 正解の一意性・訳の正確さは、4章の一覧を目視して判断すること。",
    "",
    `- 生成日時：${input.generatedAt}`,
    `- 単語リスト：${snapshot.source}（${corpus.length}語）`,
    `- 解説の取得日時：${snapshot.capturedAt}${args.useSnapshot ? "（スナップショットを再利用）" : ""}`,
    `- 先読み：${args.startKey} から ${args.days}日分`,
    "",
    "## 1. 解説の取得状況",
    "",
    "| 項目 | 語数 | 割合 |",
    "|---|---:|---:|",
    ...tableRows([
      ["コーパス", String(corpus.length), "100.0%"],
      ["Redis に解説あり", String(origins.get("redis") ?? 0), percent(origins.get("redis") ?? 0, corpus.length)],
      ["編集済みデータを使用", String(origins.get("editorial") ?? 0), percent(origins.get("editorial") ?? 0, corpus.length)],
      ["未キャッシュ（解説なし）", String(input.missingSlugs.length), percent(input.missingSlugs.length, corpus.length)],
      ["解説はあるが訳が空", String(input.noTranslationSlugs.length), percent(input.noTranslationSlugs.length, corpus.length)],
      ["問題の材料として使える語", String(pool.length), percent(pool.length, corpus.length)],
    ]),
    "",
    "## 2. 訳の形式",
    "",
    "### 2.1 訳の原文（japaneseTranslation そのまま）",
    "",
    `文字数：中央値 ${quantile(rawLengths, 0.5)}、90パーセンタイル ${quantile(rawLengths, 0.9)}、最大 ${rawLengths.at(-1) ?? 0}`,
    "",
    "| 原文の特徴 | 語数 | 割合 |",
    "|---|---:|---:|",
    ...tableRows([["該当なし", String(cleanTranslations), percent(cleanTranslations, pool.length)]]),
    ...countRows(TRANSLATION_ISSUE_LABELS, translationIssues, pool.length),
    "",
    "### 2.2 選択肢の文面（語形が同じ訳語を先頭から最大2つ。音写のカタカナ語は他に訳語があれば除外）",
    "",
    `文字数：中央値 ${quantile(optionLengths, 0.5)}、90パーセンタイル ${quantile(optionLengths, 0.9)}、最大 ${optionLengths.at(-1) ?? 0}`,
    "",
    "| 項目 | 語数 | 割合 |",
    "|---|---:|---:|",
    ...tableRows([
      ["原文から訳語を絞った語", String(trimmed), percent(trimmed, pool.length)],
      ["文面に問題なし（誤答の候補にできる）", String(cleanOptions), percent(cleanOptions, pool.length)],
    ]),
    ...countRows(OPTION_ISSUE_LABELS, optionIssues, pool.length),
    "",
    "| 先頭の訳語の語形 | 語数 | 割合 |",
    "|---|---:|---:|",
    ...tableRows(
      (Object.keys(CLASS_LABELS) as TranslationClass[]).map((key) => [
        CLASS_LABELS[key],
        String(classCounts.get(key) ?? 0),
        percent(classCounts.get(key) ?? 0, pool.length),
      ]),
    ),
    "",
    "## 3. 全語で問題を組んだ結果",
    "",
    "| 項目 | 語数 | 割合 |",
    "|---|---:|---:|",
    ...tableRows([
      ["問題を組めた", String(built.length), percent(built.length, pool.length)],
      ["誤答が足りず組めなかった", String(failed.length), percent(failed.length, pool.length)],
      ["確認点が付いた問題", String(flagged.length), percent(flagged.length, built.length)],
      ["確認点が無い問題", String(built.length - flagged.length), percent(built.length - flagged.length, built.length)],
    ]),
    "",
    "| 正解の位置 | 問題数 | 割合 |",
    "|---|---:|---:|",
    ...tableRows(
      ["a", "b", "c", "d"].map((id) => [id, String(positions.get(id) ?? 0), percent(positions.get(id) ?? 0, built.length)]),
    ),
    "",
    "| 確認点の種類 | 問題数 |",
    "|---|---:|",
    ...tableRows([...flagKinds.entries()].sort((a, b) => b[1] - a[1]).map(([kind, count]) => [`\`${kind}\``, String(count)])),
    "",
    "| 誤答候補の除外理由 | 1問あたりの平均 |",
    "|---|---:|",
    ...tableRows(
      (Object.keys(EXCLUSION_LABELS) as DistractorExclusion[]).map((key) => [
        EXCLUSION_LABELS[key],
        all.length === 0 ? "0.0" : ((exclusionTotals.get(key) ?? 0) / all.length).toFixed(1),
      ]),
    ),
    "",
    "## 4. 先読み期間の問題（目視確認用）",
    "",
    "| 項目 | 値 |",
    "|---|---:|",
    ...tableRows([
      ["日数", String(schedule.length)],
      ["出題される語（重複除く）", String(windowWords.length)],
      ["問題を組めた語", String(windowBuilt.length)],
      ["うち確認点が付いた語", String(windowFlagged.length)],
      ["問題を組めない語", String(windowWords.length - windowBuilt.length)],
      [`${TODAY_WORDS_COUNT}問すべて揃う日`, `${playableDays} / ${schedule.length}`],
    ]),
    "",
    "各問題で確かめること：(1) 正解以外に正しい選択肢が無いか、(2) 語形や長さで正解が浮いていないか、(3) 訳の表記が自然か。",
    "",
  ];

  for (const day of schedule) {
    lines.push(`### ${day.dateKey}`, "");
    for (const word of day.words) {
      const result = results.get(word.slug);
      if (result) lines.push(...renderQuestion(result));
      else lines.push(`**${word.term}**（${word.level}）`, "", "- 問題を組めなかった（解説が未キャッシュ、または訳が空）。", "");
    }
  }

  return `${lines.join("\n")}\n`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  let stage = "starting";
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });

    let snapshot: Snapshot;
    if (args.useSnapshot) {
      stage = "reading the snapshot";
      snapshot = await readSnapshot();
    } else {
      snapshot = await fetchSnapshot(args.source, (next) => {
        stage = next;
      });
      stage = "writing the snapshot";
      await writeFile(SNAPSHOT_FILE, `${JSON.stringify(snapshot)}\n`);
    }
    const corpus = snapshot.words;
    if (corpus.length === 0) fail("The word list is empty.");

    stage = "building questions";
    const pool: QuizSourceWord[] = [];
    const missingSlugs: string[] = [];
    const noTranslationSlugs: string[] = [];
    for (const word of corpus) {
      const entry = snapshot.details[word.slug];
      if (!entry) {
        missingSlugs.push(word.slug);
        continue;
      }
      const source = toQuizSourceWord(word, entry.detail);
      if (source) pool.push(source);
      else noTranslationSlugs.push(word.slug);
    }

    const results = new Map<string, BuildResult>();
    for (const source of pool) {
      const { question, pick } = buildQuizQuestion(source, pool);
      results.set(source.slug, { source, question, excluded: pick.excluded });
    }

    const schedule = listUpcomingDateKeys(args.startKey, args.days).map((dateKey) => ({
      dateKey,
      words: selectTodayWords(corpus, dateKey, TODAY_WORDS_COUNT),
    }));
    const windowSlugs = Array.from(new Set(schedule.flatMap((day) => day.words.map((word) => word.slug))));
    const items = Object.fromEntries(
      windowSlugs.flatMap((slug) => {
        const question = results.get(slug)?.question;
        return question ? [[slug, question] as const] : [];
      }),
    );
    const previewQuestions: Record<string, PreviewQuestion> = Object.fromEntries(
      windowSlugs.flatMap((slug) => {
        const result = results.get(slug);
        if (!result?.question) return [];
        const preview: PreviewQuestion = {
          ...result.question,
          level: result.source.level,
          formLabel: CLASS_LABELS[result.source.translationClass],
          translation: result.source.translation,
        };
        return [[slug, preview] as const];
      }),
    );

    stage = "writing the output files";
    const generatedAt = new Date().toISOString();
    await mkdir(PREVIEW_DIR, { recursive: true });
    await writeFile(
      path.join(PREVIEW_DIR, "index.html"),
      renderPreviewHtml({
        generatedAt,
        detailsCapturedAt: snapshot.capturedAt,
        source: snapshot.source,
        corpusCount: corpus.length,
        schedule: schedule.map((day) => ({ dateKey: day.dateKey, slugs: day.words.map((word) => word.slug) })),
        questions: previewQuestions,
        flagLabels: FLAG_LABELS,
      }),
    );
    await writeFile(
      path.join(OUTPUT_DIR, "questions.json"),
      `${JSON.stringify(
        {
          version: 1,
          prototype: "E",
          generatedAt,
          source: snapshot.source,
          detailsCapturedAt: snapshot.capturedAt,
          startKey: args.startKey,
          days: args.days,
          items,
        },
        null,
        2,
      )}\n`,
    );
    await writeFile(
      path.join(OUTPUT_DIR, "report.md"),
      renderReport({ args, generatedAt, snapshot, missingSlugs, noTranslationSlugs, pool, results, schedule }),
    );

    const built = [...results.values()].filter((result) => result.question !== null);
    const flagged = built.filter((result) => (result.question?.flags.length ?? 0) > 0);
    console.log(
      JSON.stringify(
        {
          source: snapshot.source,
          usedSnapshot: args.useSnapshot,
          corpus: corpus.length,
          usable: pool.length,
          missingDetails: missingSlugs.length,
          emptyTranslations: noTranslationSlugs.length,
          questionsBuilt: built.length,
          questionsFlagged: flagged.length,
          window: { start: args.startKey, days: args.days, words: windowSlugs.length, built: Object.keys(items).length },
          output: OUTPUT_DIR,
          preview: path.join(PREVIEW_DIR, "index.html"),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    // 上流のエラー文には接続先などが含まれ得るため、種類と段階だけを表示する
    const kind = error instanceof Error ? error.name : "UnknownError";
    fail(`Prototype failed while ${stage} (${kind}). No upstream writes were performed.`);
  }
}

void main();
