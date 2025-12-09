import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

   typescript: {
    // ⚠️ Ignore les erreurs TypeScript pendant le build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Optionnel : ignorer aussi ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
