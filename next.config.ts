import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
