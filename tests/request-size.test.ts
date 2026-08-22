import { describe, expect, it } from "vitest";

import {
  IMAGE_BODY_MAX_BYTES,
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
