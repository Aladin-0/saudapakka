import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production: Enable standalone output for Docker
  output: 'standalone',

  // Production environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://saudapakka.com/api',
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

  // Compression handled by nginx/reverse proxy
  compress: true,
};

export default nextConfig;