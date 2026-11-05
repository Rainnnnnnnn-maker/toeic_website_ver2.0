import type { SavedStudyWordsPersistence } from '@/lib/study-saved-words-store';

export default function StudySavedWordsNotice({ persistence }: { persistence: SavedStudyWordsPersistence }) {
  const message = persistence === 'unsupported-version'
    ? 'この画面では読み込めない以前の保存データを保護しています。今回の一覧はこのタブ内でのみ保持されます。'
    : persistence === 'memory-only'
      ? 'ブラウザに保存できないため、一覧はこのタブ内でのみ保持されます。'
      : '一覧はこのブラウザに自動保存。次回も確認でき、「覚えている」で一覧から外れます。';

  return (
    <p role="status" className={`max-w-md text-center text-xs leading-relaxed ${persistence === 'persistent' ? 'text-slate-600' : 'text-amber-800'}`}>
      {message}
    </p>
  );
}
