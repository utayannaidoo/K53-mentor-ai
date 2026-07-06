import { z } from "zod";
import { clientIp, limitLog } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

/**
 * Client-side error sink. Reports land in the server log (visible in the
 * hosting platform's function logs) as one structured line each — enough to
 * know production is breaking without a third-party APM. Swap the
 * console.error for a Sentry/PostHog call later without touching clients.
 */

const schema = z.object({
  message: z.string().min(1).max(500),
  stack: z.string().max(4000).optional(),
  url: z.string().max(300).optional(),
  source: z.enum(["window", "promise", "boundary"]).optional(),
});

export async function POST(req: Request) {
  const rl = await limitLog(clientIp(req));
  if (!rl.success) return new Response(null, { status: 429 });

  let parsed;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return new Response(null, { status: 400 });
  }

  console.error(
    "[client-error]",
    JSON.stringify({
      message: parsed.message,
      url: parsed.url,
      source: parsed.source ?? "window",
      stack: parsed.stack?.slice(0, 1500),
      at: new Date().toISOString(),
    }),
  );

  return new Response(null, { status: 204 });
}
