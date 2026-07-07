import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

/** CP each side receives — mirror of the value in supabase/migrations/0009. */
const REFERRAL_CP = 250;

async function requireUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  return user;
}

/** GET → the caller's referral code + how many friends have joined through it. */
export async function GET() {
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 501 });

  const [{ data: profile }, { count }] = await Promise.all([
    admin.from("profiles").select("referral_code").eq("id", user.id).maybeSingle(),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", user.id),
  ]);
  const code = (profile as { referral_code: string | null } | null)?.referral_code;
  if (!code) return Response.json({ error: "No code yet" }, { status: 404 });
  return Response.json({ code, referrals: count ?? 0, reward: REFERRAL_CP });
}

const claimSchema = z.object({ code: z.string().min(4).max(16) });

/** POST { code } → claim a referral for the signed-in user (once, ever). */
export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }
  const user = await requireUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let code: string;
  try {
    code = claimSchema.parse(await req.json()).code;
  } catch {
    return Response.json({ error: "Invalid code" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "Not configured" }, { status: 501 });

  const { data, error } = await admin.rpc("claim_referral", {
    p_referee: user.id,
    p_code: code,
  });
  if (error) {
    console.error("referral claim failed", error.message);
    return Response.json({ error: "Claim failed" }, { status: 500 });
  }
  return Response.json({ ok: data === true, reward: data === true ? REFERRAL_CP : 0 });
}
