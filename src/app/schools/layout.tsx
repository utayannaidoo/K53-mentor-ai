import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * The school workspace's outer layout.
 *
 * Signed-in check only — NOT a membership gate, because `/schools/start` and
 * `/schools/join/…` have to be reachable by someone who belongs to no school
 * yet. The membership gate lives one level down, in `(member)/layout.tsx`.
 *
 * Mounts no study store. Like `/admin`, this area sits outside the `(app)`
 * route group precisely so the question bank never loads here.
 */
export const metadata: Metadata = {
  title: { default: "School workspace", template: "%s · K53 Mentor for Schools" },
  robots: { index: false, follow: false },
};

export default async function SchoolsLayout({ children }: { children: React.ReactNode }) {
  // Demo mode has no auth at all; the pages below render a fixture instead.
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    // Middleware already bounces signed-out visitors, but it fails open on a
    // slow GoTrue and is skipped entirely in demo mode. Second layer, same as
    // the learner app's client-side guard in <AppShell>.
    if (!user) redirect("/login?next=/schools");
  }
  return <>{children}</>;
}
