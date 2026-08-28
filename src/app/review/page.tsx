import { Suspense } from "react";
import { getAllWords } from "@/data/words";
import ReviewWrapper from "@/components/features/review/ReviewWrapper";

export const metadata = {
  title: "復習モード",
  description: "お気に入り登録した単語を重点的に復習します。",
  alternates: {
    canonical: "https://www.toeic-words.com/review",
  },
  robots: {
    index: false,
  },
};

function ReviewFallback() {
  return (
    <div className="min-h-screen w-full flex justify-center items-center py-8 px-4 bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)]">
      <p className="text-sm leading-[1.6] text-gray-500">読み込み中...</p>
    </div>
  );
}

export default async function ReviewPage() {
  const allWords = await getAllWords();

  // ReviewWrapper が useSearchParams（?queue=）を読むため Suspense 境界が必要
  return (
    <Suspense fallback={<ReviewFallback />}>
      <ReviewWrapper allWords={allWords} />
    </Suspense>
  );
}
