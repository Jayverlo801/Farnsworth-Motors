import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers has no default Next image optimizer; placeholders are
  // SVG/local so we serve images as-is. Revisit with a CF Images loader when
  // real photography lands (docs/DEPLOY.md).
  images: { unoptimized: true },
  /* config options here */
};

export default nextConfig;
