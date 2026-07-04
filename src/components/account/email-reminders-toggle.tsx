"use client";

import * as React from "react";
import { BellRing } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";

/**
 * Opt-out for the study-reminder emails (streak, due reviews, comeback
 * nudges). The flag lives on profiles.email_notifications and is honoured by
 * the notification cron. Hidden entirely in local demo mode — there's no
 * backend to send from.
 */
export function EmailRemindersToggle() {
  const [supabase] = React.useState(() => createClient());
  const [enabled, setEnabled] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("email_notifications")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) setEnabled((data as { email_notifications: boolean | null } | null)?.email_notifications ?? true);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (!supabase || enabled === null) return null;

  async function toggle(value: boolean) {
    setEnabled(value); // optimistic — reverting on failure would feel jumpier than a rare silent miss
    const {
      data: { user },
    } = await supabase!.auth.getUser();
    if (!user) return;
    await supabase!.from("profiles").update({ email_notifications: value }).eq("id", user.id);
  }

  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <div className="flex items-start gap-2">
        <BellRing className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Email reminders</p>
          <p className="text-sm text-muted-foreground">
            Streak warnings, due reviews and a nudge if you drift away.
          </p>
        </div>
      </div>
      <Switch checked={enabled} onChange={toggle} label="Email reminders" />
    </div>
  );
}
