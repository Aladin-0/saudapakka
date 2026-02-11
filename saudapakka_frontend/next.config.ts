import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production: Enable standalone output for Docker (ONLY in production!)
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' } : {}),

  // Production environment variables
  env: {
    // FIX: Default to localhost in development to prevent 401s/CORS errors
    // Also removed /api from prod URL to prevent double /api/api/ paths
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
      {
        source: '/media/:path*',
        destination: 'http://backend:8000/media/:path*',
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "saudapakka.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "72.61.246.159",
      },
    ],
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Production optimizations
  reactStrictMode: true,
  trailingSlash: true,

  // Compression handled by nginx/reverse proxy
  compress: true,
};

export default nextConfig;