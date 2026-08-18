"use client";

import * as React from "react";
import Link from "next/link";
import { Send, Plus, Sparkles, MessageSquareText, Lightbulb, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { Paywall } from "@/components/app/paywall";
import { TrialMeter } from "@/components/app/trial-meter";
import { useStudyStore } from "@/hooks/use-study-store";
import { cn, formatDate, formatZar } from "@/lib/utils";
import { hasFeature, TUTOR_TOPUP_CREDITS, TUTOR_TOPUP_PRICE } from "@/lib/billing/plans";
import type { TutorContextType } from "@/lib/ai/tutor-context";
import { buildLearnerProfile } from "@/lib/ai/learner-profile";
import { buildTutorOpener } from "@/lib/ai/tutor-opener";
import { useContentPool } from "@/components/content/content-provider";
import { fileToScaledBase64, type EncodedImage } from "@/lib/image";
import { Markdown } from "@/components/tutor/markdown";
import { track } from "@/lib/analytics";

export interface InitialContext {
  type: TutorContextType;
  id?: string;
  label: string | null;
  /** Option the learner picked when they got this wrong, if they did. */
  chosenIndex?: number;
  /**
   * The composer's starting text, resolved by the page from the learner's
   * content pool. Passed in rather than looked up here: doing the lookup in
   * this component meant importing the bank, and this component renders on
   * every visit to /tutor.
   */
  prompt?: string;
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
  // The learner's own pool — the opener and the profile both need question
  // text, and looking it up here rather than importing the bank is what keeps
  // /tutor from shipping the whole thing again.
  const { questions } = useContentPool();
  const [threadId, setThreadId] = React.useState<string | null>(null);
  /** Phone/tablet route to the thread list the `lg:` sidebar keeps to itself. */
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [sessionCtx, setSessionCtx] = React.useState<InitialContext | null>(initial);
  // Pre-fill the composer when the tutor is opened from a question / card / topic,
  // so the learner has a sensible starting question instead of a blank box.
  const [input, setInput] = React.useState(() => initial?.prompt ?? "");
  const [loading, setLoading] = React.useState(false);
  // Text of the assistant reply as it streams in, before it's committed to the store.
  const [streaming, setStreaming] = React.useState<string | null>(null);
  // Photo attached to the next message. Sent to the API but never persisted —
  // a base64 photo per message would blow out localStorage.
  const [pendingImage, setPendingImage] = React.useState<{
    image: EncodedImage;
    previewUrl: string;
  } | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);
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
    track("tutor_topup_completed", { credits: TUTOR_TOPUP_CREDITS, amount: TUTOR_TOPUP_PRICE });
    setTopUpBanner("Top-up added — your extra messages apply automatically. Carry on!");
    setCapNotice(null);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  // Fired when the purchase offer is actually on screen, not when the cap was
  // hit — the gap between the two is the interesting number. In an effect
  // rather than in render so a re-render can't double-count it.
  React.useEffect(() => {
    if (capNotice?.canTopUp) track("tutor_topup_shown", { tier: state.tier });
  }, [capNotice, state.tier]);

  async function buyTopUp() {
    setTopUpBusy(true);
    // The top-up is a real charge and was the one purchase path with no
    // funnel at all — the billing page tracked its checkout, this did not.
    track("checkout_started", { plan: "tutor_topup", cycle: "one_off" });
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
  // Image (vision) input is a paid capability — mirror the server gate in
  // /api/tutor so free-tier learners aren't offered a control that the server
  // would ignore. The scanner feature is the same gate used across the app.
  const canAttachImage = hasFeature(state.tier, "scanner");

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
          context: sessionCtx
            ? { type: sessionCtx.type, id: sessionCtx.id, chosenIndex: sessionCtx.chosenIndex }
            : { type: "none" },
          profile: buildLearnerProfile(state, questions) ?? undefined,
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
          // A rising cap_hit against a flat upgrade rate says the allowance is
          // the wrong size; a rising one alongside upgrades says it is working.
          track("tutor_cap_hit", { tier: state.tier, can_top_up: canTopUp });
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
      // Recorded once per answered message, before the body is read, so a
      // reply the learner abandons mid-stream still counts as served.
      track("tutor_message_sent", {
        provider: res.headers.get("x-tutor-provider") ?? "local",
        model,
        tier: state.tier,
        context: sessionCtx?.type ?? "none",
        with_image: Boolean(attached),
      });

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
    setHistoryOpen(false);
  }

  /** The same list the sidebar shows, so the phone sheet can't drift from it. */
  const threadList = (
    <div className="space-y-1">
      {state.tutorThreads.length === 0 && (
        <p className="px-2 py-4 text-xs text-muted-foreground">
          Your past conversations will appear here.
        </p>
      )}
      {state.tutorThreads.map((t) => (
        <button
          key={t.id}
          onClick={() => openThread(t)}
          className={cn(
            "press w-full truncate rounded-lg px-3 py-2.5 text-left text-sm",
            t.id === threadId
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
          )}
        >
          <span className="block truncate font-medium">{t.title}</span>
          <span className="block text-2xs opacity-70">
            {formatDate(t.updatedAt, { day: "numeric", month: "short" })}
          </span>
        </button>
      ))}
    </div>
  );

  const chips = sessionCtx ? CONTEXT_CHIPS : OPEN_CHIPS;
  // Only on a fresh, context-free thread: arriving from a specific question
  // already gives the tutor its opening, and re-opening an old thread should
  // show that thread, not a greeting.
  const opener = React.useMemo(
    () => (sessionCtx ? null : buildTutorOpener(state, questions)),
    [sessionCtx, state, questions],
  );

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] max-w-5xl gap-5">
      {/* Thread list */}
      <aside className="hidden w-60 shrink-0 flex-col lg:flex">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={newConversation}>
          <Plus className="h-4 w-4" /> New conversation
        </Button>
        <div className="mt-3 flex-1 overflow-y-auto">{threadList}</div>
      </aside>

      {/* Below `lg` the sidebar is display:none, which took every saved
          conversation with it — a phone could start threads but never reopen
          one. Same list, same handler, in the sheet the Dialog already gives us
          on small screens. */}
      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        label="Past conversations"
      >
        <h2 className="pr-8 font-display text-lg font-semibold tracking-tight">Conversations</h2>
        <div className="mt-3 max-h-[60dvh] overflow-y-auto">{threadList}</div>
      </Dialog>

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
          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            {state.tutorThreads.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryOpen(true)}
                aria-label="Past conversations"
              >
                <MessageSquareText className="h-4 w-4" />
                <span className="hidden xs:inline">History</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={newConversation}>
              <Plus className="h-4 w-4" /> New
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 &&
            (opener ? (
              // The tutor opens with what it noticed, rather than leaving the
              // learner to invent a question about material they don't know.
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                <div className="glass-subtle max-w-[85%] animate-fade-in rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-primary">
                    <Sparkles className="h-3 w-3" /> Tutor
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{opener.line}</p>
                </div>
                <Button size="sm" onClick={() => setInput(opener.prompt)}>
                  Yes, let&apos;s look at it
                </Button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <EmptyState
                  icon={<MessageSquareText className="h-6 w-6" />}
                  title="Ask me anything about the K53"
                  description="I explain the why behind each rule, give real examples, and never just dump the answer. Try a prompt below."
                />
              </div>
            ))}

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
              {imageError && (
                <div className="mb-2.5 rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-xs text-danger">
                  {imageError}
                </div>
              )}
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
                {canAttachImage && (
                  <>
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
                          setImageError(null);
                        } catch {
                          setImageError(
                            "That photo couldn't be read — try a different image (JPG or PNG works best).",
                          );
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
                  </>
                )}
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
                {cap.cap === Infinity
                  ? "Unlimited tutor messages"
                  : state.tier === "free"
                    ? `${Math.max(0, cap.cap - cap.used)} of ${cap.cap} free messages left`
                    : `${Math.max(0, cap.cap - cap.used)} of ${cap.cap} messages left today`}
              </p>
              {/*
                The caveat belongs here, at the point of answer. /terms carries
                the no-pass-guarantee clause, but a learner reading a wrong
                following distance never opens /terms — and on this subject a
                wrong answer costs them a test fee and a rebooking.
              */}
              {/*
                Full `text-muted-foreground`, not a dimmed variant: at /80 this
                measured 3.47:1 against the composer's glass, under the 4.5:1
                AA floor for small text. A disclaimer nobody can read is not a
                disclaimer.
              */}
              <p className="mt-1 text-center text-2xs text-muted-foreground">
                AI answers can be wrong — check anything surprising against the{" "}
                <Link href="/sources" className="underline underline-offset-2 hover:text-foreground">
                  official K53 manual
                </Link>
                .
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
