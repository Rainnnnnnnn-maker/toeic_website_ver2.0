'use client';

import { Check, Clock3, Eye, Flame, Lightbulb, RotateCcw } from 'lucide-react';
import { getStreakFlameCount } from '@/lib/study-utils';

type Props = {
  actionsRef: React.RefObject<HTMLElement | null>;
  revealButtonRef: React.RefObject<HTMLButtonElement | null>;
  isRevealed: boolean;
  onReveal: () => void;
  onRemembered: () => void;
  onForgot: () => void;
  onLater: () => void;
  showDifficultyTip: boolean;
  consecutiveRememberCount: number;
};

const GRADE_BUTTON_CLASS =
  'flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] text-[13px] font-bold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-[72px] sm:text-sm';

// 表面では「答えを見る」、答えを開いた後は「覚えている / 覚えていない / あとで」の 3 択を表示する。
// 並び順は従来の学習モードと同じにして、利用者の慣れを崩さない。
// 色だけに頼らないよう、明度の違う配色・アイコン・文字を併用する。
export default function StudyActions({
  actionsRef,
  revealButtonRef,
  isRevealed,
  onReveal,
  onRemembered,
  onForgot,
  onLater,
  showDifficultyTip,
  consecutiveRememberCount,
}: Props) {
  const flameCount = getStreakFlameCount(consecutiveRememberCount);

  return (
    <section ref={actionsRef} aria-label="回答" className="flex w-full flex-col items-center gap-6">
      {isRevealed ? (
        <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onRemembered}
            className={`${GRADE_BUTTON_CLASS} border-blue-600 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500`}
          >
            <Check size={20} strokeWidth={2.5} aria-hidden />
            覚えている
          </button>
          <button
            type="button"
            onClick={onForgot}
            className={`${GRADE_BUTTON_CLASS} border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100 active:bg-orange-200 focus-visible:ring-orange-500`}
          >
            <RotateCcw size={20} aria-hidden />
            覚えていない
          </button>
          <button
            type="button"
            onClick={onLater}
            className={`${GRADE_BUTTON_CLASS} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-500`}
          >
            <Clock3 size={20} aria-hidden />
            あとで
          </button>
        </div>
      ) : (
        <button
          ref={revealButtonRef}
          type="button"
          onClick={onReveal}
          className="flex h-14 w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-blue-600 text-base font-bold text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Eye size={20} aria-hidden />
          答えを見る
        </button>
      )}

      {showDifficultyTip && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/60 px-4 py-2 text-[13px] font-medium text-slate-600 shadow-sm">
          <Lightbulb size={16} className="text-amber-600" aria-hidden />
          <span>連続で「覚えている」を選ぶと難易度が上がります</span>
          {consecutiveRememberCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-800">
              {consecutiveRememberCount}連続中
              <span className="inline-flex" aria-hidden>
                {Array.from({ length: flameCount }, (_, i) => (
                  <Flame key={i} size={12} />
                ))}
              </span>
            </span>
          )}
        </div>
      )}
    </section>
  );
}
