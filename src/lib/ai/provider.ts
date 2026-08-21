import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Unified, streaming tutor provider.
 *
 * Picks a backend at request time: DeepSeek (the cost-driven default) →
 * Anthropic → OpenAI → a built-in local fallback. Every path returns a
 * ReadableStream of UTF-8 text plus the resolved model name, so the route stays
 * provider-agnostic and always streams. Any provider error degrades to
 * streaming the precomputed local reply, so the tutor never hard-fails.
 *
 * DeepSeek leads the cascade because it is ~9× cheaper than Haiku 4.5 per
 * message, which is what pays for the plan allowances in plans.ts — see
 * docs/ops/ai-cost-model.md. It speaks the OpenAI wire format, so it shares
 * every code path with the OpenAI branch and differs only in base URL and
 * model ids. It is **text-only**, which is the one thing that genuinely
 * branches: see IMAGE_CAPABLE below.
 */

export type Provider = "deepseek" | "anthropic" | "openai" | "local";

/**
 * Reply length cap. Output costs more per token than input on every provider in
 * the cascade — 2× on DeepSeek V4-Flash, 5× on Haiku 4.5 — so this is the term
 * the tutor bill is most sensitive to. 350 tokens is roughly 250 words, more
 * than enough for a K53 answer and scannable on a phone. Raise it if answers
 * start getting cut off mid-sentence.
 */
const MAX_TOKENS = Number(process.env.TUTOR_MAX_TOKENS ?? 350);
const TEMPERATURE = 0.4;
const encoder = new TextEncoder();

/**
 * Hard ceiling per provider HTTP call, plus at most one retry.
 *
 * Both SDKs default to a 10-minute timeout with 2 retries — a hung endpoint
 * could pin a serverless invocation for the better part of an hour across
 * attempts. A K53 answer is a few hundred tokens; anything not flowing within
 * 30s belongs in the local fallback instead of holding the learner's request
 * open. One retry absorbs a transient blip without turning an outage into a
 * retry storm.
 */
const PROVIDER_TIMEOUT_MS = 30_000;
const PROVIDER_MAX_RETRIES = 1;

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;
let deepseekClient: OpenAI | null = null;

function openai(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient)
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: PROVIDER_TIMEOUT_MS,
      maxRetries: PROVIDER_MAX_RETRIES,
    });
  return openaiClient;
}
function anthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient)
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: PROVIDER_TIMEOUT_MS,
      maxRetries: PROVIDER_MAX_RETRIES,
    });
  return anthropicClient;
}
function deepseek(): OpenAI | null {
  if (!process.env.DEEPSEEK_API_KEY) return null;
  if (!deepseekClient) {
    deepseekClient = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
      timeout: PROVIDER_TIMEOUT_MS,
      maxRetries: PROVIDER_MAX_RETRIES,
    });
  }
  return deepseekClient;
}

/** Remote providers in preference order, cheapest-per-message first. */
const CASCADE = ["deepseek", "anthropic", "openai"] as const;
type RemoteProvider = (typeof CASCADE)[number];

const CLIENT_FOR: Record<RemoteProvider, () => object | null> = {
  deepseek,
  anthropic,
  openai,
};

/**
 * Can this provider be sent an image?
 *
 * DeepSeek's public API is text-only — V4-Flash rejects (or silently drops)
 * image parts, and no image request format is documented for V4-Pro either.
 * That makes vision the one capability the cascade cannot treat as uniform, so
 * the sign scanner and photo-attached tutor messages ask for `"image"` and skip
 * straight past DeepSeek to a provider that can actually see. Getting this
 * wrong would not throw somewhere obvious; it would quietly answer questions
 * about a photo it never received.
 */
const IMAGE_CAPABLE: Record<RemoteProvider, boolean> = {
  deepseek: false,
  anthropic: true,
  openai: true,
};

function isRemote(p: string | undefined): p is RemoteProvider {
  return CASCADE.includes(p as RemoteProvider);
}

/**
 * Resolve which provider to use. Honours TUTOR_PROVIDER, else auto-selects.
 *
 * Pass `"image"` when the request carries a photo: an otherwise-preferred
 * provider that cannot accept images is skipped, including one named
 * explicitly by TUTOR_PROVIDER — a text-only preference must not silently
 * disable the scanner.
 */
export function chooseProvider(need: "text" | "image" = "text"): Provider {
  const usable = (p: RemoteProvider) =>
    Boolean(CLIENT_FOR[p]()) && (need === "text" || IMAGE_CAPABLE[p]);

  const pref = process.env.TUTOR_PROVIDER;
  if (pref === "local") return "local";
  if (isRemote(pref) && usable(pref)) return pref;

  return CASCADE.find(usable) ?? "local";
}

/**
 * Length above which a question is treated as complex enough for the pricier
 * model. The smart tier costs ~3× the fast tier on both input and output — and
 * that ratio holds on DeepSeek (V4-Pro vs V4-Flash) as squarely as it does on
 * Anthropic, so this threshold stays the single biggest lever on the AI bill
 * whichever provider answers.
 *
 * It was 220 characters, which is about two sentences — "I don't understand
 * why you stop at a stop sign when nobody is coming, my instructor said
 * something different" clears it comfortably. Most ordinary questions were
 * being escalated, which is the opposite of what a fast/smart split is for.
 */
