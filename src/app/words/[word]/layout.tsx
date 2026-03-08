import Link from "next/link";
import { Suspense } from "react";
import WordNavigation from "@/components/features/words/WordNavigation";
import { ShareTargetProvider } from "@/context/ShareTargetContext";

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
              <header>
                <div className="inline-flex items-center gap-1.5 text-lg tracking-[0.12em] uppercase text-gray-500 mb-2 whitespace-nowrap">
                  <Link href="/" className="text-indigo-600 no-underline text-2xl font-semibold">
                    単語一覧
                  </Link>
                  <span className="mx-0.5">/</span>
                  <span className="text-gray-700">...</span>
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
