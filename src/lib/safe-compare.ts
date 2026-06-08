import { createHash, timingSafeEqual } from "crypto";

/**
 * トークン比較のタイミング攻撃対策。
 * 早期リターンする `a === b` と異なり、入力長に依存しない一定時間で比較する。
 * 両者を SHA-256 でハッシュ化してから固定長バッファ同士で比較することで、
 * 長さの違いから情報が漏れることも防ぐ。
 *
 * `server-only` や外部依存を持たない純粋ロジックのため単体テスト可能。
 */
export function safeEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) return false;
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
