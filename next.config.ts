import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build output minimal untuk Docker (hanya file yang dibutuhkan runtime).
  output: 'standalone',
  // pino & next-logger memakai API Node (worker/transport) → jangan di-bundle.
  serverExternalPackages: ['pino', 'next-logger'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
