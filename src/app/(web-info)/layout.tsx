export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="mx-auto max-w-3xl px-4 py-12">{children}</main>;
}
