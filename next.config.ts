import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build enxuto para container: .next/standalone traz só o necessário
  output: "standalone",
};

export default nextConfig;
