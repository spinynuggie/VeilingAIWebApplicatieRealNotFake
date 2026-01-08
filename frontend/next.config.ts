import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force the workspace root to this project (suppresses multi-lockfile warning)
    root: __dirname,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
