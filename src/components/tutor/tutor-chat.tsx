"use client";

import * as React from "react";
import Link from "next/link";
import { Send, Plus, Sparkles, MessageSquareText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Paywall } from "@/components/app/paywall";
import { useStudyStore } from "@/hooks/use-study-store";
import { cn, formatDate } from "@/lib/utils";
import { defaultTutorPrompt, type TutorContextType } from "@/lib/ai/tutor-prompt";

export interface InitialContext {
  type: TutorContextType;
  id?: string;
  label: string | null;
}

const CONTEXT_CHIPS = [
  "Explain this to me",
  "Explain it like I'm 10",
  "Give me another example",
  "Give me a real-world scenario",
  "Why is the answer what it is?",
];
const OPEN_CHIPS = [
  "What does a yield sign mean?",
  "How do four-way stops work?",
  "Explain the two-second rule",
  "When must I dip my headlights?",
];

export function TutorChat({ initial }: { initial: InitialContext | null }) {
  const { ready, state, createTutorThread, appendTutorMessage, usageFor } = useStudyStore();
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [sessionCtx, setSessionCtx] = React.useState<InitialContext | null>(initial);
  // Pre-fill the composer when the tutor is opened from a question / card / topic,
  // so the learner has a sensible starting question instead of a blank box.
  const [input, setInput] = React.useState(() =>
    initial ? defaultTutorPrompt(initial.type, initial.label) : "",
  );
  const [loading, setLoading] = React.useState(false);
  const initRef = React.useRef(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // One-time init: open a context thread, or resume the latest.
  React.useEffect(() => {
    if (initRef.current || !ready) return;
    initRef.current = true;
    if (initial) {
      const id = createTutorThread({
        title: initial.label ?? "Tutor",
        contextLabel: initial.label,
        contextQuestionId: initial.type === "question" ? (initial.id ?? null) : null,
      });
      setThreadId(id);
    } else {
      setThreadId(state.tutorThreads[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const thread = state.tutorThreads.find((t) => t.id === threadId) ?? null;
  const messages = thread?.messages ?? [];
  const cap = usageFor("tutor");
  const blocked = !cap.allowed;

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    if (blocked) return;

    let id = threadId;
    const prior = thread?.messages ?? [];
    if (!id) {
      id = createTutorThread({
        title: content.slice(0, 42),
        contextLabel: sessionCtx?.label ?? null,
        contextQuestionId: sessionCtx?.type === "question" ? (sessionCtx.id ?? null) : null,
      });
      setThreadId(id);
    }
    appendTutorMessage(id, { role: "user", content });
    setInput("");
    setLoading(true);

    const history = [...prior, { role: "user" as const, content }].map((m) => ({ role: m.role, content: m.content }));
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context: sessionCtx ? { type: sessionCtx.type, id: sessionCtx.id } : { type: "none" },
        }),
      });
      const data = await res.json();
      appendTutorMessage(id, { role: "assistant", content: data.reply, model: data.model });
    } catch {
      appendTutorMessage(id, {
        role: "assistant",
        content: "Sorry — I had trouble responding just then. Please try again.",
        model: "local",
      });
    } finally {
      setLoading(false);
    }
  }

  function newConversation() {
    setThreadId(null);
    setSessionCtx(null);
    setInput("");
  }

  function openThread(t: (typeof state.tutorThreads)[number]) {
    setThreadId(t.id);
    setSessionCtx(t.contextQuestionId ? { type: "question", id: t.contextQuestionId, label: t.contextLabel } : null);
  }

  const chips = sessionCtx ? CONTEXT_CHIPS : OPEN_CHIPS;

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] max-w-5xl gap-5">
      {/* Thread list */}
      <aside className="hidden w-60 shrink-0 flex-col lg:flex">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={newConversation}>
          <Plus className="h-4 w-4" /> New conversation
        </Button>
        <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
          {state.tutorThreads.length === 0 && (
            <p className="px-2 py-4 text-xs text-muted-foreground">Your past conversations will appear here.</p>
          )}
          {state.tutorThreads.map((t) => (
            <button
              key={t.id}
              onClick={() => openThread(t)}
              className={cn(
                "press w-full truncate rounded-lg px-3 py-2 text-left text-sm",
                t.id === threadId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <span className="block truncate font-medium">{t.title}</span>
              <span className="block text-2xs opacity-70">{formatDate(t.updatedAt, { day: "numeric", month: "short" })}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div className="glass flex min-w-0 flex-1 flex-col rounded-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">K53 Mentor</p>
              {thread?.contextLabel ? (
                <Badge variant="secondary" className="mt-0.5">{thread.contextLabel}</Badge>
              ) : (
                <p className="text-2xs text-muted-foreground">Your AI driving tutor</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={newConversation}>
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center p-6">
              <EmptyState
                icon={<MessageSquareText className="h-6 w-6" />}
                title="Ask me anything about the K53"
                description="I explain the why behind each rule, give real examples, and never just dump the answer. Try a prompt below."
              />
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "assistant" ? (
                <div className="glass-subtle max-w-[85%] animate-fade-in rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-primary">
                    <Sparkles className="h-3 w-3" /> Tutor
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{m.content}</p>
                </div>
              ) : (
                <div className="max-w-[85%] animate-fade-in rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary to-primary-light px-4 py-3 text-sm text-primary-foreground shadow-[0_8px_22px_-10px_hsl(var(--primary)/0.6)]">
                  {m.content}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="glass-subtle rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <Dot /> <Dot delay="200ms" /> <Dot delay="400ms" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border p-3">
          {blocked ? (
            <div className="px-1 py-2">
              <Paywall
                title="You've used today's free tutor messages"
                description={`The free plan includes ${cap.cap} tutor messages a day. Upgrade for more coaching whenever you're stuck.`}
                cta="Upgrade for more"
              />
            </div>
          ) : (
            <>
              <div className="no-scrollbar mb-2.5 flex gap-2 overflow-x-auto">
                {chips.map((c) => (
                  <Chip key={c} onClick={() => send(c)} className="shrink-0">
                    <Lightbulb className="h-3.5 w-3.5" /> {c}
                  </Chip>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the tutor..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label="Send">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-2 text-center text-2xs text-muted-foreground">
                {cap.cap === Infinity ? "Unlimited tutor messages" : `${Math.max(0, cap.cap - cap.used)} of ${cap.cap} free messages left today`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/50"
      style={{ animationDelay: delay }}
    />
  );
}
