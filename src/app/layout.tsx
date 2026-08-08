import type { Metadata, Viewport } from "next";
import { Inter, Overpass, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { DataSaverInit } from "@/components/shared/data-saver-init";
import { ErrorReporter } from "@/components/shared/error-reporter";
import { AnalyticsProvider } from "@/components/shared/analytics-provider";
import { SwRegister } from "@/components/shared/sw-register";
import { APP_DESCRIPTION, APP_NAME, SITE_URL } from "@/lib/constants";

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
    default: `${APP_NAME} — Pass your K53 licence faster`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "K53",
    "learner's licence",
    "driver's licence",
    "South Africa",
    "K53 test",
    "AI tutor",
    "driving test prep",
  ],
  // "./" resolves against metadataBase per route, so every page emits its own
  // canonical instead of none at all.
  alternates: { canonical: "./" },
  // Deliberately no openGraph.title / twitter.title here: hardcoding them meant
  // every guide and the pricing page shared the homepage's card, so sharing a
  // guide on WhatsApp — the SA sharing channel — showed the wrong headline.
  // Omitted, Next derives them from each page's own title.
  openGraph: {
    description: APP_DESCRIPTION,
    url: SITE_URL,
    siteName: APP_NAME,
    locale: "en_ZA",
    type: "website",
  },
  twitter: { card: "summary_large_image", description: APP_DESCRIPTION },
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
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
      <body className="min-h-dvh font-sans">
        {/* Keyboard users faced the whole header — nav, streak, theme toggle —
            before reaching content on every page. Visible only once focused. */}
        <a
          href="#main-content"
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
        </ThemeProvider>
      </body>
    </html>
  );
}
