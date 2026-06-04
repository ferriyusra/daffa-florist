import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
