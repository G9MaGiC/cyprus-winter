import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },
  distDir: "dist/next",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
