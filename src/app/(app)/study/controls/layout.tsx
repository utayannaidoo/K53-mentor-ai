import type { Metadata } from "next";

// Client pages can't export metadata, so this server wrapper owns the
// browser-tab title. The study section layout above already renders AppShell,
// so this passes children through untouched.
export const metadata: Metadata = { title: "Vehicle controls" };

export default function ControlsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