const COMPLEX_LENGTH = 500;

/** Heuristic: only escalate to the stronger (pricier) model when warranted. */
function isComplex(userText: string): boolean {
  return (
    userText.length > COMPLEX_LENGTH ||
    /in depth|step by step|don'?t understand|confused|prove|why exactly|explain (?:it )?again/i.test(userText)
  );
}

/**
 * The cheap tier — what almost every message is answered by, and the only model
 * the one-shot coach and vision helpers ever use.
 */
export function fastModelFor(provider: Provider): string {
  switch (provider) {
    case "deepseek":
      return process.env.DEEPSEEK_MODEL_FAST ?? "deepseek-v4-flash";
    case "anthropic":
      return process.env.ANTHROPIC_MODEL_FAST ?? "claude-haiku-4-5-20251001";
    case "openai":
      return process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini";
    default:
      return "local";
  }
}

/** The tier reached only by `isComplex` questions. */
export function smartModelFor(provider: Provider): string {
  switch (provider) {
    case "deepseek":
      return process.env.DEEPSEEK_MODEL_SMART ?? "deepseek-v4-pro";
    case "anthropic":
      return process.env.ANTHROPIC_MODEL_SMART ?? "claude-sonnet-5";
    case "openai":
      return process.env.OPENAI_MODEL_SMART ?? "gpt-4o";
    default:
      return "local";
  }
}

export function modelFor(provider: Provider, userText: string): string {
  return isComplex(userText) ? smartModelFor(provider) : fastModelFor(provider);
}

/**
 * The OpenAI-wire client for a provider. DeepSeek speaks the same protocol, so
 * every chat-completions call below serves both and the two never diverge.
 */
function wireClient(provider: Provider): OpenAI | null {
  if (provider === "openai") return openai();
  if (provider === "deepseek") return deepseek();
  return null;
}

/** Image media types both providers accept as base64/data-URI input. */
export type VisionMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

export interface AttachedImage {
  /** Raw base64 (no data: prefix). */
  data: string;
  mediaType: VisionMediaType;
}

/**
 * One-shot vision completion (sign scanner). Uses the fast model tier — both
 * Haiku and gpt-4o-mini are vision-capable. Returns null on any failure or
 * when no image-capable provider is available (no offline vision exists).
 *
 * Asks the cascade for `"image"`, so a DeepSeek-only deployment resolves to
 * `local` here and the route reports the scanner as unavailable rather than
 * sending a photo to a model that cannot read it.
 */
