import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Next 16 serves every image at q75 unless other qualities are allowed here.
  // WebP only: the full-frame stills decode several times faster than AVIF,
  // which is what keeps a section from stalling as it scrolls into view.
  images: { formats: ["image/webp"], qualities: [75, 85, 90, 95] },
  experimental: { optimizePackageImports: ["gsap", "framer-motion"] },
};

export default nextConfig;
