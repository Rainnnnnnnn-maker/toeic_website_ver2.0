"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronLeft, Info, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useReviewProgress } from "@/hooks/useReviewProgress";
import StudyClient from "@/components/features/study/StudyClient";
import FavoritePracticeLoginGate from "@/components/features/auth/FavoritePracticeLoginGate";
import type { Word } from "@/data/words";
import { buildWordMap } from "@/lib/study-utils";
import { getTodayKey } from "@/lib/word-select";
import {
  clearStoredReviewSession,
  readStoredReviewSession,
  writeStoredReviewSession,
} from "@/lib/review-session-store";
import {
  getDueSlugs,
  getWeakSlugs,
  parseReviewQueue,
  REVIEW_SESSION_LIMIT,
  type ReviewGrade,
  type ReviewQueue,
  type ReviewRecord,
} from "@/lib/review-schedule";

type Props = {
  allWords: Word[];
};

const QUEUE_CONFIG: Record<
  ReviewQueue,
  { storageKey: string; pageTitle: string }
> = {
  all: { storageKey: "toeic-review-state-v1", pageTitle: "復習モード" },
  due: { storageKey: "toeic-review-due-state-v1", pageTitle: "今日の復習" },
  weak: { storageKey: "toeic-review-weak-state-v1", pageTitle: "苦手の復習" },
};

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6">
      <main className="w-full max-w-[600px] flex flex-col gap-8 items-center">
        {children}
      </main>
    </div>
  );
}

function ReviewNotice({ children }: { children: ReactNode }) {
  return (
    <div className="w-full bg-emerald-50 px-4 py-2 text-center text-xs leading-[1.6] text-emerald-800">
      <span className="inline-flex items-start gap-1.5 text-left">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>{children}</span>
      </span>
    </div>
  );
}

type ReviewSessionProps = {
  requestedQueue: ReviewQueue;
  canFilter: boolean;
  favoriteSlugs: string[];
  wordBySlug: Map<string, Word>;
  records: ReadonlyMap<string, ReviewRecord>;
  userId: string;
  authEpoch: number;
  backLink: string;
  backLinkText: string;
  baseNotice: ReactNode;
  preserveReviewQueue: boolean;
  onGrade?: (slug: string, grade: ReviewGrade) => void;
};

type SessionState = {
  actualQueue: ReviewQueue;
  didFallback: boolean;
  dateKey: string | null;
  initialSlugs: string[];
  initialCount: number;
  remainingSlugs: string[];
  completed: boolean;
};

