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

// Production deployments with paid AI calls must have a shared limiter: the
// in-memory fallback resets per cold start and isn't shared across serverless
// instances, so without Redis the spend caps are effectively absent. Fail the
// boot (not silently the caps) when this misconfiguration ships to hosting.
const aiConfigured = Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);
if (
  process.env.NODE_ENV === "production" &&
  process.env.VERCEL &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  aiConfigured &&
  !hasUpstash
) {
  throw new Error(
    "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN must be set in production when an AI provider is configured — the in-memory rate limiter cannot cap spend on serverless.",
  );
}

const BURST_LIMIT = Number(process.env.TUTOR_BURST_LIMIT ?? 8); // requests
const BURST_WINDOW_S = Number(process.env.TUTOR_BURST_WINDOW_S ?? 10); // seconds
const DAILY_LIMIT = Number(process.env.TUTOR_DAILY_IP_LIMIT ?? 40); // requests / day

const COACH_DAILY_LIMIT = Number(process.env.COACH_DAILY_IP_LIMIT ?? 80); // requests / day
const VISION_DAILY_LIMIT = Number(process.env.VISION_DAILY_IP_LIMIT ?? 20); // scans / day (priciest calls)

let redis: Redis | null = null;
let burst: Ratelimit | null = null;
let daily: Ratelimit | null = null;
let checkout: Ratelimit | null = null;
let coachBurst: Ratelimit | null = null;
let coachDaily: Ratelimit | null = null;
let visionBurst: Ratelimit | null = null;
let visionDaily: Ratelimit | null = null;

if (hasUpstash) {
  redis = Redis.fromEnv();
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
  // Buckets are keyed per IP/user/day and never expire on their own — sweep
  // stale ones occasionally so a long-lived instance doesn't grow forever.
  if (memBuckets.size > 10_000) {
    for (const [k, v] of memBuckets) {
      if (now > v.resetAt) memBuckets.delete(k);
    }
  }
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

/**
 * Client IP from proxy headers. `x-real-ip` is set by the hosting platform
 * (Vercel) and can't be forged by the caller. In `x-forwarded-for` only the
 * RIGHTMOST entry was appended by the trusted proxy — the leftmost values are
 * client-supplied and spoofable, so they must never key a rate limit.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return "anon";
}

/** Seconds until the daily fixed window (UTC midnight) resets. */
function secondsToUtcMidnight(): number {
  const now = new Date();
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((midnight - now.getTime()) / 1000));
}

/**
 * Per-user daily allowance for an AI surface — the server-enforced version of
 * the plan caps (see entitlements.server.ts). Keyed by user id so shared IPs
 * (campus Wi-Fi, mobile CGNAT) never eat a paying user's quota, and a
 * tampered client can't exceed its tier. `limit <= 0` means the tier doesn't
 * include the feature at all.
 */
export async function limitUserDaily(
  surface: string,
  userId: string,
  limit: number,
): Promise<LimitResult> {
  if (limit <= 0) return { success: false, retryAfter: 0 };
  const day = new Date().toISOString().slice(0, 10);
  const key = `k53:u:${surface}:${userId}:${day}`;
  try {
    if (redis) {
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, 90_000); // a day + slack; key is date-scoped anyway
      return n <= limit
        ? { success: true, retryAfter: 0 }
        : { success: false, retryAfter: secondsToUtcMidnight() };
    }
    return memLimit(key, limit, 86_400_000);
  } catch (err) {
    // Redis outage: degrade to the per-instance in-memory limiter — weaker
    // than shared state, but the caps stay bounded instead of vanishing.
    console.error("rate-limit error", err);
    return memLimit(key, limit, 86_400_000);
  }
}

/** Client error reports: tight per-IP cap so the log can't be flooded. */
export async function limitLog(ip: string): Promise<LimitResult> {
  return memLimit(`log:${ip}`, 10, 60_000);
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
    return memLimit(`checkout:${ip}`, 10, 60_000);
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
    const b = memLimit(`coach:burst:${ip}`, 6, 10_000);
    if (!b.success) return b;
    return memLimit(`coach:day:${ip}`, COACH_DAILY_LIMIT, 86_400_000);
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
    // Vision calls are the priciest in the app — if the limiter itself is
    // down we cannot know how much has been spent, so fail CLOSED.
    console.error("rate-limit error", err);
    return { success: false, retryAfter: 60 };
  }
}

/** Apply burst + daily limits for a client IP. Degrades to the in-memory limiter on limiter errors. */
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
    // Limiter outage: keep the tutor up, but degrade to per-instance caps
    // instead of dropping them entirely.
    console.error("rate-limit error", err);
    const b = memLimit(`burst:${ip}`, BURST_LIMIT, BURST_WINDOW_S * 1000);
    if (!b.success) return b;
    return memLimit(`day:${ip}`, DAILY_LIMIT, 86_400_000);
  }
}
