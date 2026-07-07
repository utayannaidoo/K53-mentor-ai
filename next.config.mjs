const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 * - script-src keeps 'unsafe-inline' because Next.js injects inline runtime
 *   scripts without a nonce pipeline; external script injection is still
 *   blocked, which is the main XSS escalation path.
 * - Dev additionally needs 'unsafe-eval' (react-refresh) and ws: (HMR).
 * - connect-src allows Supabase (auth/data) alongside same-origin API calls.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://avatars.githubusercontent.com",
  "font-src 'self' data:",
  // PostHog ingestion hosts (us/eu); harmless when analytics is unconfigured.
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.i.posthog.com https://*.posthog.com${isProd ? "" : " ws:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
