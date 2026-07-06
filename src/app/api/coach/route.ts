import { z } from "zod";
import { completeCoachText } from "@/lib/ai/provider";
import { clientIp, limitCoach, limitUserDaily } from "@/lib/ai/rate-limit";
import { resolveEntitlement } from "@/lib/billing/entitlements.server";
import {
  localPlanRationale,
  localSecondOpinion,
  localSessionRecap,
  type PlanRationaleData,
  type SecondOpinionData,
  type SessionRecapData,
} from "@/lib/ai/coach";

export const runtime = "nodejs";

/**
 * Short, one-shot coach copy: the "why" line on today's plan and the recap
 * shown after every study session. Same auth/rate-limit posture as /api/tutor;
 * always answers (local template) even with no LLM provider configured.
 */

const rationaleSchema = z.object({
  firstName: z.string().max(40).optional(),
  weakestCategory: z.string().max(48).optional(),
  weakestPct: z.number().int().min(0).max(100).optional(),
  fromWorry: z.boolean().optional(),
  dueCards: z.number().int().min(0).max(5000).optional(),
  daysToTest: z.number().int().min(-365).max(730).nullable().optional(),
  streak: z.number().int().min(0).max(3650).optional(),
});

const recapSchema = z.object({
  mode: z.enum(["flashcards", "questions", "scenarios", "mock"]),
  correct: z.number().int().min(0).max(500).optional(),
  total: z.number().int().min(0).max(500).optional(),
  seconds: z.number().int().min(0).max(36_000).optional(),
  weakCategories: z.array(z.string().max(48)).max(3).optional(),
  againCount: z.number().int().min(0).max(500).optional(),
  passed: z.boolean().optional(),
  failedSections: z.array(z.string().max(48)).max(3).optional(),
  passProbabilityBefore: z.number().int().min(0).max(100).optional(),
  passProbabilityAfter: z.number().int().min(0).max(100).optional(),
  dueTomorrow: z.number().int().min(0).max(5000).optional(),
});

const secondOpinionSchema = z.object({
  prompt: z.string().min(1).max(600),
  correct: z.string().min(1).max(300),
  chosen: z.string().max(300).optional(),
  explanation: z.string().max(1000),
});

const bodySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("plan_rationale"), data: rationaleSchema }),
  z.object({ kind: z.literal("session_recap"), data: recapSchema }),
  z.object({ kind: z.literal("second_opinion"), data: secondOpinionSchema }),
]);

const COACH_PERSONA =
  "You are the coach voice of K53 Mentor AI, a South African K53 learner's licence study app. " +
  "Write in plain, warm, specific English for a learner driver. Use ONLY the numbers and facts provided — never invent statistics. " +
  "No greetings, no sign-offs, no emoji, no markdown.";

function rationalePrompt(d: PlanRationaleData): string {
  return (
    "Write exactly ONE sentence (under 30 words) explaining why today's study plan starts where it does, addressed directly to the learner. " +
    "Facts about the learner:\n" +
    JSON.stringify(d)
  );
}

function recapPrompt(d: SessionRecapData): string {
  return (
    "The learner just finished a study session. Write a 2–3 sentence recap: what the numbers show, what to focus on next, " +
    "and — if dueTomorrow or a pass-probability change is given — end with the specific reason to come back tomorrow. " +
    "Session facts:\n" +
    JSON.stringify(d)
  );
}

function secondOpinionPrompt(d: SecondOpinionData): string {
  return (
    "The learner answered this K53 question incorrectly, and the standard explanation didn't click for them. " +
    "Re-explain in 2–4 short sentences using a COMPLETELY DIFFERENT approach — an analogy, a memory hook, or a concrete " +
    "South African road situation. Do not reuse the original explanation's wording or structure. Never scold.\n" +
    JSON.stringify(d)
  );
}

export async function POST(req: Request) {
  // Auth + paid-tier entitlement (server truth; demo mode skips inside).
  const ent = await resolveEntitlement("coach");
  if (ent instanceof Response) return ent;

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const rl = await limitCoach(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }
  if (ent.userId) {
    const cap = await limitUserDaily("coach", ent.userId, ent.allowance);
    if (!cap.success) {
      return Response.json(
        { error: "daily_cap", tier: ent.tier, retryAfter: cap.retryAfter },
        { status: 429, headers: { "Retry-After": String(cap.retryAfter) } },
      );
    }
  }

  const local =
    parsed.kind === "plan_rationale"
      ? localPlanRationale(parsed.data)
      : parsed.kind === "session_recap"
        ? localSessionRecap(parsed.data)
        : localSecondOpinion(parsed.data);

  const user =
    parsed.kind === "plan_rationale"
      ? rationalePrompt(parsed.data)
      : parsed.kind === "session_recap"
        ? recapPrompt(parsed.data)
        : secondOpinionPrompt(parsed.data);

  const result = await completeCoachText({
    system: COACH_PERSONA,
    user,
    maxTokens: parsed.kind === "plan_rationale" ? 90 : parsed.kind === "session_recap" ? 180 : 220,
  });

  return Response.json(
    { text: result?.text ?? local, model: result?.model ?? "local" },
    { headers: { "cache-control": "no-store" } },
  );
}
