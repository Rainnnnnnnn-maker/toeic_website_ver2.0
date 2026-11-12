"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { formatQuizDayLabel, summarizeQuizDay, type DailyQuiz, type QuizDay } from "@/lib/daily-quiz";
import {
  advanceQuestion,
  answerQuestion,
  getDayProgress,
  isSelectableQuizDay,
  pruneDays,
  resetDay,
  resolveSelectedDateKey,
  selectDay,
} from "@/lib/daily-quiz-session";
import {
  getQuizSessionServerSnapshot,
  getQuizSessionSnapshot,
  subscribeQuizSession,
  updateQuizSession,
} from "@/lib/daily-quiz-session-store";
import { TODAY_WORDS_COUNT } from "@/lib/word-select";
import QuizQuestionCard from "./QuizQuestionCard";
import QuizResultCard from "./QuizResultCard";

type Props = {
  /** サーバーが決めた「今日」。端末の時計からは計算しない */
  todayKey: string;
  /** 今日から過去へ並んだ解ける日。未生成の日は quiz が null */
  days: QuizDay[];
};

/**
 * 「今日の6語クイズ」の進行を管理する。問題はサーバーから props で受け取り、
 * 回答の進み具合だけを localStorage に持つ（サーバー描画時は未回答として描く）。
 */
export default function TodayQuizClient({ todayKey, days }: Readonly<Props>) {
  const session = useSyncExternalStore(subscribeQuizSession, getQuizSessionSnapshot, getQuizSessionServerSnapshot);

  const selectedDateKey = resolveSelectedDateKey(session, days, todayKey);
  const selectedDay = days.find((day) => day.dateKey === selectedDateKey) ?? null;
  const quiz = selectedDay?.quiz ?? null;
  // 今日は未生成でも選べる（「準備中」の案内を開く）。過去の日はクイズがある日だけ並べる
  const visibleDays = days.filter((day) => isSelectableQuizDay(day, todayKey));
  const validDateKeys = days.map((day) => day.dateKey);

  const handleSelectDay = (dateKey: string) => {
    updateQuizSession((state) => selectDay(pruneDays(state, validDateKeys), dateKey, todayKey));
  };

  const handleAnswer = (target: DailyQuiz, optionId: string) => {
    const { answers, position } = getDayProgress(session, target);
    const question = target.questions[position];
    if (!question || position !== answers.length) return;

    const total = target.questions.length;
    const isCorrect = optionId === question.correctOptionId;
    const isToday = target.dateKey === todayKey;
    if (answers.length === 0) sendGAEvent("event", "quiz_start", { question_count: total, is_today: isToday });
    sendGAEvent("event", "quiz_answer", { question_index: position + 1, is_correct: isCorrect });
    if (answers.length + 1 === total) {
      const correctCount = summarizeQuizDay(target, [...answers, optionId]).correctCount;
      sendGAEvent("event", "quiz_complete", { correct_count: correctCount, question_count: total, is_today: isToday });
    }
    updateQuizSession((state) => answerQuestion(pruneDays(state, validDateKeys), target, optionId));
  };

  const handleRetry = (target: DailyQuiz) => {
    sendGAEvent("event", "quiz_retry", { is_today: target.dateKey === todayKey });
    updateQuizSession((state) => resetDay(state, target));
  };

  return (
    <div className="flex flex-col gap-4">
      {visibleDays.length > 1 && (
        <nav aria-label="クイズの日付" className="flex flex-wrap gap-2">
          {visibleDays.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            const daySummary = day.quiz ? summarizeQuizDay(day.quiz, getDayProgress(session, day.quiz).answers) : null;
            let status = "";
            if (daySummary?.completed) status = `${daySummary.correctCount}/${daySummary.total}`;
            else if (daySummary && daySummary.answered > 0) status = "途中";
            return (
              <button
                key={day.dateKey}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectDay(day.dateKey)}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {formatQuizDayLabel(day.dateKey, todayKey)}
                {status && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none ${isSelected ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                    {status}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {quiz ? (
        <QuizBody
          quiz={quiz}
          progress={getDayProgress(session, quiz)}
          isToday={quiz.dateKey === todayKey}
          hasTodayQuiz={Boolean(days[0]?.quiz)}
          onAnswer={(optionId) => handleAnswer(quiz, optionId)}
          onNext={() => updateQuizSession((state) => advanceQuestion(state, quiz))}
          onRetry={() => handleRetry(quiz)}
          onOpenToday={() => handleSelectDay(todayKey)}
        />
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="text-base font-bold text-slate-900">今日のクイズは準備中です</h2>
          <p className="mt-2">
            クイズは毎朝7時ごろ、その日の{TODAY_WORDS_COUNT}単語に合わせて更新されます。しばらくしてからもう一度お試しください。
          </p>
          <Link
            href="/today-words"
            prefetch={false}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 no-underline transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            今日の{TODAY_WORDS_COUNT}単語を見る
          </Link>
        </section>
      )}
    </div>
  );
}

type QuizBodyProps = {
  quiz: DailyQuiz;
  progress: { answers: string[]; position: number };
  isToday: boolean;
  hasTodayQuiz: boolean;
  onAnswer: (optionId: string) => void;
  onNext: () => void;
  onRetry: () => void;
  onOpenToday: () => void;
};

function QuizBody({ quiz, progress, isToday, hasTodayQuiz, onAnswer, onNext, onRetry, onOpenToday }: Readonly<QuizBodyProps>) {
  const total = quiz.questions.length;
  if (progress.position >= total) {
    return (
      <QuizResultCard
        quiz={quiz}
        summary={summarizeQuizDay(quiz, progress.answers)}
        onRetry={onRetry}
        onOpenToday={!isToday && hasTodayQuiz ? onOpenToday : null}
      />
    );
  }

  const question = quiz.questions[progress.position];
  return (
    <QuizQuestionCard
      // 問題が変わるたびに作り直し、前の問題のフォーカスや読み上げ領域を持ち越さない
      key={question.id}
      question={question}
      index={progress.position}
      total={total}
      selectedOptionId={progress.answers[progress.position]}
      onAnswer={onAnswer}
      onNext={onNext}
    />
  );
}
