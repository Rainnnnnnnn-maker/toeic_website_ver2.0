"use client";

import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import type { Word } from "@/data/words";
import { trackMyPageCta } from "@/components/features/mypage/analytics";

type WeakItem = {
  word: Word;
  forgotCount: number;
};

type Props = {
  items: WeakItem[];
};

/** 「覚えていない」と答えた回数が多い単語。苦手だけをまとめて復習できる。 */
export default function WeakWordsPanel({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
          <TriangleAlert size={16} />
        </span>
        <h3 className="text-sm font-bold text-slate-800">苦手な単語</h3>
      </div>

      <ul className="flex flex-wrap gap-2">
        {items.map(({ word, forgotCount }) => (
          <li key={word.slug}>
            <Link
              href={`/words/${word.slug}?from=mypage`}
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-2 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-1"
            >
              {word.term}
              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                ×{forgotCount}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/review?queue=weak"
        prefetch={false}
        onClick={() => trackMyPageCta("review_weak")}
        className="group inline-flex items-center gap-1.5 self-start text-sm font-bold text-rose-600 transition-colors hover:text-rose-700"
      >
        苦手な単語だけ復習する
        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </section>
  );
}
