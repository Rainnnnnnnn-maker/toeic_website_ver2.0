/** Shared shell only. Advertising must never be inherited by draft/error pages. */
export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
