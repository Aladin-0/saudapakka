import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://saudapakka_backend:8000/api/:path*',
      },
      {
        source: '/media/:path*',
        destination: 'http://saudapakka_backend:8000/media/:path*',
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

  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: true,
  compress: true,
};

export default nextConfig;
