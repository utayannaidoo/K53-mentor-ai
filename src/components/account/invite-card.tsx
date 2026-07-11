"use client";

import * as React from "react";
import { Gift, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";
import { cn, glass } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * Invite-a-friend card: shows the learner's referral link and how many
 * friends joined through it. Both sides get 250 CP — progression, not money,
 * so there's nothing here worth defrauding.
 */
export function InviteCard() {
  const [data, setData] = React.useState<{ code: string; referrals: number; reward: number } | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetch("/api/referral")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.code && setData(j))
      .catch(() => {});
  }, []);

  if (!isSupabaseConfigured || !data) return null;

  const link = `${window.location.origin}/signup?ref=${data.code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      track("referral_link_copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Card className={cn(glass, "p-6")}>
      <div className="flex items-center gap-2.5">
        <Gift className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold">Invite a friend</h2>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        You each get <span className="font-semibold text-foreground">+{data.reward} CP</span> when
        a friend signs up with your link
        {data.referrals > 0 && (
          <>
            {" "}
            — <span className="font-semibold text-foreground">{data.referrals}</span>{" "}
            {data.referrals === 1 ? "friend has" : "friends have"} joined so far
          </>
        )}
        .
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs">
          {link}
        </code>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </Card>
  );
}
