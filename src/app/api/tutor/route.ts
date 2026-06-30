import { z } from "zod";
import { TUTOR_PERSONA, buildGroundingText, resolveContext } from "@/lib/ai/tutor-prompt";
import { localTutorReply } from "@/lib/ai/fallback";
import { retrieveRelated } from "@/lib/ai/retrieve";
import { streamTutorReply } from "@/lib/ai/provider";
import { limitTutor } from "@/lib/ai/rate-limit";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

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
});

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "anon";
}

export async function POST(req: Request) {
  // Require a signed-in user (prod only; demo runs without a backend).
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // ── Rate limiting (abuse / cost guard) ─────────────────────────────────────
  const rl = await limitTutor(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const { messages, context, profile } = parsed;
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // ── Grounding: anchored item + retrieved related facts + learner profile ───
  const resolved = resolveContext(context);
  const related = retrieveRelated(lastUser, context?.id);
  const grounding = buildGroundingText({
    context: resolved?.text ?? null,
    related,
    profile: profile ?? null,
  });
  const localReply = localTutorReply(lastUser, context);

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
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-tutor-model": model,
    },
  });
}
