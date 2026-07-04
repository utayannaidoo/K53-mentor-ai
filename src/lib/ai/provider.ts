import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Unified, streaming tutor provider.
 *
 * Picks a backend at request time: Anthropic (preferred for this project) →
 * OpenAI → a built-in local fallback. Every path returns a ReadableStream of
 * UTF-8 text plus the resolved model name, so the route stays provider-agnostic
 * and always streams. Any provider error degrades to streaming the precomputed
 * local reply, so the tutor never hard-fails.
 */

export type Provider = "anthropic" | "openai" | "local";

const MAX_TOKENS = Number(process.env.TUTOR_MAX_TOKENS ?? 500);
const TEMPERATURE = 0.4;
const encoder = new TextEncoder();

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function openai(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}
function anthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropicClient;
}

/** Resolve which provider to use. Honours TUTOR_PROVIDER, else auto-selects. */
export function chooseProvider(): Provider {
  const pref = process.env.TUTOR_PROVIDER as Provider | undefined;
  if (pref === "anthropic" && anthropic()) return "anthropic";
  if (pref === "openai" && openai()) return "openai";
  if (pref === "local") return "local";
  if (anthropic()) return "anthropic";
  if (openai()) return "openai";
  return "local";
}

/** Heuristic: only escalate to the stronger (pricier) model when warranted. */
function isComplex(userText: string): boolean {
  return (
    userText.length > 220 ||
    /in depth|step by step|don'?t understand|confused|prove|why exactly|explain (?:it )?again/i.test(userText)
  );
}

export function modelFor(provider: Provider, userText: string): string {
  const complex = isComplex(userText);
  if (provider === "anthropic") {
    return complex
      ? process.env.ANTHROPIC_MODEL_SMART ?? "claude-sonnet-4-6"
      : process.env.ANTHROPIC_MODEL_FAST ?? "claude-haiku-4-5-20251001";
  }
  if (provider === "openai") {
    return complex
      ? process.env.OPENAI_MODEL_SMART ?? "gpt-4o"
      : process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini";
  }
  return "local";
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
 * when only the local provider is available (no offline vision exists).
 */
export async function completeVisionText(args: {
  system: string;
  userText: string;
  image: AttachedImage;
  maxTokens?: number;
}): Promise<{ text: string; model: string } | null> {
  const provider = chooseProvider();
  const maxTokens = args.maxTokens ?? 400;

  try {
    if (provider === "anthropic") {
      const client = anthropic()!;
      const model = process.env.ANTHROPIC_MODEL_FAST ?? "claude-haiku-4-5-20251001";
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

    if (provider === "openai") {
      const client = openai()!;
      const model = process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini";
      const res = await client.chat.completions.create({
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
      const model = process.env.ANTHROPIC_MODEL_FAST ?? "claude-haiku-4-5-20251001";
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

    if (provider === "openai") {
      const client = openai()!;
      const model = process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini";
      const res = await client.chat.completions.create({
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
  const provider = chooseProvider();
  const model = modelFor(provider, args.userText);

  try {
    if (provider === "anthropic") {
      const client = anthropic()!;
      // Stable persona is cached; dynamic grounding is a separate, uncached block.
      const system = [
        { type: "text" as const, text: args.persona, cache_control: { type: "ephemeral" as const } },
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

    if (provider === "openai") {
      const client = openai()!;
      const system = args.grounding ? `${args.persona}\n\n${args.grounding}` : args.persona;
      const lastUserIdx = args.messages.length - 1;
      const completion = await client.chat.completions.create({
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
            console.error("openai stream error", err);
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
