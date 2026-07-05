import { z } from "zod";
import { TUTOR_PERSONA, buildGroundingText, resolveContext } from "@/lib/ai/tutor-prompt";
import { localTutorReply } from "@/lib/ai/fallback";
import { retrieveRelated } from "@/lib/ai/retrieve";
import { chooseProvider, streamTutorReply } from "@/lib/ai/provider";
import { clientIp, limitTutor, limitUserDaily } from "@/lib/ai/rate-limit";
import { resolveEntitlement } from "@/lib/billing/entitlements.server";

export const runtime = "nodejs";

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
    })
    .optional(),
  /** Short, client-built, non-PII learner profile for personalisation. */
  profile: z.string().max(400).optional(),
  /** Photo attached to the latest user message (downscaled client-side). */
  image: z
    .object({
      data: z.string().min(100).max(5_600_000),
      mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
    })
    .optional(),
});

export async function POST(req: Request) {
  // Auth + paid-tier entitlement (server truth; demo mode skips inside).
  const ent = await resolveEntitlement("tutor");
  if (ent instanceof Response) return ent;

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // ── Rate limiting: per-IP abuse guard, then the per-user plan allowance ────
  const rl = await limitTutor(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }
  if (ent.userId) {
    const cap = await limitUserDaily("tutor", ent.userId, ent.allowance);
    if (!cap.success) {
      return Response.json(
        { error: "daily_cap", tier: ent.tier, retryAfter: cap.retryAfter },
        { status: 429, headers: { "Retry-After": String(cap.retryAfter) } },
      );
    }
  }

  const { messages, context, profile, image } = parsed;
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // ── Grounding: anchored item + retrieved related facts + learner profile ───
  const resolved = resolveContext(context);
  const related = retrieveRelated(lastUser, context?.id);
  const grounding = buildGroundingText({
    context: resolved?.text ?? null,
    related,
    profile: profile ?? null,
  });
  // No offline vision exists — if a photo arrives with no provider, be honest
  // and coach the workaround instead of ignoring the image.
  const localReply =
    image && chooseProvider() === "local"
      ? "I can't look at photos right now — the AI provider is unavailable. Describe what you see (shape, colour, any symbols or words) and I'll identify it from that."
      : localTutorReply(lastUser, context);

  // ── History trimming (keep recent turns, ensure it starts with a user msg) ─
  let trimmed = messages.slice(-MAX_TURNS);
  while (trimmed.length && trimmed[0].role !== "user") trimmed = trimmed.slice(1);
  if (trimmed.length === 0) trimmed = [{ role: "user", content: lastUser }];

  const { stream, model } = await streamTutorReply({
    persona: TUTOR_PERSONA,
    grounding,
    messages: trimmed,
    userText: lastUser,
    localReply,
    image,
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-tutor-model": model,
    },
  });
}
