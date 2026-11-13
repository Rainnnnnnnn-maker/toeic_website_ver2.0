import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  // Next.js 更新後も従来のプリフェッチ動作を維持する。
  partialPrefetching: false,
  // Cypress の baseUrl は 127.0.0.1。`--hostname 127.0.0.1` なしで起動した dev サーバーは localhost 以外の
  // Origin からの /_next 開発リソースを 403 にし、ページがハイドレートされず E2E が失敗する（dev のみ有効）。
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    staleTimes:{
      dynamic: 180,
      static:300,
    },
  },
  // 全レスポンスに付ける固定値のセキュリティヘッダー。nonce を使わないので静的プリレンダーに影響しない。
  // script-src / connect-src はあえて含めていない（GA・Supabase・Next.js のインラインスクリプトを壊さないため）。
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ]
  },
};

export default nextConfig;