export async function completeVisionText(args: {
  system: string;
  userText: string;
  image: AttachedImage;
  maxTokens?: number;
}): Promise<{ text: string; model: string } | null> {
  const provider = chooseProvider("image");
  const maxTokens = args.maxTokens ?? 400;

  try {
    if (provider === "anthropic") {
      const client = anthropic()!;
      const model = fastModelFor(provider);
      const res = await client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: 0.3,
        system: args.system,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: args.image.mediaType, data: args.image.data },
              },
              { type: "text", text: args.userText },
            ],
          },
        ],
      });
      const text = res.content
        .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      return text ? { text, model } : null;
    }

    // DeepSeek is excluded by chooseProvider("image") above, so this branch is
    // OpenAI in practice — kept wire-generic so it stays correct if an
    // image-capable OpenAI-compatible provider is ever added to the cascade.
    const wire = wireClient(provider);
    if (wire) {
      const model = fastModelFor(provider);
      const res = await wire.chat.completions.create({
        model,
        max_tokens: maxTokens,
        temperature: 0.3,
        messages: [
          { role: "system", content: args.system },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${args.image.mediaType};base64,${args.image.data}` },
              },
              { type: "text", text: args.userText },
            ],
          },
        ],
      });
      const text = res.choices[0]?.message?.content?.trim();
      return text ? { text, model } : null;
    }
  } catch (err) {
    console.error("vision provider error", err);
  }

  return null;
}

export interface StreamArgs {
  /** Stable, cacheable persona block. */
  persona: string;
  /** Dynamic grounding (context + retrieval + profile). May be empty. */
  grounding: string;
  /** Conversation so far (already trimmed, first message is "user"). */
  messages: { role: "user" | "assistant"; content: string }[];
  /** The latest user message text (drives model choice). */
  userText: string;
  /** Precomputed rule-based reply, used if no key is set or a call fails. */
  localReply: string;
  /** Optional photo attached to the LAST user message (tutor image input). */
  image?: AttachedImage;
  /**
   * Serve the rule-based reply without calling a provider at all.
   *
   * Set for free accounts whose seven-day trial has lapsed. Spending a provider
   * call on them buys nothing — the cost lands on every stale signup forever,
   * and the gap between the local explainer and a real model IS the upgrade
   * pitch. Accounts still inside the week do reach a provider: that is when the
   * tutor is being evaluated. Kept as a flag rather than a tier check so this
   * module stays unaware of billing — the route owns that decision.
   */
  forceLocal?: boolean;
}

function localStream(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

/**
 * One-shot, non-streaming completion for short coach copy (plan rationale,
 * session recaps). Always uses the fast/cheap model tier. Returns null on any
 * failure so callers fall back to their local template.
 */
export async function completeCoachText(args: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<{ text: string; model: string } | null> {
  const provider = chooseProvider();
  const maxTokens = args.maxTokens ?? 160;

  try {
    if (provider === "anthropic") {
      const client = anthropic()!;
      const model = fastModelFor(provider);
      const res = await client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: 0.5,
        system: args.system,
        messages: [{ role: "user", content: args.user }],
      });
      const text = res.content
        .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      return text ? { text, model } : null;
    }

    const wire = wireClient(provider);
    if (wire) {
      const model = fastModelFor(provider);
      const res = await wire.chat.completions.create({
        model,
        max_tokens: maxTokens,
        temperature: 0.5,
        messages: [
          { role: "system", content: args.system },
          { role: "user", content: args.user },
        ],
      });
      const text = res.choices[0]?.message?.content?.trim();
      return text ? { text, model } : null;
    }
  } catch (err) {
    console.error("coach provider error", err);
  }

  return null;
}

export async function streamTutorReply(
  args: StreamArgs,
): Promise<{ stream: ReadableStream<Uint8Array>; model: string; provider: Provider }> {
  // Free tier never reaches a provider — no key is read, no request is made.
  if (args.forceLocal) {
    return { stream: localStream(args.localReply), model: "local", provider: "local" };
  }

  // A photo narrows the field to providers that can see one — DeepSeek cannot.
  const provider = chooseProvider(args.image ? "image" : "text");
  const model = modelFor(provider, args.userText);

  try {
    if (provider === "anthropic") {
      const client = anthropic()!;
      // Persona first, then dynamic grounding — stable content ahead of
      // volatile is the right order regardless.
      //
      // No cache_control: this prompt is far too short to cache. The persona is
      // ~350 tokens and the minimum cacheable prefix is 4096 on Haiku 4.5 and
      // 1024 on Sonnet 5. A breakpoint under the minimum does not error — it
      // silently returns cache_creation_input_tokens: 0 — so the marker that
      // used to sit here read as a working optimisation while doing nothing.
      // Revisit only if the persona grows past the model's minimum.
      const system = [
        { type: "text" as const, text: args.persona },
        ...(args.grounding ? [{ type: "text" as const, text: args.grounding }] : []),
      ];
      const lastUserIdx = args.messages.length - 1;
      const events = client.messages.stream({
        model,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system,
        messages: args.messages.map((m, i) =>
          args.image && i === lastUserIdx && m.role === "user"
            ? {
                role: "user" as const,
                content: [
                  {
                    type: "image" as const,
                    source: {
                      type: "base64" as const,
                      media_type: args.image.mediaType,
                      data: args.image.data,
                    },
                  },
                  { type: "text" as const, text: m.content },
                ],
              }
            : { role: m.role, content: m.content },
        ),
      });
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const ev of events) {
              if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
                controller.enqueue(encoder.encode(ev.delta.text));
              }
            }
          } catch (err) {
            console.error("anthropic stream error", err);
            controller.enqueue(encoder.encode(args.localReply));
          } finally {
            controller.close();
          }
        },
      });
      return { stream, model, provider };
    }

    const wire = wireClient(provider);
    if (wire) {
      // Persona first, then grounding — the same stable-before-volatile order
      // as the Anthropic branch. On DeepSeek that ordering is also what earns
      // the cache-hit input rate, which is a fiftieth of the cache-miss rate:
      // its context caching is automatic and prefix-based, so there is no
      // marker to set, only a prefix to keep stable.
      const system = args.grounding ? `${args.persona}\n\n${args.grounding}` : args.persona;
      const lastUserIdx = args.messages.length - 1;
      const completion = await wire.chat.completions.create({
        model,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        stream: true,
        messages: [
          { role: "system", content: system },
          ...args.messages.map((m, i) =>
            args.image && i === lastUserIdx && m.role === "user"
              ? {
                  role: "user" as const,
                  content: [
                    {
                      type: "image_url" as const,
                      image_url: { url: `data:${args.image.mediaType};base64,${args.image.data}` },
                    },
                    { type: "text" as const, text: m.content },
                  ],
                }
              : { role: m.role, content: m.content },
          ),
        ],
      });
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const t = chunk.choices[0]?.delta?.content;
              if (t) controller.enqueue(encoder.encode(t));
            }
          } catch (err) {
            console.error(`${provider} stream error`, err);
            controller.enqueue(encoder.encode(args.localReply));
          } finally {
            controller.close();
          }
        },
      });
      return { stream, model, provider };
    }
  } catch (err) {
    // Failure before streaming started (bad key, network) → local fallback.
    console.error("tutor provider error", err);
  }

  return { stream: localStream(args.localReply), model: "local", provider: "local" };
}
