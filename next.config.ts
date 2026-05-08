import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  // experimental: {
  //   staleTimes:{
  //     dynamic: 180,
  //     static:300,
  //   },
  // },
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
