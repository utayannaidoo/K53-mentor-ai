import OpenAI from "openai";

let client: OpenAI | null = null;

/** Lazily construct the OpenAI client. Returns null when no key is configured. */
export function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

/**
 * Cost discipline: use the cheap/fast model for routine explanations and only
 * escalate to the stronger model for genuinely complex requests.
 */
export function chooseModel(userText: string) {
  const complex = userText.length > 220 || /in depth|step by step|don'?t understand|confused|prove|why exactly/i.test(userText);
  return complex
    ? process.env.OPENAI_MODEL_SMART ?? "gpt-4o"
    : process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini";
}
