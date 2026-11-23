import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    serverActions: {
      bodySizeLimit: "150mb",
      allowedOrigins: [
        "localhost:3000",
        "*.devtunnels.ms",
        "*.inc1.devtunnels.ms",
        "xxk4l4m7-3000.inc1.devtunnels.ms",
        "*.ngrok-free.app",
        "*.loca.lt",
      ],
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
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
