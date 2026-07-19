'use client';

import { Clock3 } from 'lucide-react';
import type { Word } from '@/data/words';

const LEVEL_LABELS: Record<Word['level'], string> = {
  important: '重要',
  medium: '中級',
  high: '上級',
};

type Props = {
  words: Word[];
  currentSlug: string;
  onSelect: (word: Word) => void;
};

// 「あとで確認」に積んだ単語の一覧サイドバー。クリックでその単語をカードに表示する。
export default function LaterWordsSidebar({ words, currentSlug, onSelect }: Props) {
  return (
    <aside className="w-full rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-[0_10px_25px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:sticky lg:top-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Clock3 size={18} strokeWidth={2.4} />
          </span>
          <div>
            <h2 className="text-base font-bold leading-tight text-slate-900">あとで確認</h2>
            <p className="text-xs font-medium text-slate-500">{words.length}語を保留中</p>
          </div>
        </div>
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {words.map((word) => {
          const isActive = currentSlug === word.slug;

          return (
            <button
              key={word.slug}
              type="button"
              onClick={() => onSelect(word)}
              className={`group flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 ${
                isActive
                  ? 'border-blue-300 bg-blue-50 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:-translate-y-0.5 hover:shadow-sm'
              }`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{word.term}</span>
                <span className="mt-0.5 block text-xs font-medium text-slate-500">
                  {LEVEL_LABELS[word.level]}
                </span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${
                isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-700'
              }`}>
                確認
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
