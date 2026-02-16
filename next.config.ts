import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番ビルドの最適化（Vercel での応答を軽くする）
  reactStrictMode: true,
  poweredByHeader: false,
  // 大きなパッケージの tree-shake（bundle 削減）
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },
};

export default nextConfig;