function ReviewSession({
  requestedQueue,
  canFilter,
  favoriteSlugs,
  wordBySlug,
  records,
  userId,
  authEpoch,
  backLink,
  backLinkText,
  baseNotice,
  preserveReviewQueue,
  onGrade,
}: ReviewSessionProps) {
  const requestedConfig = QUEUE_CONFIG[requestedQueue];
  // 復習はログイン必須になったため、キーは常にユーザー＋認証エポックで分離する。
  const requestedStorageKey = `${requestedConfig.storageKey}:${userId}:e${authEpoch}`;
  const fixedSessionStorageKey = `${requestedStorageKey}:fixed-v1`;

  // フィルター済みの出題集合はマウント時に一度だけ固定する。
  // 採点による records 更新で11語目以降が補充されないようにするため。
  const [session, setSession] = useState<SessionState>(() => {
    if (!canFilter) {
      return {
        actualQueue: "all",
        didFallback: false,
        dateKey: null,
        initialSlugs: favoriteSlugs,
        initialCount: favoriteSlugs.length,
        remainingSlugs: favoriteSlugs,
        completed: false,
      };
    }

    const now = new Date();
    const todayKey = getTodayKey(now);
    const selected =
      requestedQueue === "due"
        ? getDueSlugs(favoriteSlugs, records, now).slice(
            0,
            REVIEW_SESSION_LIMIT
          )
        : getWeakSlugs(favoriteSlugs, records, REVIEW_SESSION_LIMIT);

    const stored = readStoredReviewSession(fixedSessionStorageKey);
    if (
      stored &&
      stored.queue === requestedQueue &&
      stored.dateKey === todayKey
    ) {
      const eligible = new Set(selected);
      const remainingSlugs = stored.remainingSlugs.filter((slug) =>
        eligible.has(slug)
      );
      return {
        actualQueue: requestedQueue,
        didFallback: false,
        dateKey: stored.dateKey,
        initialSlugs: stored.initialSlugs,
        initialCount: stored.initialSlugs.length,
        remainingSlugs,
        completed: remainingSlugs.length === 0,
      };
    }

    if (selected.length === 0) {
      return {
        actualQueue: "all",
        didFallback: true,
        dateKey: null,
        initialSlugs: favoriteSlugs,
        initialCount: favoriteSlugs.length,
        remainingSlugs: favoriteSlugs,
        completed: false,
      };
    }

    return {
      actualQueue: requestedQueue,
      didFallback: false,
      dateKey: todayKey,
      initialSlugs: selected,
      initialCount: selected.length,
      remainingSlugs: selected,
      completed: false,
    };
  });

  useEffect(() => {
    if (!canFilter || session.didFallback) return;
    writeStoredReviewSession(fixedSessionStorageKey, {
      v: 1,
      queue: requestedQueue,
      dateKey: session.dateKey ?? getTodayKey(),
      initialSlugs: session.initialSlugs,
      remainingSlugs: session.remainingSlugs,
    });
  }, [
    canFilter,
    fixedSessionStorageKey,
    requestedQueue,
    session.didFallback,
    session.dateKey,
    session.initialSlugs,
    session.remainingSlugs,
  ]);

  const handleGrade = (slug: string, grade: ReviewGrade) => {
    onGrade?.(slug, grade);
    if (session.actualQueue === "all") return;

    const remainingSlugs = session.remainingSlugs.filter(
      (item) => item !== slug
    );
    const nextSession = {
      ...session,
      remainingSlugs,
      completed: remainingSlugs.length === 0,
    };
    writeStoredReviewSession(fixedSessionStorageKey, {
      v: 1,
      queue: requestedQueue,
      dateKey: session.dateKey ?? getTodayKey(),
      initialSlugs: session.initialSlugs,
      remainingSlugs,
    });
    setSession(nextSession);
  };

  const config = QUEUE_CONFIG[session.actualQueue];
  const storageKey = `${config.storageKey}:${userId}:e${authEpoch}`;

  if (session.completed) {
    return (
      <CenteredMessage>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={26} />
        </span>
        <div className="text-center">
          <h1 className="text-[26px] font-bold text-slate-900">
            今回の復習は完了です
          </h1>
          <p className="mt-2 text-sm leading-[1.7] text-slate-500">
            {session.initialCount} 語を復習しました。おつかれさまでした。
          </p>
        </div>
        <Link
          href="/mypage"
          prefetch={false}
          onClick={() => clearStoredReviewSession(fixedSessionStorageKey)}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          マイページで結果を見る
        </Link>
      </CenteredMessage>
    );
  }

  const reviewWords = session.remainingSlugs
    .map((slug) => wordBySlug.get(slug))
    .filter((word): word is Word => word !== undefined);

  const fallbackNotice =
    session.didFallback && favoriteSlugs.length > 0
      ? requestedQueue === "due"
        ? "今日の復習はすべて完了しています。お気に入り全件から先取りで復習します。"
        : "「覚えていない」と答えた単語はまだありません。お気に入り全件で復習します。"
      : null;

  if (reviewWords.length === 0) {
    return (
      <>
        {(baseNotice || fallbackNotice) && (
          <ReviewNotice>
            {baseNotice}
            {baseNotice && fallbackNotice ? " " : null}
            {fallbackNotice}
          </ReviewNotice>
        )}
        <CenteredMessage>
          <header className="flex flex-col gap-3 text-center w-full items-center relative">
            <Link
              href={backLink}
              prefetch={false}
              className="group absolute right-0 -top-4 inline-flex items-center justify-center gap-1.5 h-10 px-5 bg-white border border-gray-200 rounded-full text-slate-600 text-[15px] font-semibold no-underline transition-all duration-200 shadow-sm select-none z-10 hover:bg-gray-50 hover:border-gray-300 hover:text-slate-900 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm"
            >
              <ChevronLeft
                size={18}
                className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-600"
              />
              {backLink === "/mypage" ? "マイページ" : "お気に入り"}
            </Link>
            <h1 className="text-[28px] leading-[1.3] text-slate-900 font-bold mt-12 sm:text-[32px]">
              {config.pageTitle}
            </h1>
          </header>
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium mb-3">
              お気に入りの単語はまだありません
            </p>
            <p className="text-sm leading-[1.6]">
              単語詳細ページの星マーク（☆）をクリックして、
              <br />
              お気に入りに登録してから復習モードをご利用ください。
            </p>
            <div className="mt-8">
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[36px] bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg font-bold text-sm tracking-wide no-underline transition-all duration-200 hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                <span className="inline-flex items-center">単語を探す</span>
              </Link>
            </div>
          </div>
        </CenteredMessage>
      </>
    );
  }

  return (
    <>
      {(baseNotice || fallbackNotice) && (
        <ReviewNotice>
          {baseNotice}
          {baseNotice && fallbackNotice ? " " : null}
          {fallbackNotice}
        </ReviewNotice>
      )}
      <StudyClient
        words={reviewWords}
        storageKey={storageKey}
        pageTitle={config.pageTitle}
        backLink={backLink}
        backLinkText={backLinkText}
        order="sequential"
        wordDetailFrom="review"
        reviewQueue={preserveReviewQueue ? requestedQueue : undefined}
        onGrade={onGrade ? handleGrade : undefined}
      />
    </>
  );
}

