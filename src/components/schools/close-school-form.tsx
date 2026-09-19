"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/forms/action-result";

/**
 * Typed confirmation for closing a school.
 *
 * Not an ActionForm: a closed school has no workspace to render the result
 * in, so success leaves the page altogether (a full load, so nothing cached
 * about the old school survives in the client). The button stays disabled
 * until the name is typed exactly, and the server checks it again.
 */
export function CloseSchoolForm({
  schoolName,
  action,
}: {
  schoolName: string;
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;
}) {
  const [typed, setTyped] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const matches = typed.trim().toLowerCase() === schoolName.trim().toLowerCase();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matches || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await action(null, new FormData(event.currentTarget));
      if (result.ok) {
        window.location.assign("/schools/start?closed=1");
        return;
      }
      setMessage(result.message);
    } catch {
      setMessage("You seem to be offline. Nothing was closed; try again when you have signal.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="close-confirm" className="block text-sm font-medium">
          Type <span className="font-semibold">{schoolName}</span> to confirm
        </label>
        <Input
          id="close-confirm"
          name="confirm"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="danger" disabled={!matches} loading={busy} loadingText="Closing…" className="press">
          Close the school permanently
        </Button>
        {message ? (
          <p role="status" className="text-sm text-danger">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
