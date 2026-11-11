/**
 * E案の試作で組んだ問題を、ブラウザで実際に解いて確かめるための単独 HTML を組み立てる。
 *
 * `scripts/prototype-quiz-questions.ts` が `.artifacts/quiz-prototype/preview/index.html`（git 管理外）へ出力する。
 * サイト本体には組み込まない確認用の画面で、本番のクイズ UI ではない。
 *
 * 訳や例文は Gemini / Redis 由来の文字列なので、データは `serializeJsonLd` で `<` を逃がして埋め込み、
 * 画面側は `textContent` だけで描画する（データを `innerHTML` に渡さない）。
 */
import { serializeJsonLd } from "../src/lib/json-ld";
import type { PrototypeQuizQuestion } from "../src/lib/quiz-question-builder";

export type PreviewQuestion = PrototypeQuizQuestion & {
  level: string;
  formLabel: string;
  /** 選択肢に絞る前の訳の原文 */
  translation: string;
};

export type PreviewData = {
  generatedAt: string;
  detailsCapturedAt: string;
  source: string;
  corpusCount: number;
  schedule: Array<{ dateKey: string; slugs: string[] }>;
  questions: Record<string, PreviewQuestion>;
  flagLabels: Record<string, string>;
};

// クライアント側のコードはテンプレートリテラルと正規表現のバックスラッシュを使わない
// （この文字列自体がテンプレートリテラルのため）。
const STYLE = `
:root {
  --ink: #0f172a; --muted: #64748b; --line: #e2e8f0; --card: #ffffff;
  --blue: #2563eb; --blue-soft: #dbeafe;
  --green: #15803d; --green-soft: #dcfce7;
  --red: #b91c1c; --red-soft: #fee2e2;
  --amber: #92400e; --amber-soft: #fef3c7;
}
* { box-sizing: border-box; }
body {
  margin: 0; min-height: 100vh; color: var(--ink); line-height: 1.6;
  font-family: system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif;
  background: radial-gradient(circle at top, #bae6fd 0, #eff6ff 45%, #f8fafc 100%) fixed;
}
main { max-width: 680px; margin: 0 auto; padding: 24px 16px 64px; }
h1 { font-size: 20px; line-height: 1.3; margin: 0 0 4px; }
.eyebrow { font-size: 11px; letter-spacing: 0.12em; color: var(--muted); margin: 0 0 4px; }
.meta { font-size: 12px; color: var(--muted); margin: 0; }
.notice {
  margin: 12px 0 16px; padding: 10px 12px; border-radius: 10px; font-size: 13px;
  background: var(--amber-soft); color: var(--amber); border: 1px solid #fde68a;
}
.tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.tab {
  flex: 1; min-height: 44px; border-radius: 10px; border: 1px solid var(--line);
  background: var(--card); color: var(--muted); font-size: 14px; font-weight: 700; cursor: pointer;
}
.tab[aria-selected="true"] { background: var(--blue); border-color: var(--blue); color: #fff; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin-bottom: 12px; font-size: 13px; }
select { min-height: 40px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--card); font-size: 14px; }
.card {
  background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); margin-bottom: 12px;
}
.progress { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin: 0 0 6px; }
.bar { height: 6px; border-radius: 999px; background: var(--line); overflow: hidden; margin-bottom: 20px; }
.bar > span { display: block; height: 100%; background: var(--blue); }
.term { font-size: 30px; font-weight: 800; line-height: 1.2; margin: 0; word-break: break-word; }
.ask { font-size: 14px; color: var(--muted); margin: 4px 0 16px; }
.sub { font-size: 12px; color: var(--muted); margin: 2px 0 0; }
.options { display: grid; gap: 10px; }
.option {
  display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; padding: 10px 14px;
  border-radius: 12px; border: 1px solid var(--line); background: var(--card); color: var(--ink);
  font-size: 16px; text-align: left; cursor: pointer;
}
.option:not(:disabled):hover { border-color: var(--blue); background: #f8fafc; }
.option:disabled { cursor: default; color: var(--ink); opacity: 1; }
.option .mark {
  flex: none; width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center;
  background: var(--blue-soft); color: var(--blue); font-size: 13px; font-weight: 700;
}
.option .text { flex: 1; }
.option .src { flex: none; font-size: 11px; color: var(--muted); }
.option.correct { border-color: var(--green); background: var(--green-soft); }
.option.correct .mark { background: var(--green); color: #fff; }
.option.wrong { border-color: var(--red); background: var(--red-soft); }
.option.wrong .mark { background: var(--red); color: #fff; }
.feedback { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--line); }
.verdict { font-size: 18px; font-weight: 800; margin: 0 0 8px; }
.verdict.ok { color: var(--green); }
.verdict.ng { color: var(--red); }
.detail { font-size: 13px; margin: 4px 0; }
.detail b { color: var(--muted); font-weight: 600; margin-right: 6px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 0; }
.chip { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: var(--amber-soft); color: var(--amber); }
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.button {
  min-height: 44px; padding: 0 18px; border-radius: 10px; border: 1px solid var(--blue);
  background: var(--blue); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
}
.button.ghost { background: var(--card); color: var(--blue); }
.score { font-size: 44px; font-weight: 800; text-align: center; margin: 8px 0 0; }
.rate { text-align: center; color: var(--muted); margin: 0 0 16px; }
.center { text-align: center; }
h2 { font-size: 16px; margin: 0 0 8px; }
h3 { font-size: 14px; color: var(--muted); margin: 20px 0 8px; }
.list-term { font-size: 18px; font-weight: 800; margin: 0; }
.list-options { list-style: none; padding: 0; margin: 10px 0; display: grid; gap: 6px; }
.list-options li { display: flex; gap: 10px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--line); font-size: 14px; }
.list-options li.correct { border-color: var(--green); background: var(--green-soft); font-weight: 700; }
.list-options .src { margin-left: auto; font-size: 11px; color: var(--muted); font-weight: 400; }
.empty { color: var(--muted); font-size: 14px; }
`;

