"use client";

import * as React from "react";
import Link from "next/link";
import { Send, Plus, Sparkles, MessageSquareText, Lightbulb, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Paywall } from "@/components/app/paywall";
import { TrialMeter } from "@/components/app/trial-meter";
import { useStudyStore } from "@/hooks/use-study-store";
import { cn, formatDate, formatZar } from "@/lib/utils";
import { TUTOR_TOPUP_CREDITS, TUTOR_TOPUP_PRICE } from "@/lib/billing/plans";
import { defaultTutorPrompt, type TutorContextType } from "@/lib/ai/tutor-prompt";
import { buildLearnerProfile } from "@/lib/ai/learner-profile";
import { fileToScaledBase64, type EncodedImage } from "@/lib/image";
import { Markdown } from "@/components/tutor/markdown";

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
  "I'll describe a road situation — tell me what K53 expects",
];

export function TutorChat({ initial }: { initial: InitialContext | null }) {
  const { ready, state, createTutorThread, appendTutorMessage, usageFor } = useStudyStore();
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [sessionCtx, setSessionCtx] = React.useState<InitialContext | null>(initial);
  // Pre-fill the composer when the tutor is opened from a question / card / topic,
  // so the learner has a sensible starting question instead of a blank box.
  const [input, setInput] = React.useState(() =>
    initial ? defaultTutorPrompt(initial.type, initial.id, initial.label) : "",
  );
  const [loading, setLoading] = React.useState(false);
  // Text of the assistant reply as it streams in, before it's committed to the store.
  const [streaming, setStreaming] = React.useState<string | null>(null);
  // Photo attached to the next message. Sent to the API but never persisted —
  // a base64 photo per message would blow out localStorage.
  const [pendingImage, setPendingImage] = React.useState<{
    image: EncodedImage;
    previewUrl: string;
  } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const initRef = React.useRef(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  // Server said the plan's daily messages are used up. canTopUp = Premium
  // Plus, whose top-up pack applies automatically once purchased.
  const [capNotice, setCapNotice] = React.useState<{ canTopUp: boolean } | null>(null);
  const [topUpBusy, setTopUpBusy] = React.useState(false);
  const [topUpBanner, setTopUpBanner] = React.useState<string | null>(null);

  // Paystack redirects back with ?topup=success after buying a pack.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("topup") !== "success") return;
    // Confirm the charge server-side so the credits are banked immediately,
    // rather than waiting for the async webhook to land.
    const reference = params.get("reference") ?? params.get("trxref");
    if (reference) {
      fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reference }),
      }).catch(() => {});
    }
    setTopUpBanner("Top-up added — your extra messages apply automatically. Carry on!");
    setCapNotice(null);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function buyTopUp() {
    setTopUpBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: "tutor_topup" }),
      });
      const data = await res.json().catch(() => ({}) as { url?: string });
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setTopUpBanner("Top-ups aren't available right now — please try again later.");
    } catch {
      setTopUpBanner("Network error — please try again.");
    } finally {
      setTopUpBusy(false);
    }
  }

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
  }, [messages.length, loading, streaming]);

  async function send(text: string) {
    const attached = pendingImage;
    const content = text.trim() || (attached ? "What does this show, and what should I do?" : "");
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
    // The 📷 marker keeps the photo visible in history without persisting it.
    appendTutorMessage(id, { role: "user", content: attached ? `📷 ${content}` : content });
    setInput("");
    setPendingImage(null);
    setLoading(true);
    setStreaming("");

    const history = [...prior, { role: "user" as const, content }].map((m) => ({ role: m.role, content: m.content }));
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context: sessionCtx ? { type: sessionCtx.type, id: sessionCtx.id } : { type: "none" },
          profile: buildLearnerProfile(state) ?? undefined,
          image: attached?.image,
        }),
      });

      // Rate limited / daily plan cap — friendly guidance instead of an error.
      if (res.status === 429) {
        let wait = Number(res.headers.get("retry-after")) || 60;
        let payload: { retryAfter?: number; error?: string; canTopUp?: boolean } | null = null;
        try {
          payload = await res.json();
          if (payload?.retryAfter) wait = Number(payload.retryAfter);
        } catch {
          /* header value already used */
        }
        if (payload?.error === "daily_cap") {
          const canTopUp = Boolean(payload.canTopUp);
          setCapNotice({ canTopUp });
          appendTutorMessage(id, {
            role: "assistant",
            content: canTopUp
              ? "You've used all of today's messages. Grab a top-up pack below and we can keep going right away — otherwise I'm back tomorrow."
              : "You've used all of today's tutor messages on your plan. Upgrade for a bigger daily allowance, or come back tomorrow — your questions will keep.",
            model: "local",
          });
          return;
        }
        appendTutorMessage(id, {
          role: "assistant",
          content: `You're sending messages a little fast for me to keep up. Please try again in about ${formatWait(wait)}.`,
          model: "local",
        });
        return;
      }

      const model = res.headers.get("x-tutor-model") ?? "local";

      if (!res.body) {
        const text = await res.text();
        appendTutorMessage(id, {
          role: "assistant",
          content: text.trim() || "Sorry — I had trouble responding just then. Please try again.",
          model,
        });
        return;
      }

      // Stream the reply in, updating the live bubble as chunks arrive.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }
      acc += decoder.decode();
      appendTutorMessage(id, {
        role: "assistant",
        content: acc.trim() || "Sorry — I had trouble responding just then. Please try again.",
        model,
      });
    } catch {
      appendTutorMessage(id, {
        role: "assistant",
        content: "Sorry — I had trouble responding just then. Please try again.",
        model: "local",
      });
    } finally {
      setStreaming(null);
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
                  <Markdown>{m.content}</Markdown>
                </div>
              ) : (
                <div className="max-w-[85%] animate-fade-in rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary to-primary-light px-4 py-3 text-sm text-primary-foreground shadow-[0_8px_22px_-10px_hsl(var(--primary)/0.6)]">
                  {m.content}
                </div>
              )}
            </div>
          ))}

          {/* Live streaming reply */}
          {streaming !== null && streaming.length > 0 && (
            <div className="flex justify-start">
              <div className="glass-subtle max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3 w-3" /> Tutor
                </div>
                <Markdown>{streaming}</Markdown>
              </div>
            </div>
          )}

          {/* Thinking dots — only before the first token arrives */}
          {loading && (streaming === null || streaming.length === 0) && (
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
                feature="tutor"
                title="You've used today's free tutor messages"
                description={`The free plan includes ${cap.cap} tutor messages a day. Upgrade for more coaching whenever you're stuck.`}
                cta="Upgrade for more"
              />
            </div>
          ) : (
            <>
              <TrialMeter feature="tutor" className="mb-2.5" />
              {topUpBanner && (
                <div className="mb-2.5 rounded-lg border border-success/30 bg-success/[0.08] px-3 py-2 text-xs text-success">
                  {topUpBanner}
                </div>
              )}
              {capNotice && (
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warning/30 bg-warning/[0.08] px-3 py-2.5">
                  <span className="text-xs text-foreground">
                    {capNotice.canTopUp
                      ? `Daily messages used — top up ${TUTOR_TOPUP_CREDITS} more for ${formatZar(TUTOR_TOPUP_PRICE)}.`
                      : "Daily tutor messages used for your plan."}
                  </span>
                  {capNotice.canTopUp ? (
                    <Button
                      size="sm"
                      onClick={buyTopUp}
                      loading={topUpBusy}
                      loadingText="Opening checkout…"
                    >
                      Buy top-up
                    </Button>
                  ) : (
                    <Link href="/account/billing" className="text-xs font-semibold text-primary hover:underline">
                      See plans
                    </Link>
                  )}
                </div>
              )}
              <div className="no-scrollbar mb-2.5 flex gap-2 overflow-x-auto">
                {chips.map((c) => (
                  <Chip key={c} onClick={() => send(c)} className="shrink-0">
                    <Lightbulb className="h-3.5 w-3.5" /> {c}
                  </Chip>
                ))}
              </div>
              {pendingImage && (
                <div className="mb-2.5 flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pendingImage.previewUrl}
                    alt="Attached photo"
                    className="h-14 w-14 rounded-lg border border-border object-cover"
                  />
                  <span className="text-xs text-muted-foreground">Photo attached — ask about it</span>
                  <button
                    type="button"
                    onClick={() => setPendingImage(null)}
                    aria-label="Remove photo"
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      const image = await fileToScaledBase64(file);
                      setPendingImage({
                        image,
                        previewUrl: `data:${image.mediaType};base64,${image.data}`,
                      });
                    } catch {
                      /* unreadable file — leave composer as-is */
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Attach a photo"
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={pendingImage ? "Ask about the photo..." : "Ask the tutor..."}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() && !pendingImage}
                  loading={loading}
                  aria-label="Send"
                >
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

/** Humanise a seconds value for the rate-limit cooldown message. */
function formatWait(seconds: number): string {
  const s = Math.max(1, Math.round(seconds));
  if (s < 60) return `${s} second${s === 1 ? "" : "s"}`;
  const m = Math.ceil(s / 60);
  return `${m} minute${m === 1 ? "" : "s"}`;
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/50"
      style={{ animationDelay: delay }}
    />
  );
}
