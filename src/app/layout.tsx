import type { Metadata, Viewport } from "next";
import { Inter, Overpass, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { StudyStoreProvider } from "@/hooks/use-study-store";
import { DataSaverInit } from "@/components/shared/data-saver-init";
import { ErrorReporter } from "@/components/shared/error-reporter";
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
  openGraph: {
    title: `${APP_NAME} — Pass your K53 licence faster`,
    description: APP_DESCRIPTION,
    url: SITE_URL,
    siteName: APP_NAME,
    locale: "en_ZA",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: APP_NAME, description: APP_DESCRIPTION },
  icons: { icon: "/favicon.svg" },
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
      <body className="min-h-dvh font-sans">
        <ThemeProvider>
          <StudyStoreProvider>
            <DataSaverInit />
            <ErrorReporter />
            {children}
          </StudyStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
