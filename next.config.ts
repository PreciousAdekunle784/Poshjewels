import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80],
    // Product photos uploaded on Vercel are stored in Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  serverExternalPackages: ["@libsql/client", "sharp"],
  // Ship the starter database and generated session secret with every server function. They are
  // only used on Vercel when no permanent database / SESSION_SECRET is configured.
  outputFileTracingIncludes: {
    "/*": ["./data/posh.db", "./data/session-secret"],
    "/**": ["./data/posh.db", "./data/session-secret"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
