import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Next 16 serves every image at q75 unless other qualities are allowed here
  images: { formats: ["image/avif", "image/webp"], qualities: [75, 85, 90, 95] },
  experimental: { optimizePackageImports: ["three", "@react-three/drei", "gsap", "framer-motion"] },
};

export default nextConfig;
