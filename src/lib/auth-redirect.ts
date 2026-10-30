/**
 * ログイン後の戻り先（`?next=`）の検証。
 * `/auth/callback` とログイン画面の両方から使う中立モジュールのため、
 * "use client" / "server-only" のどちらも付けないこと。
 */

// 解決後のオリジンを比べるためだけの基準。実在しえない予約ドメイン（.invalid）にして、
// "//localhost" のような値が基準と同じオリジンに見えて通ることを防ぐ
const PLACEHOLDER_ORIGIN = "https://placeholder.invalid";

/**
 * サイト内パスだけを許可する（open redirect 対策）。
 * 先頭が "/" でも "//evil.example" や "/\evil.example" はブラウザが
 * 外部オリジンとして解釈しうるため弾く。ブラウザは URL 中のタブ・改行を
 * 取り除くので、"/\t/evil.example" も "//evil.example" として扱われる。
 */
export function sanitizeNextPath(
  raw: string | null | undefined,
  fallback = "/"
): string {
  if (typeof raw !== "string" || raw === "") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  // 制御文字（タブ・改行・CR を含む）とバックスラッシュは位置を問わず弾く
  if (/[\p{Cc}\\]/u.test(raw)) return fallback;
  // 念のため、実際に解決したオリジンが変わらないことも確かめる
  try {
    if (new URL(raw, PLACEHOLDER_ORIGIN).origin !== PLACEHOLDER_ORIGIN) {
      return fallback;
    }
  } catch {
    return fallback;
  }
  return raw;
}
