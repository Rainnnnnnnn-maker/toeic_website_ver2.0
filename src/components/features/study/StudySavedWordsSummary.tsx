'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import type { Word } from '@/data/words';
import SavedStudyWordsPanel from './SavedStudyWordsPanel';
import StudySavedWordsNotice from './StudySavedWordsNotice';
import type { SavedStudyWordsPersistence } from '@/lib/study-saved-words-store';

type Props = {
  forgottenWords: Word[];
  laterWords: Word[];
  persistence: SavedStudyWordsPersistence;
  backLink: string;
  backLinkText: string;
  onSelect: (word: Word) => void;
  onContinue: () => void;
};

export default function StudySavedWordsSummary({
  forgottenWords,
  laterWords,
  persistence,
  backLink,
  backLinkText,
  onSelect,
  onContinue,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const total = forgottenWords.length + laterWords.length;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,#bae6fd_0,#eff6ff_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 sm:py-12">
      <main aria-label="学習の振り返り" className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="rounded-lg text-2xl font-bold leading-tight text-slate-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4 sm:text-3xl"
          >
            保存した単語を確認
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            {persistence === 'unsupported-version'
              ? '今回このタブで選んだ単語を表示しています。単語を選ぶと、カードで確かめられます。'
              : 'これまでに保存した単語も含めて表示しています。単語を選ぶと、カードで確かめられます。'}
          </p>
          <p className="rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-900">
            {persistence === 'unsupported-version' ? '今回の単語' : '保存した単語'}：{total}語
          </p>
        </header>

        {total === 0 && (
          <p role="status" className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-center text-sm leading-relaxed text-slate-600">
            {persistence === 'unsupported-version'
              ? '今回のタブでは、まだ確認する単語がありません。'
              : '保存した単語はまだありません。学習中に「覚えていない」や「あとで」を選ぶと、ここで振り返れます。'}
          </p>
        )}

        <div className="grid items-start gap-4 md:grid-cols-2 md:gap-6">
          <SavedStudyWordsPanel
            words={forgottenWords}
            kind="forgotten"
            onSelect={onSelect}
            collapsible={false}
            bulkFavoriteSource="study_summary"
          />
          <SavedStudyWordsPanel
            words={laterWords}
            kind="later"
            onSelect={onSelect}
            collapsible={false}
          />
        </div>

        <div className="flex flex-col items-center gap-1 text-center text-sm leading-relaxed text-slate-600">
          <StudySavedWordsNotice persistence={persistence} />
          {persistence !== 'persistent' && <p>「覚えている」を選ぶと、この一覧から外れます。</p>}
        </div>

        <nav aria-label="振り返り後の操作" className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            学習を続ける
            <ArrowRight size={18} aria-hidden />
          </button>
          <Link
            href={backLink}
            prefetch={false}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 no-underline transition-colors hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <ChevronLeft size={18} aria-hidden />
            {backLinkText}
          </Link>
        </nav>
      </main>
    </div>
  );
}
