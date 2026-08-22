import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Server-side rate limiting for the AI tutor route.
 *
 * Two stacked windows keyed by client IP:
 *   - burst:  short window that stops scripted floods.
 *   - daily:  a generous per-IP ceiling that bounds total AI-provider spend.
 *
 * Uses Upstash Redis when configured (works across Vercel's ephemeral
 * instances). Falls back to an in-memory limiter when no Upstash env is set —
 * good enough for local dev / single-instance hosting, but NOT reliable on
 * serverless (memory resets per cold start and isn't shared between instances).
 */

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

/** Whether this deploy can spend money on a model at all. */
const aiConfigured = Boolean(
  process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
);
export interface LimitResult {
  success: boolean;
  /** Seconds the caller should wait before retrying (0 when allowed). */
  retryAfter: number;
}

/**
 * A hosted deploy that has an AI provider but no Redis cannot cap spend: the
 * in-memory fallback resets on every cold start and is not shared between
 * serverless instances.
 */
const capsUnenforceable =
  process.env.NODE_ENV === "production" &&
  Boolean(process.env.VERCEL) &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  aiConfigured &&
  !hasUpstash;

// Production must not ship in that state at all.
//
// Scoped to the production deployment, not every hosted one. Previews match
// `NODE_ENV=production && VERCEL` too, and this throw runs at module scope — so
// on a Preview scope carrying an AI key but no Upstash (which is exactly how
// this project is configured) every AI route answered an opaque 500 instead of
// a reason. Previews are handled below by refusing to serve AI rather than by
// refusing to boot: same protection for the money, without taking the
// deployment down to get it.
if (capsUnenforceable && process.env.VERCEL_ENV === "production") {
  throw new Error(
    "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN must be set in production when an AI provider is configured — the in-memory rate limiter cannot cap spend on serverless.",
  );
}

/** Uncappable spend is refused outright — see `capsUnenforceable`. */
const UNCAPPED: LimitResult = { success: false, retryAfter: 0 };

const BURST_LIMIT = Number(process.env.TUTOR_BURST_LIMIT ?? 8); // requests
const BURST_WINDOW_S = Number(process.env.TUTOR_BURST_WINDOW_S ?? 10); // seconds
const DAILY_LIMIT = Number(process.env.TUTOR_DAILY_IP_LIMIT ?? 40); // requests / day

const COACH_DAILY_LIMIT = Number(process.env.COACH_DAILY_IP_LIMIT ?? 80); // requests / day
const VISION_DAILY_LIMIT = Number(process.env.VISION_DAILY_IP_LIMIT ?? 20); // scans / day (priciest calls)
const CONTENT_HOURLY_LIMIT = Number(process.env.CONTENT_HOURLY_IP_LIMIT ?? 6); // pack syncs / hour
// Email triggers: each request makes GoTrue send a real email, so the caps are
// tight — this is an anti-email-bombing bound, not a UX allowance.
const AUTH_RESET_DAILY_LIMIT = Number(process.env.AUTH_RESET_DAILY_IP_LIMIT ?? 10); // reset emails / IP / day
const AUTH_RESEND_DAILY_LIMIT = Number(process.env.AUTH_RESEND_DAILY_IP_LIMIT ?? 6); // confirmation emails / IP / day

let redis: Redis | null = null;
let burst: Ratelimit | null = null;
let daily: Ratelimit | null = null;
let checkout: Ratelimit | null = null;
let coachBurst: Ratelimit | null = null;
let coachDaily: Ratelimit | null = null;
let visionBurst: Ratelimit | null = null;
let visionDaily: Ratelimit | null = null;
let content: Ratelimit | null = null;
let logLimiter: Ratelimit | null = null;
let authReset: Ratelimit | null = null;
let authResend: Ratelimit | null = null;

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
  content = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(CONTENT_HOURLY_LIMIT, "1 h"),
    prefix: "k53:content",
    analytics: false,
  });
  logLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(10, "60 s"),
    prefix: "k53:log",
    analytics: false,
  });
  authReset = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(AUTH_RESET_DAILY_LIMIT, "1 d"),
    prefix: "k53:auth:reset",
    analytics: false,
  });
  authResend = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(AUTH_RESEND_DAILY_LIMIT, "1 d"),
    prefix: "k53:auth:resend",
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

/**
 * Give back ONE unit of a per-user daily allowance after the fact.
 *
 * Vision meters the scan before the provider call (the cap must gate
 * concurrency, not trail it), so a call whose provider died still burned a
 * paid scan without serving anything. This refunds it. The counter is floored
 * at zero — a refund can never mint allowance that wasn't spent.
 */
export async function refundUserDaily(surface: string, userId: string): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  const key = `k53:u:${surface}:${userId}:${day}`;
  try {
    if (redis) {
      const n = await redis.decr(key);
      if (n < 0) await redis.incr(key); // restore to zero, never below
      return;
    }
    const b = memBuckets.get(key);
    if (b && b.count > 0) b.count -= 1;
  } catch (err) {
    // Best-effort by definition — a failed refund just leaves the burn.
    console.error("rate-limit refund error", err);
  }
}

