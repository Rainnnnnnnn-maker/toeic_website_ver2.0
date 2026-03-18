import Link from "next/link";
import { Suspense } from "react";
import WordNavigation from "@/components/features/words/WordNavigation";
import { ShareTargetProvider } from "@/context/ShareTargetContext";
import { ChevronLeft } from "lucide-react";

export default async function WordLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ word: string }>;
}) {
  const { word } = await params;

  return (
    <ShareTargetProvider>
      <div className="min-h-screen w-full flex justify-center py-8 px-4 pb-10 bg-[radial-gradient(circle_at_top,#ccfbf1_0,#f9fafb_45%,#ffffff_100%)] sm:py-12 sm:px-6 sm:pb-14 lg:py-16 lg:px-8 lg:pb-18">
        <main className="w-full max-w-[960px] flex flex-col gap-6">
          <Suspense
            fallback={
              <header className="flex flex-col gap-4">
                <div className="flex items-center gap-3 whitespace-nowrap overflow-x-auto pb-1 -mb-1">
                  <Link 
                    href="/" 
                    className="group inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-white border border-gray-200 rounded-full text-slate-600 text-[15px] font-semibold no-underline transition-all duration-200 shadow-sm select-none hover:bg-gray-50 hover:border-gray-300 hover:text-slate-900 hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm"
                  >
                    <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-600" />
                    単語一覧
                  </Link>
                  <span className="text-slate-300 text-lg">/</span>
                  <span className="text-slate-700 text-lg font-bold tracking-wide uppercase">...</span>
                </div>
                <div className="flex justify-between gap-4 items-end">
                  <h2 className="text-xl leading-[1.4] text-slate-900 tracking-[0.02em]">AI単語解説</h2>
                </div>
              </header>
            }
          >
            <WordNavigation currentSlug={word} />
          </Suspense>
          {children}
          <p className="m-0 mt-3.5 text-xs leading-[1.7] text-gray-500 text-center">
            AIによる解説は必ずしも正しいとは限りません。重要な情報は確認するようにしてください。
          </p>
        </main>
      </div>
    </ShareTargetProvider>
  );
}
