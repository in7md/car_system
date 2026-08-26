import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We omit output: 'standalone' here because Vercel automatically detects Next.js.
  // For Docker, users can set the environment variable STANDALONE=true or uncomment it.
  ...(process.env.STANDALONE === 'true' && { output: 'standalone' }),

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
