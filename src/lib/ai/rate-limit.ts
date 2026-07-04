import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Server-side rate limiting for the AI tutor route.
 *
 * Two stacked windows keyed by client IP:
 *   - burst:  short window that stops scripted floods.
 *   - daily:  a generous per-IP ceiling that bounds total OpenAI/Anthropic spend.
 *
 * Uses Upstash Redis when configured (works across Vercel's ephemeral
 * instances). Falls back to an in-memory limiter when no Upstash env is set —
 * good enough for local dev / single-instance hosting, but NOT reliable on
 * serverless (memory resets per cold start and isn't shared between instances).
 */

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const BURST_LIMIT = Number(process.env.TUTOR_BURST_LIMIT ?? 8); // requests
const BURST_WINDOW_S = Number(process.env.TUTOR_BURST_WINDOW_S ?? 10); // seconds
const DAILY_LIMIT = Number(process.env.TUTOR_DAILY_IP_LIMIT ?? 40); // requests / day

const COACH_DAILY_LIMIT = Number(process.env.COACH_DAILY_IP_LIMIT ?? 80); // requests / day
const VISION_DAILY_LIMIT = Number(process.env.VISION_DAILY_IP_LIMIT ?? 20); // scans / day (priciest calls)

let burst: Ratelimit | null = null;
let daily: Ratelimit | null = null;
let checkout: Ratelimit | null = null;
let coachBurst: Ratelimit | null = null;
let coachDaily: Ratelimit | null = null;
let visionBurst: Ratelimit | null = null;
let visionDaily: Ratelimit | null = null;

if (hasUpstash) {
  const redis = Redis.fromEnv();
  burst = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(BURST_LIMIT, `${BURST_WINDOW_S} s`),
    prefix: "k53:tutor:burst",
    analytics: false,
  });
  daily = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(DAILY_LIMIT, "1 d"),
    prefix: "k53:tutor:day",
    analytics: false,
  });
  checkout = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "k53:checkout",
    analytics: false,
  });
  coachBurst = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(6, "10 s"),
    prefix: "k53:coach:burst",
    analytics: false,
  });
  coachDaily = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(COACH_DAILY_LIMIT, "1 d"),
    prefix: "k53:coach:day",
    analytics: false,
  });
  visionBurst = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(4, "60 s"),
    prefix: "k53:vision:burst",
    analytics: false,
  });
  visionDaily = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(VISION_DAILY_LIMIT, "1 d"),
    prefix: "k53:vision:day",
    analytics: false,
  });
}

// ── In-memory fallback ───────────────────────────────────────────────────────
interface Bucket {
  count: number;
  resetAt: number;
}
const memBuckets = new Map<string, Bucket>();

function memLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  const b = memBuckets.get(key);
  if (!b || now > b.resetAt) {
    memBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { success: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { success: true, retryAfter: 0 };
}

export interface LimitResult {
  success: boolean;
  /** Seconds the caller should wait before retrying (0 when allowed). */
  retryAfter: number;
}

/** Whether real (Redis-backed) limiting is active. Useful for diagnostics. */
export const rateLimitBackend: "upstash" | "memory" = hasUpstash ? "upstash" : "memory";

/** Best-effort client IP from proxy headers (set by the hosting platform). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "anon";
}

/** Modest per-IP limit for checkout-session creation (10/min). */
export async function limitCheckout(ip: string): Promise<LimitResult> {
  try {
    if (checkout) {
      const r = await checkout.limit(ip);
      return r.success
        ? { success: true, retryAfter: 0 }
        : { success: false, retryAfter: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
    }
    return memLimit(`checkout:${ip}`, 10, 60_000);
  } catch (err) {
    console.error("rate-limit error", err);
    return { success: true, retryAfter: 0 };
  }
}

/** Burst + daily limits for the coach route (recaps / plan rationale). */
export async function limitCoach(ip: string): Promise<LimitResult> {
  try {
    if (coachBurst && coachDaily) {
      const b = await coachBurst.limit(ip);
      if (!b.success) {
        return { success: false, retryAfter: Math.max(1, Math.ceil((b.reset - Date.now()) / 1000)) };
      }
      const d = await coachDaily.limit(ip);
      if (!d.success) {
        return { success: false, retryAfter: Math.max(1, Math.ceil((d.reset - Date.now()) / 1000)) };
      }
      return { success: true, retryAfter: 0 };
    }
    const b = memLimit(`coach:burst:${ip}`, 6, 10_000);
    if (!b.success) return b;
    return memLimit(`coach:day:${ip}`, COACH_DAILY_LIMIT, 86_400_000);
  } catch (err) {
    console.error("rate-limit error", err);
    return { success: true, retryAfter: 0 };
  }
}

/** Vision scans: 4/min burst, tight daily cap — these are the priciest calls. */
export async function limitVision(ip: string): Promise<LimitResult> {
  try {
    if (visionBurst && visionDaily) {
      const b = await visionBurst.limit(ip);
      if (!b.success) {
        return { success: false, retryAfter: Math.max(1, Math.ceil((b.reset - Date.now()) / 1000)) };
      }
      const d = await visionDaily.limit(ip);
      if (!d.success) {
        return { success: false, retryAfter: Math.max(1, Math.ceil((d.reset - Date.now()) / 1000)) };
      }
      return { success: true, retryAfter: 0 };
    }
    const b = memLimit(`vision:burst:${ip}`, 4, 60_000);
    if (!b.success) return b;
    return memLimit(`vision:day:${ip}`, VISION_DAILY_LIMIT, 86_400_000);
  } catch (err) {
    console.error("rate-limit error", err);
    return { success: true, retryAfter: 0 };
  }
}

/** Apply burst + daily limits for a client IP. Fails open on limiter errors. */
export async function limitTutor(ip: string): Promise<LimitResult> {
  try {
    if (burst && daily) {
      const b = await burst.limit(ip);
      if (!b.success) {
        return { success: false, retryAfter: Math.max(1, Math.ceil((b.reset - Date.now()) / 1000)) };
      }
      const d = await daily.limit(ip);
      if (!d.success) {
        return { success: false, retryAfter: Math.max(1, Math.ceil((d.reset - Date.now()) / 1000)) };
      }
      return { success: true, retryAfter: 0 };
    }

    // No Upstash configured — in-memory fallback.
    const b = memLimit(`burst:${ip}`, BURST_LIMIT, BURST_WINDOW_S * 1000);
    if (!b.success) return b;
    return memLimit(`day:${ip}`, DAILY_LIMIT, 86_400_000);
  } catch (err) {
    // Never let a limiter outage take down the tutor — fail open.
    console.error("rate-limit error", err);
    return { success: true, retryAfter: 0 };
  }
}
