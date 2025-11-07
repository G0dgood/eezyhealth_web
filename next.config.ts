import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Allow local file URLs for mobile app compatibility
    unoptimized: true,
    domains: [],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://us-central1-eezyhealth-2025.cloudfunctions.net/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/logowhite.svg",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
