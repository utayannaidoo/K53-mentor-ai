/**
 * Request-size backstop for route handlers that parse JSON bodies.
 *
 * Next.js route handlers buffer the whole body before anything app-level runs,
 * and zod validation only happens AFTER `req.json()` has parsed it — so a
 * schema that caps a field at ~5.6MB still forces the server to receive,
 * buffer and fully parse an arbitrarily large body first. The platform's own
 * limits are the only backstop, and they differ by host.
 *
 * This is a cheap pre-parse check on Content-Length. It is not a complete
 * defence — chunked requests can omit the header, so zod remains the authority
 * on field sizes — but it turns the common flood (a plain large body) into a
 * 413 before a byte of JSON parsing happens, ordered before auth and rate
 * limiting because reading one header costs less than either.
 *
 * Returns true when the declared body exceeds `maxBytes`; no header at all
 * returns false (the body may legitimately arrive chunked).
 */
export function requestBodyTooLarge(req: Request, maxBytes: number): boolean {
  const raw = req.headers.get("content-length");
  if (!raw) return false;
  const len = Number(raw);
  return Number.isFinite(len) && len > maxBytes;
}

/**
 * Cap for routes that accept a base64 image (~4MB binary → 5.6MB base64),
 * plus headroom for the JSON envelope and message history around it.
 */
export const IMAGE_BODY_MAX_BYTES = 6_000_000;

/** Cap for small JSON bodies (coach copy requests). */
export const SMALL_BODY_MAX_BYTES = 100_000;
