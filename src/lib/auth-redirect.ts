/**
 * ログイン後の戻り先（`?next=`）の検証。
 * `/auth/callback` とログイン画面の両方から使う中立モジュールのため、
 * "use client" / "server-only" のどちらも付けないこと。
 */

/**
 * サイト内パスだけを許可する（open redirect 対策）。
 * 先頭が "/" でも "//evil.example" や "/\evil.example" はブラウザが
 * 外部オリジンとして解釈しうるため弾く。
 */
export function sanitizeNextPath(
  raw: string | null | undefined,
  fallback = "/"
): string {
  if (typeof raw !== "string" || raw === "") return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
