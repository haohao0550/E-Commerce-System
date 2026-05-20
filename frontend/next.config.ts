import type { NextConfig } from 'next';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['motion'],
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
