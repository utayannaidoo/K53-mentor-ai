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

/**
 * Result of readJsonCapped — either the parsed body or a machine-readable
 * refusal the route maps straight onto its existing 413/400 responses.
 */
export type CappedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: "too_large" | "invalid_json" };

/**
 * Parse the request body as JSON with a hard cap on the bytes actually
 * received. requestBodyTooLarge above only sees declared sizes: a chunked
 * request omits Content-Length entirely, so plain `await req.json()` still
 * buffers an arbitrarily large body into memory before zod ever runs — the
 * schema rejects it, but only after the server has paid to receive it. This
 * closes that gap by capping the stream itself: the moment cumulative bytes
 * pass `maxBytes`, the stream is cancelled and `too_large` returned without
 * buffering another chunk.
 */
export async function readJsonCapped(req: Request, maxBytes: number): Promise<CappedJsonResult> {
  // Fast path: reuse the header backstop so an oversized declared body never
  // touches the stream at all.
  if (requestBodyTooLarge(req, maxBytes)) {
    return { ok: false, reason: "too_large" };
  }

  // A bodyless request has nothing to parse — same outcome as malformed JSON.
  if (!req.body) {
    return { ok: false, reason: "invalid_json" };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      // Abort mid-stream: stop reading, release the connection, refuse now.
      void reader.cancel().catch(() => {});
      return { ok: false, reason: "too_large" };
    }
    chunks.push(value);
  }

  try {
    const text = Buffer.concat(chunks).toString("utf8");
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}
