import Link from "next/link";
import { Wrench } from "lucide-react";

// LOGIN_MAINTENANCE 中に、未ログインの訪問者へ Google ログインボタンの代わりに出すカード。
export function LoginMaintenanceNotice() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Wrench size={20} aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          ログイン機能はメンテナンス中です
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          現在、Google ログインを一時停止しています。ご不便をおかけしますが、復旧まで今しばらくお待ちください。
        </p>
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
        単語閲覧・検索・お気に入り（この端末に保存）・学習モード・今日の6単語は、
        <strong>ログインなしで</strong>今まで通りご利用いただけます。
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        すでにログインしている端末では、お気に入りと復習の記録を引き続きご利用いただけます。
      </p>

      <div className="flex items-center">
        <Link
          href="/"
          prefetch={false}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
