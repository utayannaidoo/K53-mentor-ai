import type { Metadata, Viewport } from "next";
import { Inter, Overpass, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { DataSaverInit } from "@/components/shared/data-saver-init";
import { ErrorReporter } from "@/components/shared/error-reporter";
import { AnalyticsProvider } from "@/components/shared/analytics-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SwRegister } from "@/components/shared/sw-register";
import { APP_NAME, SEO_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { ADSENSE_CLIENT } from "@/lib/ads";

const SITE_VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim(),
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim(),
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
// Overpass is digitised from highway signage — headings read like road signs,
// the Road Atlas theme's typographic signature.
const overpass = Overpass({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Leads with what people type — "K53 learner's licence test" — and ends
    // with the brand. The old default opened with the brand name, which nobody
    // searching for a practice test has heard of yet.
    default: `K53 Learner's Licence Test: Free Practice & Road Signs | ${APP_NAME}`,
    template: `%s · ${APP_NAME}`,
  },
  description: SEO_DESCRIPTION,
  applicationName: APP_NAME,
  // Site-ownership proof for AdSense. Google's reviewer reads public pages,
  // and the ad script itself only ever loads for signed-in free accounts, so
  // this tag (with /ads.txt) is what it finds instead.
  ...(ADSENSE_CLIENT ? { other: { "google-adsense-account": ADSENSE_CLIENT } } : {}),
  keywords: [
    "K53",
    "K53 learners test",
    "K53 learner's licence test",
    "learners licence test South Africa",
    "K53 questions and answers",
    "K53 practice test",
    "K53 mock test",
    "K53 road signs",
    "South African road signs",
    "learner's licence",
    "driver's licence test",
    "K53 driving test",
    "K53 yard test",
    "code 8 learners",
    "code 10 learners",
    "code 14 learners",
    "motorcycle learners licence",
    "K53 rules of the road",
    "K53 vehicle controls",
  ],
  category: "education",
  // Explicit rather than relying on defaults: large image previews and
  // unlimited snippets are opt-in for Google, and the sign pages and guides
  // are exactly the content that earns the bigger result.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Search Console / Bing Webmaster ownership tags. Env-driven so a preview
  // deployment or a fork never claims the production property.
  verification: {
    ...(SITE_VERIFICATION.google ? { google: SITE_VERIFICATION.google } : {}),
    ...(SITE_VERIFICATION.bing ? { other: { "msvalidate.01": SITE_VERIFICATION.bing } } : {}),
  },
  // "./" resolves against metadataBase per route, so every page emits its own
  // canonical instead of none at all.
  alternates: { canonical: "./" },
  // Deliberately no openGraph.title / twitter.title here: hardcoding them meant
  // every guide and the pricing page shared the homepage's card, so sharing a
  // guide on WhatsApp — the SA sharing channel — showed the wrong headline.
  // Omitted, Next derives them from each page's own title.
  openGraph: {
    description: SEO_DESCRIPTION,
    // "./" like the canonical above: pinned to SITE_URL, every page's og:url
    // claimed to be the homepage, so a shared guide told scrapers its own URL
    // was a copy of / — and WhatsApp previews linked back to the wrong page.
    url: "./",
    siteName: APP_NAME,
    locale: "en_ZA",
    type: "website",
  },
  twitter: { card: "summary_large_image", description: SEO_DESCRIPTION },
  icons: {
    // SVG first so modern browsers take the crisp one. The .ico exists because
    // older crawlers and some social scrapers request /favicon.ico literally
    // and 404 on anything else — it wraps icon-192.png rather than being a
    // separate drawing, so there is nothing to keep in sync.
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "192x192" },
    ],
    apple: "/apple-icon.png", // iOS home-screen (needs a real PNG, not SVG)
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F5EC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1412" },
  ],
  width: "device-width",
  initialScale: 1,
  // Extends the page under the home indicator so the bottom nav can pad to
  // the real safe-area inset instead of sitting above a white bar.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      // en-ZA, matching og:locale and the schema's inLanguage: the content is
      // South African law in South African English, and a bare "en" gave
      // search engines nothing to geo-target with.
      lang="en-ZA"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${overpass.variable} ${mono.variable}`}
    >
      {/*
        StudyStoreProvider is deliberately NOT here. It is a client component
        that reaches the question bank through @/lib/plan, @/lib/engagement and
        @/lib/diagnostic/scoring, so mounting it at the root put ~645KB of
        questions — prompts, options, correct answers and explanations — into
        the shared layout chunk of every route. The marketing pages, the guides
        and the login form all shipped the entire product to anyone who asked.
        It now mounts per route tree, in the layouts that actually study.
      */}
      {/* iOS splash screens for the installed PWA. Without these Safari
          shows a bare white frame on launch; the assets are generated by
          scripts/gen-splash.mjs from the brand icon over each theme's
          background, and the media queries pair every device class with its
          colour scheme so dark mode doesn't flash white. Rendered in an
          explicit <head>: Safari reads startup images only from the document
          head, so React-hoisting quirks mustn't land these in <body>. */}
      <head>
        {[
          { w: 430, h: 932, dpr: 3, file: "1290x2796" },
          { w: 428, h: 926, dpr: 3, file: "1284x2778" },
          { w: 393, h: 852, dpr: 3, file: "1179x2556" },
          { w: 390, h: 844, dpr: 3, file: "1170x2532" },
        ].flatMap(({ w, h, dpr, file }) =>
          (["light", "dark"] as const).map((scheme) => (
            <link
              key={`${file}-${scheme}`}
              rel="apple-touch-startup-image"
              media={`(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (prefers-color-scheme: ${scheme})`}
              href={`/splash/${file}-${scheme}.png`}
            />
          )),
        )}
      </head>
      <body className="min-h-dvh font-sans">
        {/* Keyboard users faced the whole header — nav, streak, theme toggle —
            before reaching content on every page. Visible only once focused. */}
        <a
          href="#main-content"
          data-lenis-skip
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-soft-lg focus:outline-none focus:ring-4 focus:ring-ring/25"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <DataSaverInit />
          <ErrorReporter />
          <AnalyticsProvider />
          <SwRegister />
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
