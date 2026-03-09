import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "ページが見つかりません",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-[radial-gradient(circle_at_top,_#fee2e2_0,_#f9fafb_45%,_#ffffff_100%)]">
      <main className="w-full max-w-[480px] text-center px-5 py-6 pb-7 rounded-[20px] bg-white/96 border border-gray-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <p className="text-[13px] tracking-widest uppercase text-gray-400 mb-2 font-medium">
          404 Not Found
        </p>
        <h1 className="text-2xl leading-snug text-gray-900 mb-2 font-bold">
          ページが見つかりません
        </h1>
        <p className="text-sm leading-relaxed text-gray-600 mb-6">
          URL が間違っているか、ページが移動または削除された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-gray-800 text-sm font-semibold hover:shadow-md hover:translate-y-[-1px] transition-all duration-200 active:scale-95"
        >
          <ArrowLeft size={16} />
          トップページに戻る
        </Link>
      </main>
    </div>
  );
}
