import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: { remotePatterns: [{ protocol: "https", hostname: "qaslsjyxjwvdoiczmhgq.supabase.co" }, { protocol: "http", hostname: "localhost" }] },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = { ...(config.resolve.fallback || {}), fs: false, module: false, path: false };
    }
    return config;
  },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Frame-Options", value: "DENY" }, { key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] }];
  }
};

export default nextConfig;
