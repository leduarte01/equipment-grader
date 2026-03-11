import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Optimized for deployment
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
