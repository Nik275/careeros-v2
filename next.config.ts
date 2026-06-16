import type { NextConfig } from "next";

const clerkStagingFrontendApi = 'https://teaching-swine-10.clerk.accounts.dev';
const clerkImageHost = 'https://img.clerk.com';
const cloudflareChallengesHost = 'https://challenges.cloudflare.com';

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  `img-src 'self' data: blob: ${clerkImageHost}`,
  "font-src 'self' data:",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${clerkStagingFrontendApi} ${cloudflareChallengesHost}`,
  `script-src-elem 'self' 'unsafe-inline' ${clerkStagingFrontendApi} ${cloudflareChallengesHost}`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${clerkStagingFrontendApi}`,
  "worker-src 'self' blob:",
  `frame-src 'self' ${cloudflareChallengesHost}`,
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;
