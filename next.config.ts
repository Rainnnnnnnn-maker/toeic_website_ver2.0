import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  // Cypress の baseUrl は 127.0.0.1。`--hostname 127.0.0.1` なしで起動した dev サーバーは localhost 以外の
  // Origin からの /_next 開発リソースを 403 にし、ページがハイドレートされず E2E が失敗する（dev のみ有効）。
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    staleTimes:{
      dynamic: 180,
      static:300,
    },
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
