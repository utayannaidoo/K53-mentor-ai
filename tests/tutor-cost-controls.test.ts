import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The three levers on the tutor bill, pinned so a future change can't quietly
 * move them:
 *
 *   1. Which model an ordinary question routes to. The smart tier costs 3x the
 *      fast tier on both input and output, so the escalation threshold matters
 *      more than the model choice does.
 *   2. That `forceLocal` short-circuits before any provider call. Who gets that
 *      flag is a billing question the route answers — see
 *      `tests/tutor-trial-routing.test.ts` — but the guarantee that the flag
 *      costs nothing lives here.
 *   3. The reply-length cap — output is 5x the price of input on the fast
 *      model, which makes it the dominant term.
 */

const ENV_KEYS = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "DEEPSEEK_API_KEY",
  "TUTOR_PROVIDER",
  "ANTHROPIC_MODEL_FAST",
  "ANTHROPIC_MODEL_SMART",
  "DEEPSEEK_MODEL_FAST",
  "DEEPSEEK_MODEL_SMART",
  "DEEPSEEK_BASE_URL",
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

/** Load the module with an explicit set of keys, for cascade-ordering tests. */
async function loadWith(keys: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  for (const [k, v] of Object.entries(keys)) env[k] = v;
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

describe("provider cascade", () => {
  const ALL = {
    DEEPSEEK_API_KEY: "sk-ds-stub",
    ANTHROPIC_API_KEY: "sk-ant-stub",
    OPENAI_API_KEY: "sk-oai-stub",
  } as const;

  it("prefers DeepSeek when its key is set — that is what pays for the caps", async () => {
    // The plan allowances in plans.ts (15/35 a day) are only affordable at
    // V4-Flash rates. If this ever silently reorders, the bill moves ~9x.
    const { chooseProvider } = await loadWith(ALL);
    expect(chooseProvider()).toBe("deepseek");
  });

  it("falls back through Anthropic to OpenAI to local", async () => {
    const { chooseProvider } = await loadWith({
      ANTHROPIC_API_KEY: "sk-ant-stub",
      OPENAI_API_KEY: "sk-oai-stub",
    });
    expect(chooseProvider()).toBe("anthropic");

    vi.resetModules();
    delete env.ANTHROPIC_API_KEY;
    expect((await loadWith({ OPENAI_API_KEY: "sk-oai-stub" })).chooseProvider()).toBe("openai");

    vi.resetModules();
    delete env.OPENAI_API_KEY;
    expect((await loadWith({})).chooseProvider()).toBe("local");
  });

  it("routes the DeepSeek tiers to V4-Flash and V4-Pro", async () => {
    const { modelFor } = await loadWith({ DEEPSEEK_API_KEY: "sk-ds-stub" });
    expect(modelFor("deepseek", "What is the following distance?")).toBe("deepseek-v4-flash");
    expect(modelFor("deepseek", "I'm confused about right of way")).toBe("deepseek-v4-pro");
  });

  it("honours DeepSeek model overrides", async () => {
    const { modelFor } = await loadWith({
      DEEPSEEK_API_KEY: "sk-ds-stub",
      DEEPSEEK_MODEL_FAST: "custom-flash",
      DEEPSEEK_MODEL_SMART: "custom-pro",
    });
    expect(modelFor("deepseek", "short one")).toBe("custom-flash");
    expect(modelFor("deepseek", "I'm confused")).toBe("custom-pro");
  });
});

describe("images never reach a text-only provider", () => {
  /**
   * DeepSeek's public API takes no image input. Sending one does not fail
   * loudly — it answers from the text alone, which for the sign scanner means
   * confidently describing a photo it never saw. Every image path therefore
   * asks the cascade for "image", and these pin that it actually skips.
   */
  it("skips DeepSeek for image requests even though it wins for text", async () => {
    const { chooseProvider } = await loadWith({
      DEEPSEEK_API_KEY: "sk-ds-stub",
      ANTHROPIC_API_KEY: "sk-ant-stub",
    });
    expect(chooseProvider("text")).toBe("deepseek");
    expect(chooseProvider("image")).toBe("anthropic");
  });

  it("reports local when DeepSeek is the only provider configured", async () => {
    // The routes read this to say "I can't look at photos right now" instead of
    // burning a scan on a model that cannot see.
    const { chooseProvider } = await loadWith({ DEEPSEEK_API_KEY: "sk-ds-stub" });
    expect(chooseProvider("text")).toBe("deepseek");
    expect(chooseProvider("image")).toBe("local");
  });

  it("overrides an explicit TUTOR_PROVIDER=deepseek for images", async () => {
    // A text-only preference must not silently disable the scanner.
    const { chooseProvider } = await loadWith({
      TUTOR_PROVIDER: "deepseek",
      DEEPSEEK_API_KEY: "sk-ds-stub",
      ANTHROPIC_API_KEY: "sk-ant-stub",
    });
    expect(chooseProvider("text")).toBe("deepseek");
    expect(chooseProvider("image")).toBe("anthropic");
  });

  it("streams a photo-bearing message to Anthropic, not DeepSeek", async () => {
    const { streamTutorReply } = await loadWith({
      DEEPSEEK_API_KEY: "sk-ds-stub",
      ANTHROPIC_API_KEY: "sk-ant-stub",
    });
    const res = await streamTutorReply({
      persona: "persona",
      grounding: "",
      messages: [{ role: "user", content: "What sign is this?" }],
      userText: "What sign is this?",
      localReply: "Describe the sign and I'll identify it.",
      image: { data: "AAAA", mediaType: "image/jpeg" },
    });
    expect(res.provider).toBe("anthropic");
  });
});

describe("forceLocal never reaches a provider", () => {
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
