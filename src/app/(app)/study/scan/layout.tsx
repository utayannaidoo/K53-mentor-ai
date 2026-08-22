import type { Metadata } from "next";

// Client pages can't export metadata, so this server wrapper owns the
// browser-tab title. The study section layout above already renders AppShell,
// so this passes children through untouched.
export const metadata: Metadata = { title: "Sign scanner" };

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
