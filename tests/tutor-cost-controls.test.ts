import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The three levers on the tutor bill, pinned so a future change can't quietly
 * move them:
 *
 *   1. Which model an ordinary question routes to. The smart tier costs 3x the
 *      fast tier on both input and output, so the escalation threshold matters
 *      more than the model choice does.
 *   2. That the free tier never reaches a paid provider at all.
 *   3. The reply-length cap — output is 5x the price of input on the fast
 *      model, which makes it the dominant term.
 */

const ENV_KEYS = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "TUTOR_PROVIDER",
  "ANTHROPIC_MODEL_FAST",
  "ANTHROPIC_MODEL_SMART",
  "TUTOR_MAX_TOKENS",
] as const;

const env = process.env as Record<string, string | undefined>;
const original = Object.fromEntries(ENV_KEYS.map((k) => [k, env[k]]));

beforeEach(() => {
  for (const k of ENV_KEYS) delete env[k];
  vi.resetModules();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (original[k] === undefined) delete env[k];
    else env[k] = original[k];
  }
});

async function load() {
  env.ANTHROPIC_API_KEY = "sk-ant-stub";
  return import("@/lib/ai/provider");
}

describe("model routing", () => {
  /** Everyday K53 questions, all well under the escalation threshold. */
  const ordinary = [
    "What is the following distance in the rain?",
    "How many points do I need to pass the signs section?",
    "When can I overtake on a barrier line?",
    // ~230 characters — two sentences of ordinary phrasing. This used to
    // escalate to the pricier model on length alone.
    "I got a question wrong about the yellow line on the left of the road and I want to know what it actually means, because the app said one thing and I thought it meant something else entirely.",
  ];

  it("keeps ordinary questions on the cheap model", async () => {
    const { modelFor } = await load();
    for (const q of ordinary) {
      expect(modelFor("anthropic", q), `escalated: ${q.slice(0, 40)}…`).toBe(
        "claude-haiku-4-5-20251001",
      );
    }
  });

  it("still escalates on explicit signals of difficulty", async () => {
    const { modelFor } = await load();
    for (const q of ["explain it again please", "I'm confused about right of way"]) {
      expect(modelFor("anthropic", q)).toBe("claude-sonnet-5");
    }
  });

  it("escalates a genuinely long question", async () => {
    const { modelFor } = await load();
    expect(modelFor("anthropic", "a".repeat(501))).toBe("claude-sonnet-5");
  });

  it("defaults the smart tier to Sonnet 5, not the older 4.6", async () => {
    // Sonnet 5 is better and priced the same; there is no reason to sit on 4.6.
    const { modelFor } = await load();
    expect(modelFor("anthropic", "please explain it again")).toBe("claude-sonnet-5");
  });

  it("honours explicit model overrides", async () => {
    env.ANTHROPIC_MODEL_FAST = "custom-fast";
    env.ANTHROPIC_MODEL_SMART = "custom-smart";
    const { modelFor } = await load();
    expect(modelFor("anthropic", "short one")).toBe("custom-fast");
    expect(modelFor("anthropic", "I'm confused")).toBe("custom-smart");
  });
});

describe("free tier never reaches a provider", () => {
  const base = {
    persona: "persona",
    grounding: "",
    messages: [{ role: "user" as const, content: "What is the pass mark?" }],
    userText: "What is the pass mark?",
    localReply: "The learner's pass mark is 51 out of 64.",
  };

  it("serves the local reply with an API key present", async () => {
    // The key being set is the point: forceLocal must short-circuit before any
    // provider call, not merely fall back when the call fails.
    const { streamTutorReply } = await load();
    const res = await streamTutorReply({ ...base, forceLocal: true });

    expect(res.provider).toBe("local");
    expect(res.model).toBe("local");

    const text = await new Response(res.stream).text();
    expect(text).toBe(base.localReply);
  });

  it("reaches the provider when the flag is absent", async () => {
    // The contrast that makes the test above meaningful. `.stream()` returns
    // without awaiting the network, so the provider is reported as anthropic
    // here even with a stub key — a request was constructed and would have
    // been billed. forceLocal returns before any of that happens.
    const { streamTutorReply } = await load();
    const res = await streamTutorReply(base);
    expect(res.provider).toBe("anthropic");
    expect(res.model).toBe("claude-haiku-4-5-20251001");
  });
});

describe("reply length cap", () => {
  it("defaults to 350 tokens", async () => {
    // Output is 5x the price of input on the fast model, so a silent bump here
    // moves the bill more than a model swap would.
    const src = await import("node:fs").then((fs) =>
      fs.readFileSync("src/lib/ai/provider.ts", "utf8"),
    );
    expect(src).toMatch(/TUTOR_MAX_TOKENS \?\? 350/);
  });
});
