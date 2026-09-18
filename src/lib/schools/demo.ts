import type { SchoolContext } from "@/lib/schools/auth";

/**
 * What `/schools` renders with no Supabase configured.
 *
 * CLAUDE.md rule 1: both modes must always work. The demo cannot persist
 * anything — there is no database and no session — so it shows a furnished
 * workspace and refuses every write with a sentence rather than an error.
 * Without this the whole product area would be a crash in demo mode.
 */
export const DEMO_SCHOOL: SchoolContext = {
  schoolId: "demo-school",
  memberId: "demo-member",
  name: "Demo Driving School",
  slug: "demo-driving-school",
  role: "owner",
  access: "full",
  plan: "trial",
  status: "trialing",
  seats: 15,
  trialEndsAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
  partnerSchoolId: null,
  seatsUsed: 1,
};
