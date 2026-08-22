import { z } from "zod";
import { TUTOR_PERSONA, buildGroundingText, resolveContext } from "@/lib/ai/tutor-prompt";
import { localTutorReply } from "@/lib/ai/fallback";
import { retrieveRelated } from "@/lib/ai/retrieve";
import { chooseProvider, streamTutorReply } from "@/lib/ai/provider";
import { clientIp, limitTutor, limitUserDaily } from "@/lib/ai/rate-limit";
import {
  isWithinFreeTrial,
  resolveEntitlement,
  spendTutorCredit,
} from "@/lib/billing/entitlements.server";
import { recordAiUsage } from "@/lib/billing/usage.server";
import { hasFeature } from "@/lib/billing/plans";
import { IMAGE_BODY_MAX_BYTES, requestBodyTooLarge } from "@/lib/http/request-size";

export const runtime = "nodejs";
// Streaming replies can legitimately take tens of seconds; declare it rather
// than letting the platform default cut a slow provider off mid-sentence.
export const maxDuration = 60;

/** Keep the last N messages so token cost/latency don't grow with chat length. */
const MAX_TURNS = 10;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
  context: z
    .object({
      type: z.enum(["question", "card", "category", "none"]),
      id: z.string().optional(),
      /** Which option the learner picked, so the reply can address that trap. */
      chosenIndex: z.number().int().min(0).max(3).optional(),
    })
    .optional(),
  /**
   * Short, client-built, non-PII learner profile for personalisation. Raised
   * from 400 to 900 chars when the profile grew from one sentence to a handful
   * of facts (trend, pace, unresolved misses) — still a hint, not a dossier,
   * and still never trusted for anything security-sensitive.
   */
  profile: z.string().max(900).optional(),
  /** Photo attached to the latest user message (downscaled client-side). */
  image: z
    .object({
      data: z.string().min(100).max(5_600_000),
      mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
    })
    .optional(),
});

export async function POST(req: Request) {
  // ── Size backstop, before anything else ─────────────────────────────────────
  // One header read is cheaper than the limiter below it. Without this the
  // handler buffers and JSON-parses a body of arbitrary size before zod (or
  // the 5.6MB image cap) ever sees it.
  if (requestBodyTooLarge(req, IMAGE_BODY_MAX_BYTES)) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  // ── Per-IP abuse guard FIRST ───────────────────────────────────────────────
  // Before auth (two network round-trips) and before parsing a body that the
  // schema allows to reach ~5.6MB. Ordered after them, a flood still cost a
  // getUser(), a subscriptions lookup and a multi-megabyte JSON parse per
  // request — the limiter only ever declined work that had already been done.
  // clientIp() reads headers only, so this is safe as the first statement.
  const rl = await limitTutor(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // Auth + paid-tier entitlement (server truth; demo mode skips inside).
  const ent = await resolveEntitlement("tutor");
  if (ent instanceof Response) return ent;

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // Per-user plan allowance (the money guard behind the per-IP one above).
  if (ent.userId) {
    const cap = await limitUserDaily("tutor", ent.userId, ent.allowance);
    if (!cap.success) {
      // Premium Plus may spend a purchased top-up credit past the daily cap.
      const canTopUp = ent.tier === "premium_plus";
      const usedCredit = canTopUp && (await spendTutorCredit(ent.userId));
      if (!usedCredit) {
        // Count the refusal before returning. A rising `capped` is the only
        // signal that an allowance is too low — average usage alone would
        // never show a learner hitting a wall.
        await recordAiUsage({ surface: "tutor", userId: ent.userId, tier: ent.tier, capped: true });
        return Response.json(
          { error: "daily_cap", tier: ent.tier, canTopUp, retryAfter: cap.retryAfter },
          { status: 429, headers: { "Retry-After": String(cap.retryAfter) } },
        );
      }
    }
    await recordAiUsage({ surface: "tutor", userId: ent.userId, tier: ent.tier, capped: false });
  }

  const { messages, context, profile } = parsed;
  // Image (vision) input is a paid capability: /api/vision enforces a free
  // allowance of 0 and the scanner is a paid feature. Enforce the same gate
  // here so an attached photo can't buy free image analysis through the tutor
  // route. The composer hides the attach control for tiers without it; this is
  // the authoritative server-side backstop for a tampered client.
  const image = hasFeature(ent.tier, "scanner") ? parsed.image : undefined;
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // ── Grounding: anchored item + retrieved related facts + learner profile ───
  const resolved = resolveContext(context);
  const related = retrieveRelated(lastUser, context?.id);
  const grounding = buildGroundingText({
    context: resolved?.text ?? null,
    related,
    profile: profile ?? null,
  });
  // No offline vision exists — if a photo arrives with no image-capable
  // provider, be honest and coach the workaround instead of ignoring the image.
  // Asks for "image" specifically: DeepSeek answers text all day and still
  // cannot see, so a plain chooseProvider() here would promise a look it can't
  // take.
  const localReply =
    image && chooseProvider("image") === "local"
      ? "I can't look at photos right now — the AI provider is unavailable. Describe what you see (shape, colour, any symbols or words) and I'll identify it from that."
      : localTutorReply(lastUser, context);

  // ── History trimming (keep recent turns, ensure it starts with a user msg) ─
  let trimmed = messages.slice(-MAX_TURNS);
  while (trimmed.length && trimmed[0].role !== "user") trimmed = trimmed.slice(1);
  if (trimmed.length === 0) trimmed = [{ role: "user", content: lastUser }];

  // ── Which engine answers ───────────────────────────────────────────────────
  // The free tier IS the seven-day trial, so "free" splits into two different
  // people. Inside the week, the AI tutor is the single feature the learner is
  // deciding whether to pay for — answering with the rule-based explainer hides
  // the product from exactly the audience the week exists to convince, and the
  // 2/day cap already bounds it to roughly R0.59 per trialling signup. Once the
  // week lapses, the local explainer takes over, and the gap between the two is
  // the upgrade pitch. Only the free tier pays for the extra lookup.
  const forceLocal =
    ent.tier === "free" && !(ent.userId !== null && (await isWithinFreeTrial(ent.userId)));

  const { stream, model, provider } = await streamTutorReply({
    persona: TUTOR_PERSONA,
    grounding,
    messages: trimmed,
    userText: lastUser,
    localReply,
    image,
    forceLocal,
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-tutor-model": model,
      // Which tier of the cascade actually answered. The client reports this
      // on tutor_message_sent so a silent fall-through to `local` — an outage,
      // an empty balance, or an image sent while DeepSeek is the only provider
      // — is visible as a shift in the mix rather than as nothing at all.
      "x-tutor-provider": provider,
    },
  });
}
