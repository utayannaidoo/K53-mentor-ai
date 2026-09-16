import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";
import { isEmailConfigured, sendEmail } from "@/lib/notify/email";
import { buildPartnerApplicationEmail } from "@/lib/notify/templates";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const runtime = "nodejs";

/**
 * A driving school asking to join, from /for-driving-schools.
 *
 * Creates a `pending` school and nothing else: no code is issued, so nothing
 * here can attribute a learner or earn a cent until a human activates it in
 * /admin. That is the whole security model for a public, unauthenticated form
 * that writes to a table money is calculated from.
 *
 * No bank details are collected. They are asked for after a conversation, and
 * a public form is the wrong place to put them.
 */
const schema = z.object({
  name: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email().max(200),
  contactPhone: z.string().trim().max(40).optional(),
  town: z.string().trim().max(80).optional(),
  province: z.string().trim().max(80).optional(),
  learnersPerMonth: z.string().trim().max(40).optional(),
});

export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }
  if (!isSupabaseConfigured) {
    return Response.json({ error: "Applications are not open in this demo." }, { status: 501 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "Applications are not open yet." }, { status: 501 });

  const { name, contactName, contactEmail, contactPhone, town, province, learnersPerMonth } =
    parsed.data;

  // A school applying twice is a school that was keen, not a duplicate to
  // reject noisily — but a second pending row would be confusing in /admin.
  const { data: existing } = await admin
    .from("partner_schools")
    .select("id,status")
    .ilike("contact_email", contactEmail)
    .maybeSingle();
  if (existing) {
    return Response.json({
      ok: true,
      message: "You're already on the list — we'll be in touch shortly.",
    });
  }

  const { error } = await admin.from("partner_schools").insert({
    name,
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone || null,
    town: town || null,
    province: province || null,
    notes: learnersPerMonth ? `Applied via the website. Learners/month: ${learnersPerMonth}` : "Applied via the website.",
    status: "pending",
  });
  if (error) {
    console.error("[partners] application failed", error.message);
    return Response.json({ error: "We couldn't submit that. Please try again." }, { status: 500 });
  }

  if (isEmailConfigured) {
    const alert = buildPartnerApplicationEmail({
      name,
      contactName,
      contactEmail,
      contactPhone: contactPhone ?? null,
      town: town ?? null,
      learnersPerMonth: learnersPerMonth ?? null,
    });
    await sendEmail({ to: SUPPORT_EMAIL, ...alert }).catch(() => {});
  }

  return Response.json({
    ok: true,
    message: "Thanks — we'll email you your code and link within a day or two.",
  });
}
