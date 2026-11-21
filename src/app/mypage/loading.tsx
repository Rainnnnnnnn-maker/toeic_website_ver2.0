import { MyPageContentFallback } from "@/components/features/mypage/MyPageFallback";
import MyPageShell from "@/components/features/mypage/MyPageShell";

/**
 * 他ページから `prefetch={false}` のリンクで遷移したときの表示。
 * 低速回線では、ページの応答を受け取った時点でこのスケルトンへ切り替わり、
 * マイページの JS が届くまで遷移元の画面のまま止まって見えるのを防ぐ。
 * そのためクライアント部品を含めない（TOP リンクも素の <a> にする）。
 * ページ本体の Suspense fallback と同じ見た目にして、差し替え時にずれないようにする。
 */
export default function Loading() {
  return (
    <MyPageShell htmlTopLink>
      <MyPageContentFallback />
    </MyPageShell>
  );
}
