/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Optimized for deployment
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;