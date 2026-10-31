import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1','localhost'],
  async rewrites() {
    if (process.env.VERCEL === '1') {
      return process.env.BACKEND_URL
        ? [{ source: '/api/:path*', destination: `${process.env.BACKEND_URL}/api/:path*` }]
        : [];
    }
    return [{ source: '/api/:path*', destination: `${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/api/:path*` }];
  }
};
export default nextConfig;
