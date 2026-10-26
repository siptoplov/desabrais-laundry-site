import type { NextConfig } from 'next';

/**
 * Сайт собирается как полностью статический (output: 'export'):
 * деплой на Vercel, Netlify, Cloudflare Pages или GitHub Pages без сервера.
 * NEXT_PUBLIC_BASE_PATH — если сайт живёт в подпапке (например, GitHub Pages).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default config;
