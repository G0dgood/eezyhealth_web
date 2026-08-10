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
  // NOTE: the favicon is declared via `metadata.icons` in src/app/layout.tsx.
  // A redirect from /favicon.ico was removed because NEXT_PUBLIC_FAVICON_PATH
  // pointed back at /favicon.ico, which redirected to itself → ERR_TOO_MANY_REDIRECTS.
};

export default nextConfig;