/**
 * Per-user daily caps for the account-management actions.
 *
 * These routes shared exactly one bucket — `limitCheckout`, keyed on IP — and
 * that is the wrong axis for them. Cancelling, deleting and claiming a referral
 * are per-account actions, and South African mobile traffic is heavily CGNAT'd:
 * one person hammering the endpoint from a campus or mobile network took the
 * whole IP's budget, so a stranger could stop somebody else from cancelling
 * their own subscription or deleting their own account. The IP limit stays as
 * the outer abuse guard; these are the per-account ones underneath it.
 *
 * Deliberately generous. Nobody legitimately cancels five times in a day, but
 * this cap must never be the reason a person cannot stop being billed — that
 * failure is worse than the abuse it prevents.
 */
export const ACCOUNT_DAILY_LIMIT = {
  /** Self-serve cancellation (and the auto-refund it can trigger). */
  cancel: 5,
  /** Irreversible account deletion. */
  delete: 5,
  /** Server-side progress reset — destructive, but not deletion-level. */
  reset: 3,
  /** Deletion-code emails. Doubles as the anti-email-bombing cap. */
  deletion_code: 5,
  /** Referral claims. The GET stays IP-limited only — it is a cheap read the
   *  dashboard makes on load, and a per-user cap there would break heavy use. */
  referral_claim: 20,
} as const;

/**
 * Client error reports: tight per-IP cap so the log can't be flooded.
 *
 * Shared (Redis-backed) like every other limiter when Upstash is configured:
 * a per-instance counter on serverless multiplies by instance count, so the
 * effective cap was "10/min × N cold starts" — enough to flood platform logs
 * (which are billed per GB ingested) from one IP. The memory fallback stays
 * for local dev and single-instance hosts, where it genuinely is shared state.
 */
export async function limitLog(ip: string): Promise<LimitResult> {
  try {
    if (logLimiter) {
      const r = await logLimiter.limit(ip);
      return r.success
        ? { success: true, retryAfter: 0 }
        : { success: false, retryAfter: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
    }
  } catch (err) {
    console.error("rate-limit error", err);
  }
  return memLimit(`log:${ip}`, 10, 60_000);
}

/**
 * Content-pack downloads.
 *
 * A real device syncs once and then serves from its cache, re-syncing only when
 * CONTENT_VERSION moves — a handful of times a month. Anything hitting this
 * repeatedly is scraping the bank, so the cap can be tight without ever
 * touching a legitimate learner. 6/hour leaves room for a flaky connection
 * retrying, a second device, and a content release landing mid-session.
 *
 * Redis-backed like the other paid surfaces, not memLimit: the whole point of
 * this endpoint is that it guards the product, and a per-instance counter that
 * resets on cold start is not a guard on serverless. The in-memory path stays
 * only as the local-dev fallback.
 */
export async function limitContent(ip: string): Promise<LimitResult> {
  try {
    if (content) {
      const r = await content.limit(ip);
      return r.success
        ? { success: true, retryAfter: 0 }
        : { success: false, retryAfter: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
    }
    return memLimit(`content:${ip}`, CONTENT_HOURLY_LIMIT, 3_600_000);
  } catch (err) {
    console.error("rate-limit error", err);
    return memLimit(`content:${ip}`, CONTENT_HOURLY_LIMIT, 3_600_000);
  }
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

/**
 * Password-reset emails (/api/auth/request-reset): tight per-IP daily cap.
 *
 * The reset page used to call GoTrue directly from the browser, where the only
 * bound on how many reset emails one IP could trigger was GoTrue's own limiter
 * — so a script could email-bomb any inbox all day. Proxying through the API
 * with this cap makes the bound ours. Deliberately fail-open to the in-memory
 * fallback on a Redis outage (like checkout, unlike vision): nobody spends
 * money here, and locking people out of resetting their own password because
 * a limiter hiccupped is worse than the abuse it invites for a few minutes.
 */
export async function limitAuthReset(ip: string): Promise<LimitResult> {
  try {
    if (authReset) {
      const r = await authReset.limit(ip);
      return r.success
        ? { success: true, retryAfter: 0 }
        : { success: false, retryAfter: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
    }
    return memLimit(`auth:reset:${ip}`, AUTH_RESET_DAILY_LIMIT, 86_400_000);
  } catch (err) {
    console.error("rate-limit error", err);
    return memLimit(`auth:reset:${ip}`, AUTH_RESET_DAILY_LIMIT, 86_400_000);
  }
}

/**
 * Confirmation-resend emails (/api/auth/resend-confirmation): same posture as
 * `limitAuthReset`, slightly tighter — resends are rarer legitimate traffic
 * (one lost email, maybe two) and an equally attractive bombing vector.
 */
export async function limitAuthResend(ip: string): Promise<LimitResult> {
  try {
    if (authResend) {
      const r = await authResend.limit(ip);
      return r.success
        ? { success: true, retryAfter: 0 }
        : { success: false, retryAfter: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
    }
    return memLimit(`auth:resend:${ip}`, AUTH_RESEND_DAILY_LIMIT, 86_400_000);
  } catch (err) {
    console.error("rate-limit error", err);
    return memLimit(`auth:resend:${ip}`, AUTH_RESEND_DAILY_LIMIT, 86_400_000);
  }
}

/** Burst + daily limits for the coach route (recaps / plan rationale). */
export async function limitCoach(ip: string): Promise<LimitResult> {
  if (capsUnenforceable) return UNCAPPED;
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
  if (capsUnenforceable) return UNCAPPED;
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
  if (capsUnenforceable) return UNCAPPED;
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
