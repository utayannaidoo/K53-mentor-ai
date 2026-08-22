import { z } from "zod";
import { completeVisionText, chooseProvider } from "@/lib/ai/provider";
import { clientIp, limitVision, limitUserDaily, refundUserDaily } from "@/lib/ai/rate-limit";
import { resolveEntitlement } from "@/lib/billing/entitlements.server";
import { recordAiUsage } from "@/lib/billing/usage.server";
import { IMAGE_BODY_MAX_BYTES, requestBodyTooLarge } from "@/lib/http/request-size";

export const runtime = "nodejs";
// Vision models are slower than text; declare the ceiling explicitly.
export const maxDuration = 60;

/**
 * Road-sign scanner: identifies a photographed SA road sign and explains its
 * K53 meaning. The client downscales images before upload; the schema caps
 * payloads at ~4MB of base64 as a hard backstop.
 */

const bodySchema = z.object({
  image: z.object({
    data: z.string().min(100).max(5_600_000), // ~4MB binary as base64
    mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  }),
  /** Optional user hint, e.g. "the round one on the left". */
  hint: z.string().max(200).optional(),
});

const SCANNER_SYSTEM =
  "You are a South African road-sign expert for K53 learner drivers. Identify the road sign in the photo. " +
  "Respond with ONLY a JSON object, no markdown fences, with keys: " +
  '"isSign" (boolean — is a road sign clearly visible?), ' +
  '"name" (official SA name, short), ' +
  '"category" (one of: regulatory, warning, information, guidance, marking), ' +
  '"meaning" (1-2 plain sentences: what it tells road users), ' +
  '"k53" (1-2 sentences: what a K53 learner must DO when they see it), ' +
  '"confidence" ("high", "medium" or "low"). ' +
  "If no road sign is visible, set isSign to false and use name/meaning to say what you see instead. Never invent a sign.";

export interface ScanResult {
  isSign: boolean;
  name: string;
  category: string;
  meaning: string;
  k53: string;
  confidence: "high" | "medium" | "low";
}

function parseScan(text: string): ScanResult | null {
  try {
    // Tolerate accidental markdown fences around the JSON.
    const raw = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const j = JSON.parse(raw) as Partial<ScanResult>;
    if (typeof j.name !== "string" || typeof j.meaning !== "string") return null;
    return {
      isSign: Boolean(j.isSign),
      name: j.name,
      category: typeof j.category === "string" ? j.category : "unknown",
      meaning: j.meaning,
      k53: typeof j.k53 === "string" ? j.k53 : "",
      confidence: j.confidence === "high" || j.confidence === "low" ? j.confidence : "medium",
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // ── Size backstop, before anything else ─────────────────────────────────────
  // These carry the biggest bodies in the app (~4MB of base64); refuse an
  // oversized declared body before the limiter round-trip or any buffering.
  if (requestBodyTooLarge(req, IMAGE_BODY_MAX_BYTES)) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  // Per-IP guard first. These are the priciest calls in the app AND carry the
  // biggest bodies (~4MB of base64), so every cheaper check belongs behind it:
  // ordered last, a flood forced an auth round-trip, a subscriptions lookup and
  // a multi-megabyte JSON parse per request before it could be turned away.
  // limitVision fails CLOSED on limiter outage, which is the intended posture
  // here — if we cannot account for spend, we do not spend.
  const rl = await limitVision(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // Auth + paid-tier entitlement. Vision is a paid feature: the free tier's
  // allowance is 0, so an untampered client never reaches here on free — and
  // a tampered one gets 403 regardless of what its localStorage claims.
  const ent = await resolveEntitlement("vision");
  if (ent instanceof Response) return ent;
  if (ent.userId && ent.allowance <= 0) {
    return Response.json({ error: "upgrade_required", tier: ent.tier }, { status: 403 });
  }

  // No offline vision exists — tell the client honestly before burning a scan.
  // "image" skips the text-only providers in the cascade (DeepSeek), so a
  // deployment with only those configured reports unavailable instead of
  // failing mid-scan.
  if (chooseProvider("image") === "local") {
    return Response.json({ unavailable: true });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (ent.userId) {
    const cap = await limitUserDaily("vision", ent.userId, ent.allowance);
    if (!cap.success) {
      await recordAiUsage({ surface: "vision", userId: ent.userId, tier: ent.tier, capped: true });
      return Response.json(
        { error: "daily_cap", tier: ent.tier, retryAfter: cap.retryAfter },
        { status: 429, headers: { "Retry-After": String(cap.retryAfter) } },
      );
    }
    await recordAiUsage({ surface: "vision", userId: ent.userId, tier: ent.tier, capped: false });
  }

  const userText = parsed.hint
    ? `Identify this road sign. Hint from the learner: ${parsed.hint}`
    : "Identify this road sign.";

  const res = await completeVisionText({
    system: SCANNER_SYSTEM,
    userText,
    image: parsed.image,
    maxTokens: 350,
  });
  if (!res) {
    // The scan was metered up-front (it must gate concurrency), so a dead
    // provider call otherwise costs a paid scan without serving anything.
    // Refund the allowance — an outage shouldn't tax the learner's quota.
    if (ent.userId) await refundUserDaily("vision", ent.userId);
    return Response.json({ error: "Vision call failed" }, { status: 502 });
  }

  return Response.json(
    { result: parseScan(res.text), text: res.text, model: res.model },
    { headers: { "cache-control": "no-store" } },
  );
}
