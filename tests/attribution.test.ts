import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * First-touch campaign attribution.
 *
 * The whole point of tagging social links is answering "which platform produces
 * paying learners", and two things make that answer silently wrong. Pageviews
 * are captured manually with `$current_url` set to origin + path, so PostHog
 * never sees the query string and would never read utm_* on its own. And
 * attribution has to be *first* touch — a learner who arrives from a TikTok
 * link, leaves, and returns a week later by typing the domain is still a TikTok
 * signup, so a later visit must not overwrite the origin.
 *
 * Both failures look like working code: events keep flowing, the dashboard
 * keeps rendering, and every conversion just quietly attributes to nothing or
 * to the wrong source.
 *
 * posthog-js is imported dynamically, so the person-property write is buffered
 * and lands a few ticks after initAnalytics() returns — hence `settle()`.
 * `attributionProps()` deliberately does NOT wait: a conversion event fired
 * during first paint has to carry the tags, so the URL read is synchronous.
 */

const setPersonProperties = vi.fn();

vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    captureException: vi.fn(),
    identify: vi.fn(),
    setPersonProperties,
  },
}));

/** Let the dynamic import resolve and the buffered ops flush. */
async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/** Minimal browser surface: analytics.ts touches only these. */
function stubWindow(search: string, store: Record<string, string> = {}) {
  const localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };
  (globalThis as { window?: unknown }).window = {
    location: { search, origin: "https://k53mentorai.co.za" },
    localStorage,
  };
  return store;
}

/** Fresh module per case — KEY, `instance` and the buffer are module scope. */
async function loadAnalytics(key: string | undefined) {
  vi.resetModules();
  if (key === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  else process.env.NEXT_PUBLIC_POSTHOG_KEY = key;
  return import("@/lib/analytics");
}

const ORIGINAL_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

beforeEach(() => {
  setPersonProperties.mockClear();
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
  if (ORIGINAL_KEY === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  else process.env.NEXT_PUBLIC_POSTHOG_KEY = ORIGINAL_KEY;
});

describe("campaign attribution", () => {
  it("captures utm tags off the landing URL", async () => {
    const store = stubWindow("?utm_source=tiktok&utm_medium=bio&utm_campaign=launch");
    const { initAnalytics, attributionProps } = await loadAnalytics("phc_test");
    initAnalytics();

    // Synchronously, with no await: an event fired on this tick must carry them.
    expect(attributionProps()).toEqual({
      utm_source: "tiktok",
      utm_medium: "bio",
      utm_campaign: "launch",
    });
    // Persisted, so the tags survive the learner leaving and coming back.
    expect(JSON.parse(store["k53:attribution"])).toEqual({
      utm_source: "tiktok",
      utm_medium: "bio",
      utm_campaign: "launch",
    });
  });

  it("sets the person properties once, never on every visit", async () => {
    stubWindow("?utm_source=tiktok");
    const { initAnalytics } = await loadAnalytics("phc_test");
    initAnalytics();
    await settle();

    // $set_once is the second argument — the first would overwrite on return.
    expect(setPersonProperties).toHaveBeenCalledWith(undefined, { utm_source: "tiktok" });
  });

  it("keeps the first touch when a later visit carries different tags", async () => {
    const store = stubWindow("?utm_source=tiktok&utm_campaign=launch");
    const first = await loadAnalytics("phc_test");
    first.initAnalytics();
    await settle();

    // Same device, same stored value, a later visit from somewhere else.
    stubWindow("?utm_source=facebook&utm_campaign=retarget", store);
    const second = await loadAnalytics("phc_test");
    second.initAnalytics();
    await settle();

    expect(second.attributionProps()).toEqual({
      utm_source: "tiktok",
      utm_campaign: "launch",
    });
  });

  it("stays empty for a visit with no tags, rather than inventing a source", async () => {
    stubWindow("");
    const { initAnalytics, attributionProps } = await loadAnalytics("phc_test");
    initAnalytics();
    await settle();

    expect(attributionProps()).toEqual({});
    expect(setPersonProperties).not.toHaveBeenCalled();
  });

  it("ignores stored junk instead of treating it as a source", async () => {
    // A hand-edited or half-written value must not stand in for real tags.
    const store = stubWindow("?utm_source=tiktok", { "k53:attribution": '"tiktok"' });
    const { initAnalytics, attributionProps } = await loadAnalytics("phc_test");
    initAnalytics();

    expect(attributionProps()).toEqual({ utm_source: "tiktok" });
    expect(JSON.parse(store["k53:attribution"])).toEqual({ utm_source: "tiktok" });
  });

  it("is a no-op with no PostHog key, so demo mode still works", async () => {
    const store = stubWindow("?utm_source=tiktok");
    const { initAnalytics, attributionProps } = await loadAnalytics(undefined);
    initAnalytics();
    await settle();

    expect(attributionProps()).toEqual({});
    expect(store["k53:attribution"]).toBeUndefined();
    expect(setPersonProperties).not.toHaveBeenCalled();
  });

  it("survives localStorage throwing, which private mode does", async () => {
    (globalThis as { window?: unknown }).window = {
      location: { search: "?utm_source=tiktok", origin: "https://k53mentorai.co.za" },
      localStorage: {
        getItem: () => {
          throw new Error("denied");
        },
        setItem: () => {
          throw new Error("denied");
        },
      },
    };
    const { initAnalytics, attributionProps } = await loadAnalytics("phc_test");

    expect(() => initAnalytics()).not.toThrow();
    // Still tags this session's events from memory, even with nowhere to persist.
    expect(attributionProps()).toEqual({ utm_source: "tiktok" });
  });

  it("caps tag length, since anyone can craft the URL", async () => {
    stubWindow(`?utm_source=${"x".repeat(500)}`);
    const { initAnalytics, attributionProps } = await loadAnalytics("phc_test");
    initAnalytics();

    expect(attributionProps().utm_source).toHaveLength(120);
  });
});