const SCRIPT = `
(() => {
  const data = JSON.parse(document.getElementById("quiz-data").textContent);
  const app = document.getElementById("app");
  const LETTERS = ["A", "B", "C", "D"];
  const state = { mode: "quiz", dayIndex: 0, index: 0, answers: [], flaggedOnly: false };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (label, className, onClick) => {
    const node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  };
  const detail = (label, text) => {
    const row = el("p", "detail");
    row.append(el("b", "", label), document.createTextNode(text));
    return row;
  };
  const chips = (flags) => {
    const wrap = el("div", "chips");
    for (const flag of flags) wrap.append(el("span", "chip", data.flagLabels[flag] || flag));
    return wrap;
  };
  const correctOption = (question) => question.options.find((option) => option.id === question.correctOptionId);
  const dayQuestions = () =>
    data.schedule[state.dayIndex].slugs.map((slug) => data.questions[slug]).filter(Boolean);
  const startDay = (dayIndex) => {
    state.dayIndex = dayIndex;
    state.index = 0;
    state.answers = [];
  };

  function tabs() {
    const wrap = el("div", "tabs");
    wrap.setAttribute("role", "tablist");
    for (const [mode, label] of [["quiz", "クイズとして解く"], ["list", "一覧で確認"]]) {
      const tab = button(label, "tab", () => {
        state.mode = mode;
        render();
      });
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(state.mode === mode));
      wrap.append(tab);
    }
    return wrap;
  }

  function daySelect() {
    const toolbar = el("div", "toolbar");
    const label = el("label", "", "出題日 ");
    const select = el("select");
    data.schedule.forEach((day, index) => {
      const option = el("option", "", day.dateKey + (index === 0 ? "（起点の日）" : ""));
      option.value = String(index);
      option.selected = index === state.dayIndex;
      select.append(option);
    });
    select.addEventListener("change", () => {
      startDay(Number(select.value));
      render();
    });
    label.append(select);
    toolbar.append(label, el("span", "", "その日の「今日の6単語」と同じ語・同じ順序です"));
    return toolbar;
  }

  function questionCard(questions) {
    const question = questions[state.index];
    const selectedId = state.answers[state.index];
    const answered = selectedId !== undefined;
    const card = el("section", "card");

    const progress = el("p", "progress");
    progress.append(el("span", "", "今日の6語チャレンジ"), el("span", "", state.index + 1 + " / " + questions.length + "問"));
    const bar = el("div", "bar");
    const fill = el("span");
    fill.style.width = ((state.index + (answered ? 1 : 0)) / questions.length) * 100 + "%";
    bar.append(fill);
    card.append(progress, bar, el("p", "term", question.term), el("p", "ask", "の意味として最も適切なものは？"));

    const options = el("div", "options");
    question.options.forEach((option, position) => {
      const node = button("", "option", () => {
        if (state.answers[state.index] !== undefined) return;
        state.answers[state.index] = option.id;
        render();
      });
      node.append(el("span", "mark", LETTERS[position]), el("span", "text", option.text));
      if (answered) {
        node.disabled = true;
        if (option.id === question.correctOptionId) node.classList.add("correct");
        else if (option.id === selectedId) node.classList.add("wrong");
        node.append(el("span", "src", option.sourceSlug));
      }
      options.append(node);
    });
    card.append(options);

    const feedback = el("div", answered ? "feedback" : "");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    if (answered) {
      const isCorrect = selectedId === question.correctOptionId;
      feedback.append(el("p", "verdict " + (isCorrect ? "ok" : "ng"), isCorrect ? "正解！" : "不正解"));
      if (!isCorrect) feedback.append(detail("正解", correctOption(question).text));
      feedback.append(detail("例文", question.explanation || "（例文なし）"));
      if (question.translation !== correctOption(question).text) feedback.append(detail("訳の原文", question.translation));
      if (question.flags.length > 0) feedback.append(chips(question.flags));
      const actions = el("div", "actions");
      const isLast = state.index === questions.length - 1;
      actions.append(
        button(isLast ? "結果を見る" : "次の問題へ", "button", () => {
          state.index += 1;
          render();
        }),
      );
      feedback.append(actions);
    }
    card.append(feedback);
    return card;
  }

  function resultCard(questions) {
    const card = el("section", "card");
    const wrong = questions.filter((question, index) => state.answers[index] !== question.correctOptionId);
    const correctCount = questions.length - wrong.length;
    card.append(
      el("h2", "center", "チャレンジ完了！"),
      el("p", "score", correctCount + " / " + questions.length),
      el("p", "rate", "正答率 " + Math.round((correctCount / questions.length) * 100) + "%"),
    );
    if (wrong.length > 0) {
      card.append(el("h2", "", "不正解の単語"));
      for (const question of wrong) card.append(detail(question.term, correctOption(question).text));
    }
    const actions = el("div", "actions");
    actions.append(
      button("もう一度チャレンジ", "button", () => {
        startDay(state.dayIndex);
        render();
      }),
    );
    if (state.dayIndex < data.schedule.length - 1) {
      actions.append(
        button("次の日の6語へ", "button ghost", () => {
          startDay(state.dayIndex + 1);
          render();
        }),
      );
    }
    card.append(actions);
    return card;
  }

  function quizView() {
    const view = el("div");
    view.append(daySelect());
    const questions = dayQuestions();
    if (questions.length === 0) {
      const card = el("section", "card");
      card.append(el("p", "empty", "この日は問題を組めた単語がありません。"));
      view.append(card);
    } else if (state.index >= questions.length) {
      view.append(resultCard(questions));
    } else {
      view.append(questionCard(questions));
    }
    return view;
  }

  function listView() {
    const view = el("div");
    const all = Object.values(data.questions);
    const flaggedCount = all.filter((question) => question.flags.length > 0).length;
    const toolbar = el("div", "toolbar");
    const label = el("label");
    const checkbox = el("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.flaggedOnly;
    checkbox.addEventListener("change", () => {
      state.flaggedOnly = checkbox.checked;
      render();
    });
    label.append(checkbox, document.createTextNode(" 確認点のある問題だけ表示"));
    toolbar.append(label, el("span", "", "全" + all.length + "問のうち確認点あり " + flaggedCount + "問"));
    view.append(toolbar);

    for (const day of data.schedule) {
      const questions = day.slugs
        .map((slug) => data.questions[slug])
        .filter((question) => question && (!state.flaggedOnly || question.flags.length > 0));
      if (questions.length === 0) continue;
      view.append(el("h3", "", day.dateKey));
      for (const question of questions) {
        const card = el("section", "card");
        card.append(el("p", "list-term", question.term), el("p", "sub", question.formLabel + "・" + question.level));
        const list = el("ol", "list-options");
        question.options.forEach((option, position) => {
          const isCorrect = option.id === question.correctOptionId;
          const item = el("li", isCorrect ? "correct" : "");
          item.append(
            el("span", "", LETTERS[position] + (isCorrect ? " 正解" : "")),
            el("span", "", option.text),
            el("span", "src", option.sourceSlug),
          );
          list.append(item);
        });
        card.append(list);
        if (question.translation !== correctOption(question).text) card.append(detail("訳の原文", question.translation));
        card.append(detail("例文", question.explanation || "（例文なし）"));
        if (question.flags.length > 0) card.append(chips(question.flags));
        view.append(card);
      }
    }
    return view;
  }

  function render() {
    app.replaceChildren(tabs(), state.mode === "quiz" ? quizView() : listView());
  }

  document.getElementById("meta").textContent =
    "単語リスト " + data.source + "（" + data.corpusCount + "語）・解説の取得 " + data.detailsCapturedAt.slice(0, 10) +
    "・" + data.schedule.length + "日分 " + Object.keys(data.questions).length + "問";
  render();
})();
`;

export function renderPreviewHtml(data: PreviewData): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>今日の6語チャレンジ E案 試作プレビュー</title>
<style>${STYLE}</style>
</head>
<body>
<main>
  <p class="eyebrow">PROTOTYPE</p>
  <h1>今日の6語チャレンジ E案 試作プレビュー</h1>
  <p class="meta" id="meta"></p>
  <p class="notice">既存の訳から機械的に組んだ問題です。人による確認は行っていません。本番のクイズ画面ではなく、問題の質を確かめるための画面です。</p>
  <div id="app"></div>
</main>
<script type="application/json" id="quiz-data">${serializeJsonLd(data)}</script>
<script>${SCRIPT}</script>
</body>
</html>
`;
}
