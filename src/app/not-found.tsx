import Link from "next/link";

export const metadata = {
	title: "ページが見つかりません",
	robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "32px 16px",
        background:
          "radial-gradient(circle at top, #fee2e2 0, #f9fafb 45%, #ffffff 100%)",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: 480,
          textAlign: "center",
          padding: "24px 20px 28px",
          borderRadius: 20,
          background: "rgba(255, 255, 255, 0.96)",
          border: "1px solid #e5e7eb",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <p
          style={{
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9ca3af",
            marginBottom: 8,
          }}
        >
          404 Not Found
        </p>
        <h1
          style={{
            fontSize: 24,
            lineHeight: 1.4,
            color: "#111827",
            marginBottom: 8,
          }}
        >
          ページが見つかりません
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "#4b5563",
            marginBottom: 24,
          }}
        >
          URL が間違っているか、ページが移動または削除された可能性があります。
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            background:
              "linear-gradient(135deg, #eff6ff 0, #dbeafe 40%, #bfdbfe 100%)",
            color: "#1f2937",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          トップページに戻る
        </Link>
      </main>
    </div>
  );
}
