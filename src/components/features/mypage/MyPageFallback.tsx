/**
 * マイページの各パーツのスケルトン。
 *
 * ページの `<Suspense>` fallback（Server Component）と、MyPageClient の
 * 認証判定中・Supabase 取得中の表示（Client Component）の両方で使うため、
 * フックを持たない表示専用のコンポーネントに留める（"use client" は付けない）。
 *
 * 外枠・文字サイズ・文言は実際のパーツと揃え、文字だけを透明にする（TextBar）。
 * 行の高さと折り返し位置が端末幅ごとに本物と一致するため、差し替えてもずれない。
 * 文言を変えたときは、対応するパーツと合わせてここも更新すること。
 */

const PULSE = "animate-pulse motion-reduce:animate-none";
const CARD = "rounded-2xl border border-slate-200 bg-white shadow-xs select-none";

/** 文字を透明にして背景色だけを残す、テキスト用のスケルトン。 */
function TextBar({ children, strong = false }: { children: string; strong?: boolean }) {
  return (
    <span
      className={`rounded-sm box-decoration-clone text-transparent ${strong ? "bg-slate-200" : "bg-slate-100"}`}
    >
      {children}
    </span>
  );
}

/** MyPageAccountCard と同じ構成（アバター・表示名・説明・ログアウト）。 */
export function MyPageAccountCardFallback() {
  return (
    <section
      aria-hidden
      className={`flex items-center justify-between gap-3 px-4 py-3 ${CARD}`}
    >
      <div className={`flex min-w-0 items-center gap-3 ${PULSE}`}>
        <span className="h-9 w-9 shrink-0 rounded-full bg-slate-200" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">
            <TextBar strong>ログインユーザー</TextBar>
          </p>
          <p className="text-xs">
            <TextBar>
              復習の記録はアカウントに保存され、他の端末でも続きから学習できます
            </TextBar>
          </p>
        </div>
      </div>
      <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-slate-200 px-3 text-xs font-medium">
        <span className="h-[13px] w-[13px]" />
        <TextBar>ログアウト</TextBar>
      </span>
    </section>
  );
}

/** TodayReviewCard の「復習が残っている」状態と同じ構成（見出し・語数・説明・CTA・進捗リング）。 */
function TodayReviewCardFallback() {
  return (
    <section
      aria-hidden
      className={`flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 ${CARD}`}
    >
      <div className={`flex flex-col gap-3 ${PULSE}`}>
        <p className="text-xs font-bold uppercase tracking-[0.12em]">
          <TextBar>{"TODAY'S REVIEW"}</TextBar>
        </p>
        <p className="flex items-baseline gap-2">
          <span className="text-[40px] font-bold leading-none sm:text-[48px]">
            <TextBar strong>00</TextBar>
          </span>
          <span className="text-lg font-bold">
            <TextBar strong>語</TextBar>
          </span>
          <span className="text-sm font-medium">
            <TextBar>を復習しましょう</TextBar>
          </span>
        </p>
        <p className="text-sm leading-[1.7]">
          <TextBar>忘れかけたタイミングの単語をまとめました。</TextBar>
        </p>
        <span className="mt-1 h-11 w-40 rounded-lg bg-slate-200" />
      </div>
      {/* 進捗リング（直径 104px・線幅 8px） */}
      <div className={`h-[104px] w-[104px] shrink-0 p-1 ${PULSE}`}>
        <div className="h-full w-full rounded-full border-8 border-slate-100" />
      </div>
    </section>
  );
}

const STREAK_ITEMS = [
  { label: "連続学習日数", unit: "日" },
  { label: "自己ベスト", unit: "日" },
  { label: "直近7日の復習", unit: "語" },
] as const;

/** StreakPanel と同じ 3 列（アイコン・ラベル・数値）。 */
function StreakPanelFallback() {
  return (
    <section aria-hidden className="grid grid-cols-3 gap-3">
      {STREAK_ITEMS.map(({ label, unit }) => (
        <div key={label} className={`p-4 ${CARD}`}>
          <div className={`flex flex-col gap-2 ${PULSE}`}>
            <span className="h-8 w-8 rounded-lg bg-slate-100" />
            <p className="text-[11px] font-medium sm:text-xs">
              <TextBar>{label}</TextBar>
            </p>
            <p className="flex items-baseline gap-0.5">
              <span className="text-[22px] font-bold leading-none sm:text-[26px]">
                <TextBar strong>00</TextBar>
              </span>
              <span className="text-xs font-bold">
                <TextBar strong>{unit}</TextBar>
              </span>
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

/** RetentionBreakdown と同じ構成（見出し・内訳バー・4 区分ボタン・説明）。 */
function RetentionBreakdownFallback() {
  return (
    <section aria-hidden className={`p-5 sm:p-6 ${CARD}`}>
      <div className={`flex flex-col gap-4 ${PULSE}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-bold">
            <TextBar strong>定着度の内訳</TextBar>
          </p>
          <p className="text-xs">
            <TextBar>お気に入り 00 語 ・ 0 語が定着済み・0 語が定着間近</TextBar>
          </p>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="min-h-11 rounded-lg border border-slate-200" />
          ))}
        </div>
        <p className="text-xs">
          <TextBar>定着度を選ぶと、該当する単語を確認できます。</TextBar>
        </p>
        <p className="text-xs leading-[1.6]">
          <TextBar>
            「覚えている」と答えるたびに 1 → 3 → 7 → 14 → 30 日と間隔が伸び、忘れかけた頃に再出題されます。
          </TextBar>
          <span className="ml-1 inline-flex items-center gap-0.5">
            <span className="h-[11px] w-[11px]" />
            <TextBar>忘却曲線とは</TextBar>
          </span>
        </p>
      </div>
    </section>
  );
}

const MENU_ITEMS = [
  { label: "お気に入り一覧", description: "登録した単語をまとめて見る" },
  { label: "聞き流し", description: "音声で例文ごと復習する" },
  { label: "学習モード", description: "全単語からランダム出題" },
  { label: "今日の6単語", description: "新しい単語を仕入れる" },
] as const;

/** ReviewMenu と同じ 2 列 × 2 行のリンクカード。 */
export function ReviewMenuFallback() {
  return (
    <section aria-hidden className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {MENU_ITEMS.map(({ label, description }) => (
        <div key={label} className={`p-4 ${CARD}`}>
          <div className={`flex items-center gap-3 ${PULSE}`}>
            <span className="h-9 w-9 shrink-0 rounded-lg bg-slate-100" />
            <div className="min-w-0">
              <p className="text-sm font-bold">
                <TextBar strong>{label}</TextBar>
              </p>
              <p className="text-xs">
                <TextBar>{description}</TextBar>
              </p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

/**
 * Supabase のお気に入りと復習記録が揃うまでのパーツ（MyPageDashboard の範囲）。
 * 苦手単語は該当語があるときだけ表示されるため、場所を確保しない。
 */
export function MyPageDashboardFallback() {
  return (
    <>
      <p role="status" className="sr-only">
        学習データを読み込んでいます
      </p>
      <TodayReviewCardFallback />
      <StreakPanelFallback />
      <RetentionBreakdownFallback />
    </>
  );
}

/** ヘッダー下の全パーツ。ページの `<Suspense>` fallback と認証判定中の表示で共有する。 */
export function MyPageContentFallback() {
  return (
    <>
      <MyPageAccountCardFallback />
      <MyPageDashboardFallback />
      <ReviewMenuFallback />
    </>
  );
}
