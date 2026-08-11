import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify a Resend webhook signature.
 *
 * Resend signs with Svix, so the scheme is Svix's rather than Resend's own:
 *
 *   - three headers: `svix-id`, `svix-timestamp`, `svix-signature`
 *   - the signed content is `${id}.${timestamp}.${rawBody}`
 *   - HMAC-SHA256, keyed on the **base64-decoded** part of the signing secret
 *     after its `whsec_` prefix — not the literal secret string
 *   - `svix-signature` holds one or more space-separated `v1,<base64>` tokens,
 *     because a secret rotation makes both the old and new signature valid for
 *     a window. Any match is a pass.
 *
 * Implemented here rather than pulled in as the `svix` package: it is thirty
 * lines of HMAC, and the project's other webhook (Paystack) already verifies
 * its own signature the same way. A dependency for this would be the only
 * reason it existed.
 *
 * Two things that silently break this:
 *   - Parsing the body as JSON and re-stringifying it before verifying. The
 *     signature covers the exact bytes; key order and whitespace both matter.
 *     The route reads `req.text()` first for that reason.
 *   - Forgetting to base64-decode the secret, which produces a well-formed
 *     signature that never matches.
 */

/** Reject deliveries older than this. Svix's own tolerance is five minutes. */
const TOLERANCE_S = 300;

export function verifyResendSignature(args: {
  rawBody: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  secret: string;
  now?: number;
}): boolean {
  const { rawBody, svixId, svixTimestamp, svixSignature, secret } = args;
  if (!svixId || !svixTimestamp || !svixSignature || !secret) return false;

  // Replay window. A signature stays valid forever without this, so a captured
  // delivery could be replayed indefinitely.
  const ts = Number(svixTimestamp);
  if (!Number.isFinite(ts)) return false;
  const nowS = Math.floor((args.now ?? Date.now()) / 1000);
  if (Math.abs(nowS - ts) > TOLERANCE_S) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  if (key.length === 0) return false;

  const expected = createHmac("sha256", key)
    .update(`${svixId}.${svixTimestamp}.${rawBody}`)
    .digest("base64");
  const expectedBuf = Buffer.from(expected);

  // Multiple signatures are normal during a secret rotation; any one matching
  // is a pass.
  for (const token of svixSignature.split(" ")) {
    const [version, value] = token.split(",");
    if (version !== "v1" || !value) continue;
    const candidate = Buffer.from(value);
    if (candidate.length === expectedBuf.length && timingSafeEqual(candidate, expectedBuf)) {
      return true;
    }
  }
  return false;
}
