"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, glass } from "@/lib/utils";
import { acceptSchoolLink, leaveSchoolLink, peekSchoolLink } from "@/app/(app)/account/school/actions";

/**
 * Connect this account to a driving school's roster, with the learner's
 * consent given here and nowhere else.
 *
 * Two steps on purpose. The code alone says nothing about who will see what,
 * so the first step only finds out which school it belongs to; the second
 * shows exactly what crosses in each direction and asks. Nothing is shared
 * until "Share with …" is pressed.
 */
export function ConnectSchool() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [preview, setPreview] = React.useState<{ schoolName: string; learnerName: string } | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function check(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const result = await peekSchoolLink(code);
      if (result.ok) setPreview({ schoolName: result.schoolName, learnerName: result.learnerName });
      else setMessage(result.message);
    } catch {
      setMessage("You seem to be offline. Try again when you have signal.");
    }
    setBusy(false);
  }

  async function agree() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await acceptSchoolLink(code);
      if (result.ok) {
        setPreview(null);
        setCode("");
        router.refresh();
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage("You seem to be offline. Try again when you have signal.");
    }
    setBusy(false);
  }

  if (preview) {
    return (
      <Card className={cn(glass, "space-y-4 p-5")}>
        <div>
          <h2 className="font-display text-base font-semibold">Connect to {preview.schoolName}?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {preview.schoolName} has you on their list as {preview.learnerName}.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{preview.schoolName} will see</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>your readiness score, and the day it was last updated</li>
            <li>how strong you are in each part of the learner&apos;s test, as a percentage</li>
          </ul>
          <p className="text-muted-foreground">
            Nothing else: not your answers, your mock tests, your tutor chats, or when you study.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">You will see, here</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>your next lesson and pickup, and your instructor</li>
            <li>how you&apos;re rated on each yard-test manoeuvre</li>
            <li>notes your instructor chooses to share, and what you owe the school</li>
          </ul>
        </div>
        <p className="text-2xs text-muted-foreground">
          You can stop sharing at any time, and so can the school. If you haven&apos;t paid for K53
          Mentor and {preview.schoolName} is one of our partner schools, connecting also records them as
          the school that referred you.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" loading={busy} loadingText="Connecting…" onClick={agree} className="press">
            Share with {preview.schoolName}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setPreview(null);
              setMessage(null);
            }}
          >
            Cancel
          </Button>
        </div>
        {message ? (
          <p role="status" className="text-sm text-danger">
            {message}
          </p>
        ) : null}
      </Card>
    );
  }

  return (
    <Card className={cn(glass, "space-y-3 p-5")}>
      <div>
        <h2 className="font-display text-base font-semibold">Connect your driving school</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If your driving school uses K53 Mentor for Schools, ask them for a code. Nothing is shared until
          you&apos;ve seen exactly what and said yes.
        </p>
      </div>
      <form onSubmit={check} className="flex flex-wrap gap-2">
        <label htmlFor="school-link-code" className="sr-only">
          Code from your driving school
        </label>
        <Input
          id="school-link-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={12}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="8-character code"
          className="min-w-0 flex-1 font-mono uppercase tracking-wider"
        />
        <Button type="submit" variant="secondary" loading={busy} loadingText="Checking…" disabled={!code.trim()}>
          Continue
        </Button>
      </form>
      {message ? (
        <p role="status" className="text-sm text-danger">
          {message}
        </p>
      ) : null}
    </Card>
  );
}

/** Stop sharing with one school. */
export function LeaveSchool({ rosterId, schoolName }: { rosterId: string; schoolName: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function leave() {
    if (
      !window.confirm(
        `Stop sharing with ${schoolName}? They stop seeing your readiness, and your lessons stop showing here. You can connect again with a new code.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await leaveSchoolLink(rosterId);
      if (result.ok) router.refresh();
      else setMessage(result.message);
    } catch {
      setMessage("You seem to be offline. Try again when you have signal.");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-1">
      <Button type="button" variant="ghost" size="sm" loading={busy} loadingText="Stopping…" onClick={leave}>
        Stop sharing
      </Button>
      {message ? (
        <p role="status" className="text-sm text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}
