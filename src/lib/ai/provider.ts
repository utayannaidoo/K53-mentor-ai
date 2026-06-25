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
}

function localStream(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
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
      const events = client.messages.stream({
        model,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system,
        messages: args.messages.map((m) => ({ role: m.role, content: m.content })),
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
      const completion = await client.chat.completions.create({
        model,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        stream: true,
        messages: [
          { role: "system", content: system },
          ...args.messages.map((m) => ({ role: m.role, content: m.content })),
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
