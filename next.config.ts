import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF where supported (~30% smaller than WebP); encoded once, then cached.
    formats: ["image/avif", "image/webp"],
    // Content images are immutable per deploy — cache optimized variants for a year.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
