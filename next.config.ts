import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bayshore.nyc3.cdn.digitaloceanspaces.com",
      },
    ],
  },
  async rewrites() {
    return [
      // NextAuth's own catch-all route (/api/auth/*) is dynamic, so without
      // this exclusion the blanket proxy below wins over it — Next.js
      // resolves "afterFiles" rewrites before dynamic routes — silently
      // sending session/csrf/callback requests to the backend instead of
      // NextAuth and breaking them.
      {
        source: "/api/:path((?!auth/).*)",
        destination: "http://localhost:8000/api/:path", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;