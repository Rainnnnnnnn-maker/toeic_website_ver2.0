import type { AudioError } from "@/hooks/useTTS";

type Props = {
  error: AudioError | null;
  targets: string[];
  onRetry: () => void;
};

export function AudioErrorNotice({ error, targets, onRetry }: Props) {
  if (!error || !targets.includes(error.target)) return null;
  return (
    <div className="my-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
      <p role="alert">{error.message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg border border-rose-300 bg-white px-3 font-semibold transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
      >
        音声を再試行
      </button>
    </div>
  );
}
