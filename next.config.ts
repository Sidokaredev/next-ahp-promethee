import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
        search: ""
      }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb',
    }
  },
  devIndicators: false,
};

export default nextConfig;
