import { z } from "zod";
import { getOpenAI, chooseModel } from "@/lib/ai/openai";
import { buildSystemPrompt, resolveContext } from "@/lib/ai/tutor-prompt";
import { localTutorReply } from "@/lib/ai/fallback";

export const runtime = "nodejs";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
  context: z
    .object({
      type: z.enum(["question", "card", "category", "none"]),
      id: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { messages, context } = parsed;
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const resolved = resolveContext(context);

  try {
    const openai = getOpenAI();
    if (!openai) {
      return Response.json({ reply: localTutorReply(lastUser, context), model: "local" });
    }

    const model = chooseModel(lastUser);
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: "system", content: buildSystemPrompt(resolved?.text) },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() || localTutorReply(lastUser, context);
    return Response.json({ reply, model });
  } catch (err) {
    // Any API failure (bad key, rate limit, network) degrades gracefully.
    console.error("tutor route error", err);
    return Response.json({ reply: localTutorReply(lastUser, context), model: "local" });
  }
}
