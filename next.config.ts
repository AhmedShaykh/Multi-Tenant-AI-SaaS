import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.clerk.dev"
      },
      {
        protocol: "https",
        hostname: "img.clerk.com"
      },
      {
        protocol: "https",
        hostname: "blob.vercel-storage.com"
      },
      {
        protocol: "http",
        hostname: "localhost"
      }
    ]
  }
};

export default nextConfig;