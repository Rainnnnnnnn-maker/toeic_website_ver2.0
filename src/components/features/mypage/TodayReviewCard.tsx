"use client";

import Link from "next/link";
import { REVIEW_SESSION_LIMIT } from "@/lib/review-schedule";
import { CalendarClock, PlayCircle, Search, Sparkles, Star } from "lucide-react";
import { trackMyPageCta } from "@/components/features/mypage/analytics";

type Props = {
  /** 復習期限が来ているお気に入りの総数 */
  dueCount: number;
  /** 今回のセッションで出題する語数（REVIEW_SESSION_LIMIT で頭打ち） */
  sessionCount: number;
  /** 今日すでに採点した語数 */
  reviewedToday: number;
  totalFavorites: number;
  /** 次に期限が来る時刻（epoch ms）。期限切れが残っている場合は null */
  nextDueAt: number | null;
};

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatJstDate(timestamp: number): string {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(new Date(timestamp));
}

function ProgressRing({ ratio, label }: { ratio: number; label: string }) {
  const clamped = Math.min(Math.max(ratio, 0), 1);

  return (
    <div className="relative h-[104px] w-[104px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-100"
        />
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - clamped)}
          className="text-emerald-500 transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-900">
          {Math.round(clamped * 100)}%
        </span>
        <span className="text-[10px] text-slate-400">{label}</span>
      </div>
    </div>
  );
}

/** マイページの主役。「今日やる理由」と「今日やる対象」を 1 枚で示す。 */
export default function TodayReviewCard({
  dueCount,
  sessionCount,
  reviewedToday,
  totalFavorites,
  nextDueAt,
}: Props) {
  // お気に入りがまだ無い
  if (totalFavorites === 0) {
    return (
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 text-amber-500">
          <Star size={18} />
          <p className="text-xs font-bold uppercase tracking-[0.12em]">
            START HERE
          </p>
        </div>
        <h2 className="text-[20px] font-bold leading-[1.4] text-slate-900 sm:text-[22px]">
          気になった単語に★を付けると、
          <br className="hidden sm:block" />
          ここに復習スケジュールが表示されます
        </h2>
        <p className="text-sm leading-[1.7] text-slate-500">
          単語詳細ページの星マークを押すだけで登録できます。まずは今日の 6 単語から始めてみましょう。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/today-words"
            prefetch={false}
            onClick={() => trackMyPageCta("today_words")}
            className="group inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Sparkles size={16} className="transition-transform group-hover:scale-110" />
            今日の6単語を見る
          </Link>
          <Link
            href="/words"
            prefetch={false}
            onClick={() => trackMyPageCta("words")}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            <Search size={16} />
            単語を探す
          </Link>
        </div>
      </section>
    );
  }

  const finished = reviewedToday + dueCount;
  const dailyTarget = Math.min(REVIEW_SESSION_LIMIT, finished);
  const ratio = dailyTarget === 0 ? 1 : reviewedToday / dailyTarget;
  const targetReached = reviewedToday >= dailyTarget;

  // 今日の分は消化済み
  if (dueCount === 0) {
    return (
      <section className="flex flex-col gap-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">
            ALL DONE
          </p>
          <h2 className="text-[22px] font-bold leading-[1.3] text-slate-900 sm:text-[26px]">
            今日の復習は完了です 🎉
          </h2>
          <p className="text-sm leading-[1.7] text-slate-600">
            {reviewedToday > 0
              ? `今日は ${reviewedToday} 語を復習しました。`
              : "今日の時点で期限が来ている単語はありません。"}
            {nextDueAt !== null && (
              <>
                <br />
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <CalendarClock size={14} />
                  次の復習は {formatJstDate(nextDueAt)} から
                </span>
              </>
            )}
          </p>
          <Link
            href="/review?queue=all"
            prefetch={false}
            onClick={() => trackMyPageCta("review_all")}
            className="mt-2 inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-emerald-300 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-50 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <PlayCircle size={16} />
            先取りで復習する
          </Link>
        </div>
        <ProgressRing ratio={ratio} label="今日の目安" />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">
          TODAY&apos;S REVIEW
        </p>
        {targetReached ? (
          <h2 className="text-2xl font-bold text-emerald-700">今日の目安 {dailyTarget} 語を達成！</h2>
        ) : <h2 className="flex items-baseline gap-2 text-slate-900">
          <span className="text-[40px] font-bold leading-none sm:text-[48px]">
            {sessionCount}
          </span>
          <span className="text-lg font-bold">語</span>
          <span className="text-sm font-medium text-slate-500">
            を復習しましょう
          </span>
        </h2>}
        <p className="text-sm leading-[1.7] text-slate-600">
          {targetReached ? `今日は ${reviewedToday} 語を復習しました。おつかれさまでした。余裕があれば、もう ${sessionCount} 語進められます。` : dueCount > sessionCount
            ? `復習の期限が来ているのは ${dueCount} 語です。まずは ${sessionCount} 語だけ進めれば十分です。`
            : "忘れかけたタイミングの単語をまとめました。"}
          {!targetReached && reviewedToday > 0 && `（今日はここまで ${reviewedToday} 語）`}
          {targetReached && <span className="mt-1 block text-xs text-slate-500">期限が来ている単語：残り {dueCount} 語</span>}
        </p>
        <Link
          href="/review?queue=due"
          prefetch={false}
          onClick={() => trackMyPageCta("review_due")}
          className="group relative mt-1 inline-flex items-center justify-center gap-2 self-start overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-500 px-5 py-3 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
          <PlayCircle size={18} className="relative z-10" />
          <span className="relative z-10">{targetReached ? `もう ${sessionCount} 語復習する` : "復習をはじめる"}</span>
        </Link>
      </div>
      <ProgressRing ratio={ratio} label="今日の目安" />
    </section>
  );
}
