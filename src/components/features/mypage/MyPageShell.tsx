import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  children: ReactNode;
  /**
   * true のとき TOP リンクを素の `<a>` で描く（loading.tsx 用。押すと通常のページ遷移）。
   * `next/link` はクライアント部品なので、遷移先ページの JS チャンクが届くまで
   * それを含む loading 表示ごと描画を待たされ、スケルトンを先に出せなくなる。
   */
  htmlTopLink?: boolean;
};

const TOP_LINK_CLASS =
  "group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[36px] bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-sm shadow-xs transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500";

/**
 * マイページの背景・見出し・TOP リンク。
 * page.tsx と loading.tsx で共有し、遷移中のスケルトンと表示後で位置をそろえる。
 * データに依存しないため、単語リストの取得を待たずに静的シェルとして描画される。
 */
export default function MyPageShell({ children, htmlTopLink = false }: Props) {
  const topLinkContent = (
    <>
      <ArrowLeft
        size={16}
        className="transition-transform group-hover:-translate-x-1"
      />
      <span>TOP</span>
    </>
  );

  return (
    <div className="relative min-h-screen w-full flex justify-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] sm:py-12 sm:px-6 lg:py-8 lg:px-8 lg:pb-16">
      <main className="w-full max-w-[960px] flex flex-col gap-5 relative">
        <header className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex flex-col gap-3 sm:max-w-[60%]">
            <p className="text-xs tracking-[0.12em] uppercase text-slate-500">
              MY PAGE
            </p>
            <h1 className="text-[22px] leading-[1.3] text-slate-900 font-bold sm:text-[26px] lg:text-[28px]">
              マイページ
            </h1>
            <p className="text-sm leading-[1.6] text-gray-500">
              お気に入り単語の復習スケジュールと、続けた記録をまとめています。
            </p>
          </div>
          <div className="flex gap-4 items-center mt-2 flex-wrap justify-end sm:justify-start">
            {htmlTopLink ? (
              // eslint-disable-next-line @next/next/no-html-link-for-pages -- 上記 htmlTopLink の理由で意図的に素の <a> を使う
              <a href="/" className={TOP_LINK_CLASS}>
                {topLinkContent}
              </a>
            ) : (
              <Link href="/" prefetch={false} className={TOP_LINK_CLASS}>
                {topLinkContent}
              </Link>
            )}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
