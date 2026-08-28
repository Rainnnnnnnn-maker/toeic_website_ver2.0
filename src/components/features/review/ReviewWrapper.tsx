"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useReviewProgress } from "@/hooks/useReviewProgress";
import StudyClient from "@/components/features/study/StudyClient";
import type { Word } from "@/data/words";
import { buildWordMap } from "@/lib/study-utils";
import {
  getDueSlugs,
  getWeakSlugs,
  parseReviewQueue,
  REVIEW_SESSION_LIMIT,
  type ReviewQueue,
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

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6">
      <main className="w-full max-w-[600px] flex flex-col gap-8 items-center">
        {children}
      </main>
    </div>
  );
}

export default function ReviewWrapper({ allWords }: Props) {
  const searchParams = useSearchParams();
  const queue = parseReviewQueue(searchParams.get("queue"));
  const { favorites } = useFavorites();
  const { status: progressStatus, records, recordGrade } = useReviewProgress();

  const wordBySlug = buildWordMap(allWords);
  const favoriteSlugs = favorites.filter((slug) => wordBySlug.has(slug));

  const needsProgress = queue !== "all";
  const isProgressReady = progressStatus === "ready";

  // 出題リストが途中で入れ替わらないよう、絞り込みが必要なキューでは取得完了を待つ
  if (needsProgress && progressStatus === "loading") {
    return (
      <CenteredMessage>
        <p className="text-sm leading-[1.6] text-gray-500">読み込み中...</p>
      </CenteredMessage>
    );
  }

  const canFilter = needsProgress && isProgressReady;
  // new Date() はプリレンダリング時に評価されないよう、絞り込む場合だけ生成する
  // （Cache Components の制約。canFilter は取得完了後にしか true にならない）
  const queuedSlugs = canFilter
    ? queue === "due"
      ? getDueSlugs(favoriteSlugs, records, new Date()).slice(
          0,
          REVIEW_SESSION_LIMIT
        )
      : getWeakSlugs(favoriteSlugs, records, REVIEW_SESSION_LIMIT)
    : favoriteSlugs;

  // 絞り込み結果が 0 件でも行き止まりにせず、全お気に入りへフォールバックする
  const didFallback = canFilter && queuedSlugs.length === 0;
  const targetSlugs = didFallback ? favoriteSlugs : queuedSlugs;

  // 実際に出題する内容に合わせて表示と保存キーを決める。
  // 絞り込めなかった場合は全件モードと同じ扱いにする（進捗が混ざらないように）。
  const actualQueue: ReviewQueue = canFilter && !didFallback ? queue : "all";
  const config = QUEUE_CONFIG[actualQueue];
  // ログイン中に queue 付きで来た場合はマイページ経由とみなす。
  // ゲストの戻り先をマイページにするとログインゲートに突き当たるため /favorites に戻す。
  const backLink =
    needsProgress && progressStatus !== "guest" ? "/mypage" : "/favorites";
  const backLinkText =
    backLink === "/mypage" ? "マイページへ戻る" : "お気に入りへ戻る";

  const reviewWords = targetSlugs
    .map((slug) => wordBySlug.get(slug))
    .filter((word): word is Word => word !== undefined);

  if (reviewWords.length === 0) {
    return (
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
    );
  }

  const notice = (() => {
    if (!needsProgress) return null;
    if (progressStatus === "guest") {
      return (
        <>
          ログインすると、忘れかけた単語だけを出題する復習スケジュールが使えます。今回はお気に入り全件で復習します。
          <Link
            href="/login?next=/mypage"
            prefetch={false}
            className="ml-1 font-bold text-emerald-700 underline underline-offset-2"
          >
            ログイン
          </Link>
        </>
      );
    }
    if (progressStatus === "error") {
      return <>学習データを読み込めなかったため、お気に入り全件で復習します。</>;
    }
    if (didFallback) {
      return queue === "due" ? (
        <>今日の復習はすべて完了しています。お気に入り全件から先取りで復習します。</>
      ) : (
        <>「覚えていない」と答えた単語はまだありません。お気に入り全件で復習します。</>
      );
    }
    return null;
  })();

  return (
    <>
      {notice && (
        <div className="w-full bg-emerald-50 px-4 py-2 text-center text-xs leading-[1.6] text-emerald-800">
          <span className="inline-flex items-start gap-1.5 text-left">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </span>
        </div>
      )}
      <StudyClient
        words={reviewWords}
        storageKey={config.storageKey}
        pageTitle={config.pageTitle}
        backLink={backLink}
        backLinkText={backLinkText}
        order="sequential"
        wordDetailFrom="review"
        onGrade={isProgressReady ? recordGrade : undefined}
      />
    </>
  );
}