export default function ReviewWrapper({ allWords }: Props) {
  const searchParams = useSearchParams();
  const rawQueue = searchParams.get("queue");
  const requestedQueue = parseReviewQueue(rawQueue);
  const { user, isAuthLoading, authEpoch } = useAuth();
  const { favorites, favoritesStatus, retryFavoritesSync } = useFavorites();
  const { status: progressStatus, records, recordGrade } = useReviewProgress();

  const wordBySlug = buildWordMap(allWords);
  const favoriteSlugs = favorites.filter((slug) => wordBySlug.has(slug));
  const needsProgress = requestedQueue !== "all";

  // ゲスト判定前や、ログイン中のリモートデータ取得途中にはセッションを始めない。
  if (isAuthLoading) {
    return (
      <CenteredMessage>
        <p className="text-sm leading-[1.6] text-gray-500">読み込み中...</p>
      </CenteredMessage>
    );
  }

  // お気に入りを使った復習はログイン必須。ブックマーク等からの直接アクセスでも
  // セッションを開始せず、共通のログイン案内を出す。
  if (!user) {
    return (
      <CenteredMessage>
        <FavoritePracticeLoginGate feature="review" />
      </CenteredMessage>
    );
  }

  if (favoritesStatus === "loading" || progressStatus === "loading") {
    return (
      <CenteredMessage>
        <p className="text-sm leading-[1.6] text-gray-500">読み込み中...</p>
      </CenteredMessage>
    );
  }

  // ログイン中にお気に入り取得が失敗した場合、別アカウント由来の
  // localStorage 値をログイン向けキューへ流さず、明示的に再試行させる。
  if (favoritesStatus === "error") {
    return (
      <CenteredMessage>
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-base font-bold text-slate-800">
            お気に入りを読み込めませんでした
          </p>
          <p className="text-sm leading-[1.7] text-slate-500">
            アカウントのお気に入りを確認できないため、安全のため復習を開始していません。
          </p>
          <button
            type="button"
            onClick={retryFavoritesSync}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
          >
            <RefreshCw size={15} />
            再読み込み
          </button>
        </div>
      </CenteredMessage>
    );
  }

  const canFilter =
    needsProgress && favoritesStatus === "ready" && progressStatus === "ready";
  const canRecord = favoritesStatus === "ready" && progressStatus === "ready";

  const cameFromMyPage = rawQueue !== null;
  const backLink = cameFromMyPage ? "/mypage" : "/favorites";
  const backLinkText = cameFromMyPage
    ? "マイページへ戻る"
    : "お気に入りへ戻る";

  const baseNotice = (() => {
    if (progressStatus === "error") {
      return "学習データを読み込めなかったため、今回は記録せずお気に入り全件で復習します。";
    }
    return null;
  })();

  const sessionKey = `${user.id}:${authEpoch}:${requestedQueue}:${canFilter}`;

  return (
    <ReviewSession
      key={sessionKey}
      requestedQueue={requestedQueue}
      canFilter={canFilter}
      favoriteSlugs={favoriteSlugs}
      wordBySlug={wordBySlug}
      records={records}
      userId={user.id}
      authEpoch={authEpoch}
      backLink={backLink}
      backLinkText={backLinkText}
      baseNotice={baseNotice}
      preserveReviewQueue={rawQueue !== null}
      onGrade={canRecord ? recordGrade : undefined}
    />
  );
}
