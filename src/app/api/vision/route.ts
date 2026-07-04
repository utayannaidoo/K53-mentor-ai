import { z } from "zod";
import { completeVisionText, chooseProvider } from "@/lib/ai/provider";
import { clientIp, limitVision } from "@/lib/ai/rate-limit";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // No offline vision exists — tell the client honestly before burning a scan.
  if (chooseProvider() === "local") {
    return Response.json({ unavailable: true });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const rl = await limitVision(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
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
    return Response.json({ error: "Vision call failed" }, { status: 502 });
  }

  return Response.json(
    { result: parseScan(res.text), text: res.text, model: res.model },
    { headers: { "cache-control": "no-store" } },
  );
}
