import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build output minimal untuk Docker (hanya file yang dibutuhkan runtime).
  output: 'standalone',
  // pino & next-logger memakai API Node (worker/transport) → jangan di-bundle.
  serverExternalPackages: ['pino', 'next-logger'],
  images: {
    // AVIF dulu (kompresi terbaik untuk foto), fallback WebP. Sumber PNG besar
    // (300–700KB) jadi jauh lebih kecil saat dioptimasi next/image.
    formats: ['image/avif', 'image/webp'],
    // Cache hasil optimasi 30 hari supaya tidak re-encode tiap request (penting
    // untuk LCP di self-hosted/standalone).
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
