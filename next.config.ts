import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components stays off: every page that reads cookies or the DB renders per request.
  // Don't add "use cache" in lane code (docs/CONTRACTS.md §1).
  // Let a phone reach `next dev` through an HTTPS tunnel during the demo.
  allowedDevOrigins: ["*.trycloudflare.com", "*.ngrok-free.app"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
