import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Shared cron authorisation. Vercel sends `Authorization: Bearer $CRON_SECRET`
 * automatically when the env var is set; without the check these routes are
 * open endpoints that anyone can drive.
 *
 * Fails closed when `CRON_SECRET` is unset — an unconfigured secret must mean
 * "nobody may call this", not "everybody may".
 */

/** Constant-time compare — a plain !== leaks length and prefix via timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return safeEqual(req.headers.get("authorization") ?? "", `Bearer ${secret}`);
}
