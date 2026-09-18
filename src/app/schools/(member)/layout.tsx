import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { currentSchool } from "@/lib/schools/auth";
import { DEMO_SCHOOL } from "@/lib/schools/demo";
import { SchoolShell } from "@/components/schools/school-shell";

/**
 * The membership gate.
 *
 * A signed-in stranger is redirected to `/schools/start`, not 404'd. `/admin`
 * returns `notFound()` because a learner should never learn it exists; this is
 * a product we are selling, so the right answer to "you have no school" is the
 * offer to make one.
 *
 * `force-dynamic` because the diary is live — the same reason `/admin` sets it.
 */
export const dynamic = "force-dynamic";

export default async function SchoolMemberLayout({ children }: { children: React.ReactNode }) {
  const school = isSupabaseConfigured ? await currentSchool() : DEMO_SCHOOL;
  if (!school) redirect("/schools/start");
  return <SchoolShell school={school}>{children}</SchoolShell>;
}
