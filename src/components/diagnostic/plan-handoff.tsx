"use client";

import * as React from "react";
import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { categoryName } from "@/lib/content/categories";
import { LEAD_EMAIL_MAX } from "@/lib/leads/plan-lead";
import { SITE_DOMAIN, SUPPORT_EMAIL } from "@/lib/constants";
import { track } from "@/lib/analytics";
import type { CategoryId, VehicleCode } from "@/types";

/**
 * The other way off the results screen.
 *
 * Someone who has just seen their weakest section and does not want an account
 * yet had exactly one option: sign up. Most left, and nothing about them was
 * recoverable. Two lighter exits instead — send the plan to their inbox
 * (captured, with consent), or push it into WhatsApp (captured by nobody, and
 * the channel South African learners actually keep).
 *
 * WhatsApp here is a share link, not a message we send: sending would need the
 * Business API. It opens their own WhatsApp with the text ready, usually to
 * their own "Message yourself" chat.
 */
export function PlanHandoff({
  score,
  correct,
  total,
  weakCategories,
  vehicleCode,
}: {
  score: number;
  correct: number;
  total: number;
  weakCategories: CategoryId[];
  vehicleCode: VehicleCode;
}) {
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [status, setStatus] = React.useState<
    "idle" | "sending" | "sent" | "error" | "suppressed"
  >("idle");

  const focus = weakCategories.slice(0, 3).map(categoryName);
  const looksLikeEmail = /.+@.+\..+/.test(email.trim()) && email.trim().length <= LEAD_EMAIL_MAX;

  const whatsappText = [
    `My K53 starting check: ${correct}/${total} (${score}%).`,
    focus.length ? `Weakest first: ${focus.join(", ")}.` : null,
    `Plan and practice: ${SITE_DOMAIN}`,
  ]
    .filter(Boolean)
    .join(" ");

  async function send() {
    if (!looksLikeEmail || !consent || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/plan-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          consent: true,
          score,
          correct,
          total,
          weakCategories,
          vehicleCode,
        }),
      });
      if (res.ok) {
        setStatus("sent");
        track("cta_clicked", { location: "results_plan_emailed" });
      } else {
        // 409 means this address asked us to stop. "Try again in a moment" is
        // advice that can never work for the one person who opted out.
        setStatus(res.status === 409 ? "suppressed" : "error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card className="mt-6 p-6">
      <h2 className="font-display text-lg font-semibold">Not ready for an account?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Take the plan with you. {focus.length > 0 && `It starts with ${focus[0]}.`}
      </p>

      {status === "sent" ? (
        <p className="mt-4 rounded-xl border border-success/30 bg-success/[0.06] px-4 py-3 text-sm text-foreground">
          Sent. Check your inbox (and spam) for your plan — the link in it picks up right where
          you left off.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            maxLength={LEAD_EMAIL_MAX}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="Email address for your plan"
          />
          <div className="flex items-start gap-3">
            <Switch
              checked={consent}
              onChange={setConsent}
              label="Email me my plan and occasional study tips"
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              Email me my plan and the occasional study tip. One tap to unsubscribe, in every
              email.
            </span>
          </div>
          {status === "error" && (
            <p role="alert" className="text-xs text-danger">
              That didn&apos;t send. Try again in a moment, or create the free account instead —
              your plan is on this screen either way.
            </p>
          )}
          {status === "suppressed" && (
            <p role="alert" className="text-xs text-muted-foreground">
              This address asked us to stop emailing it, so we haven&apos;t sent anything. Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                {SUPPORT_EMAIL}
              </a>{" "}
              to opt back in, or create the free account — your plan is on this screen either way.
            </p>
          )}
          <Button
            className="w-full gap-2"
            disabled={!looksLikeEmail || !consent}
            loading={status === "sending"}
            loadingText="Sending"
            onClick={send}
          >
            <Mail className="h-4 w-4" /> Email me my plan
          </Button>
        </div>
      )}

      {/* No API, no data: opens their WhatsApp with the text ready to send. */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("cta_clicked", { location: "results_plan_whatsapp" })}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-3 text-sm font-semibold text-foreground transition-colors ease-soft hover:bg-muted/60"
      >
        <MessageCircle className="h-4 w-4" /> Send it to my WhatsApp
      </a>
    </Card>
  );
}
