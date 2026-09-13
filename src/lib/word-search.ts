/**
 * 英単語の前方一致検索（クライアント側の一覧絞り込み用）。
 * 副作用を持たない純ロジックのため `server-only` / `"use client"` は付けない。
 */

/**
 * 検索語・単語表記を比較用に正規化する。
 * NFKC（全角英字・全角スペース→半角）→ 空白の圧縮 → 前後空白除去 → 小文字化。
 * IME が全角モードのまま入力されても一致させるために NFKC をかける。
 */
export function normalizeTermQuery(raw: string): string {
  return raw.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * 表記が検索語で始まる単語だけを返す。
 * 完全一致を先頭に寄せ、それ以外は入力の並び順（例: お気に入りの新しい順）を保つ。
 * 検索語が空なら全件を同じ順序で返す。入力配列は変更しない。
 */
export function filterWordsByTermPrefix<T extends { term: string }>(
  words: readonly T[],
  rawQuery: string
): T[] {
  const query = normalizeTermQuery(rawQuery);
  if (!query) return [...words];

  const exact: T[] = [];
  const prefixed: T[] = [];
  for (const word of words) {
    const term = normalizeTermQuery(word.term);
    if (term === query) exact.push(word);
    else if (term.startsWith(query)) prefixed.push(word);
  }
  return [...exact, ...prefixed];
}
