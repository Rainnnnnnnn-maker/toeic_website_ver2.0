export function LoginCardFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <span className="sr-only">ログイン画面を読み込んでいます</span>
      <div aria-hidden className="flex animate-pulse flex-col gap-6 motion-reduce:animate-none">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-20 rounded-md bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-11/12 rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
        </div>
        <div className="h-12 w-full rounded-lg bg-slate-100" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-11/12 rounded bg-slate-100" />
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-3/4 rounded bg-slate-100" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function LoginPageFallback() {
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] px-4 py-12">
      <LoginCardFallback />
    </main>
  );
}
