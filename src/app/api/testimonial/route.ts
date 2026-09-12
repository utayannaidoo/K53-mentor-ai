import { SUPPORT_EMAIL } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { clientIp, limitCheckout, limitUserDaily } from "@/lib/ai/rate-limit";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildTestimonialEmail } from "@/lib/notify/templates";
import { testimonialSchema } from "@/lib/testimonial";

export const runtime = "nodejs";

/** Two a day per account: nobody passes their licence twice in a morning. */
const TESTIMONIALS_PER_DAY = 2;

/**
 * POST a learner's testimonial, captured on the "I passed" screen.
 *
 * Signed-in only — an open endpoint that emails us is a spam relay — and
 * rate limited per IP and per account. The quote goes to SUPPORT_EMAIL for a
 * human to read; nothing is published automatically.
 */
export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!isSupabaseConfigured) return Response.json({ error: "Not configured" }, { status: 501 });
  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = testimonialSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid testimonial" }, { status: 400 });

  if (!isEmailConfigured) {
    // Say so rather than thanking someone for words that went nowhere.
    console.error("testimonial received but email is not configured");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  // Metered last, on a request that is actually going to send something. Two a
  // day is a tight allowance, and spending it on a malformed body or on an
  // unconfigured mail provider would lock a learner out of the ask for the day
  // over something that was never their doing.
  const userRl = await limitUserDaily("testimonial", user.id, TESTIMONIALS_PER_DAY);
  if (!userRl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: userRl.retryAfter },
      { status: 429, headers: { "Retry-After": String(userRl.retryAfter) } },
    );
  }

  const mail = buildTestimonialEmail({
    quote: parsed.data.quote,
    displayName: parsed.data.displayName,
    kind: parsed.data.kind,
    userId: user.id,
    email: user.email ?? null,
  });
  const ok = await sendEmail({ to: SUPPORT_EMAIL, ...mail });
  if (!ok) return Response.json({ error: "unavailable" }, { status: 503 });
  return Response.json({ ok: true });
}
