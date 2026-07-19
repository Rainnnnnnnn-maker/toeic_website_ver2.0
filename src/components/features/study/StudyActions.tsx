'use client';

type Props = {
  onRemembered: () => void;
  onForgot: () => void;
  onLater: () => void;
  showDifficultyTip: boolean;
  consecutiveRememberCount: number;
};

// 「覚えている / 覚えていない / あとで」の 3 ボタンと難易度アップのヒント表示。
export default function StudyActions({
  onRemembered,
  onForgot,
  onLater,
  showDifficultyTip,
  consecutiveRememberCount,
}: Props) {
  return (
    <section className="flex flex-col items-center w-full mt-0">
      <div className="flex flex-wrap gap-4 w-full justify-center sm:gap-6">
        <button
          className="flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-full border-none cursor-pointer transition-all duration-200 shadow-sm bg-green-200 text-green-900 border-2 border-green-300 hover:bg-green-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:h-[120px] sm:w-[120px]"
          onClick={onRemembered}
          aria-label="覚えている"
        >
          <span className="text-[32px] font-bold">💡</span>
          <span className="text-[10px] font-semibold leading-none sm:text-sm">覚えている</span>
        </button>

        <button
          className="flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-full border-none cursor-pointer transition-all duration-200 shadow-sm bg-red-200 text-red-900 border-2 border-red-300 hover:bg-red-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:h-[120px] sm:w-[120px]"
          onClick={onForgot}
          aria-label="覚えていない"
        >
          <span className="text-[32px] font-bold">❔</span>
          <span className="text-[10px] font-semibold leading-none sm:text-sm">覚えていない</span>
        </button>

        <button
          className="flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-full border-none cursor-pointer transition-all duration-200 shadow-sm bg-amber-100 text-amber-900 border-2 border-amber-300 hover:bg-amber-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:h-[120px] sm:w-[120px]"
          onClick={onLater}
          aria-label="あとで確認"
        >
          <span className="text-[32px] font-bold">⏰</span>
          <span className="text-[10px] font-semibold leading-none sm:text-sm">あとで</span>
        </button>
      </div>

      {showDifficultyTip && (
        <div className="mt-8 flex items-center gap-2 text-[13px] font-medium text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-200 shadow-sm backdrop-blur-sm transition-all duration-300">
          <span className="text-amber-500 text-base leading-none">💡</span>
          <span>連続で「覚えている」を選ぶと難易度が上がります</span>
          {consecutiveRememberCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold animate-pulse">
              {consecutiveRememberCount}連続中 🔥
            </span>
          )}
        </div>
      )}
    </section>
  );
}
