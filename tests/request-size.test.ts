import { describe, expect, it } from "vitest";

import {
  IMAGE_BODY_MAX_BYTES,
  readJsonCapped,
  requestBodyTooLarge,
  SMALL_BODY_MAX_BYTES,
} from "@/lib/http/request-size";

/**
 * The pre-parse body-size backstop on the AI routes. It exists because zod
 * validation only runs AFTER req.json() has buffered and parsed the whole
 * body — a flood of oversized requests should die on one header read.
 */

function req(contentLength?: string, extraHeaders: Record<string, string> = {}): Request {
  return new Request("https://k53mentorai.co.za/api/tutor", {
    method: "POST",
    headers: {
      ...(contentLength === undefined ? {} : { "content-length": contentLength }),
      ...extraHeaders,
    },
  });
}

describe("requestBodyTooLarge", () => {
  it("accepts a body at or under the cap", () => {
    expect(requestBodyTooLarge(req(String(IMAGE_BODY_MAX_BYTES)), IMAGE_BODY_MAX_BYTES)).toBe(false);
    expect(requestBodyTooLarge(req("0"), IMAGE_BODY_MAX_BYTES)).toBe(false);
  });

  it("refuses a body over the cap", () => {
    expect(requestBodyTooLarge(req(String(IMAGE_BODY_MAX_BYTES + 1)), IMAGE_BODY_MAX_BYTES)).toBe(true);
    expect(requestBodyTooLarge(req("999999999"), SMALL_BODY_MAX_BYTES)).toBe(true);
  });

  it("lets chunked requests (no content-length) through to zod", () => {
    // The header is only a backstop; schema validation remains the authority.
    expect(requestBodyTooLarge(req(undefined), IMAGE_BODY_MAX_BYTES)).toBe(false);
  });

  it("treats garbage headers as absent rather than throwing", () => {
    expect(requestBodyTooLarge(req("not-a-number"), IMAGE_BODY_MAX_BYTES)).toBe(false);
  });
});

/**
 * A Request built from a ReadableStream body carries no Content-Length header —
 * the exact chunked case the header-only backstop cannot see.
 */
function streamedRequest(chunks: string[]): Request {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  // undici requires duplex:"half" when a stream body is supplied; the DOM
  // RequestInit type does not model it yet, hence the narrow cast.
  return new Request("https://k53mentorai.co.za/api/tutor", {
    method: "POST",
    body: stream,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
}

describe("readJsonCapped", () => {
  it("parses a chunked body under the cap across multiple chunks", async () => {
    const res = await readJsonCapped(streamedRequest(['{"a"', ":1}"]), 64);
    expect(res).toEqual({ ok: true, value: { a: 1 } });
  });

  it("aborts mid-stream once cumulative bytes pass the cap (no hang)", async () => {
    const res = await readJsonCapped(streamedRequest(['{"abcdefghij":1}']), 8);
    expect(res).toEqual({ ok: false, reason: "too_large" });
  });

  it("reports invalid_json for malformed JSON under the cap", async () => {
    const res = await readJsonCapped(streamedRequest(["{oops"]), 64);
    expect(res).toEqual({ ok: false, reason: "invalid_json" });
  });

  it("reports invalid_json for a bodyless request", async () => {
    const bodyless = new Request("https://k53mentorai.co.za/api/tutor", { method: "POST" });
    const res = await readJsonCapped(bodyless, 64);
    expect(res).toEqual({ ok: false, reason: "invalid_json" });
  });
});
