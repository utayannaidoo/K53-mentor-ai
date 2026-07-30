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
  // Every image the app renders is a local /signs/* asset (439 of them) or an
  // inline data:/blob: preview from the scanner's file input. No remote hosts.
  "img-src 'self' data: blob:",
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
  // microphone=(self): the flashcard voice-answer feature uses the Web Speech
  // API, which Chromium gates on the microphone policy. Camera stays blocked —
  // the sign scanner uses a file input (native camera app), not getUserMedia.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=()" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No remotePatterns on purpose. Nothing in the app loads a remote image —
  // the sign catalogue is 439 local /signs/* files — so allowing any remote
  // host only left the image optimiser fetching and decoding attacker-chosen
  // URLs for no product reason. That fetch path is the way Next's bundled
  // sharp/libvips CVEs (GHSA-f88m-g3jw-g9cj) would be reached, and it is an
  // SSRF-adjacent primitive in its own right. An empty allow-list closes it.
  // (dangerouslyAllowSVG stays unset, so SVG optimisation is off too.)
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
