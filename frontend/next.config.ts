import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force the workspace root to this project (suppresses multi-lockfile warning)
    root: __dirname,
  },
};

export default nextConfig;
