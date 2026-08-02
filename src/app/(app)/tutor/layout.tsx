import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";

// Every app page is a client component, so none of them can export metadata and
// all of them inherited the marketing homepage title. Learners keep several tabs
// open; "K53 Mentor AI — Pass your K53 licence faster" five times over is not
// navigable. Section titles live here; pages may still override.
export const metadata: Metadata = { title: "AI tutor" };

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
