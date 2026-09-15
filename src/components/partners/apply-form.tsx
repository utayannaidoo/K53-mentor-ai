"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, glassFloat } from "@/lib/utils";

/**
 * The join form on /for-driving-schools. Plain fetch rather than a server
 * action: this page is statically rendered marketing, and the endpoint it posts
 * to is already rate-limited and validated.
 */
export function PartnerApplyForm() {
  const [status, setStatus] = React.useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = React.useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          contactName: form.get("contactName"),
          contactEmail: form.get("contactEmail"),
          contactPhone: form.get("contactPhone") || undefined,
          town: form.get("town") || undefined,
          province: form.get("province") || undefined,
          learnersPerMonth: form.get("learnersPerMonth") || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("done");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error ?? "We couldn't submit that. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("We couldn't reach the server. Please try again in a moment.");
    }
  }

  if (status === "done") {
    return (
      <Card className={cn(glassFloat, "p-6")} role="status">
        <h3 className="font-display text-lg font-semibold">You&apos;re on the list</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </Card>
    );
  }

  return (
    <Card className={cn(glassFloat, "p-6")}>
      <h3 className="font-display text-lg font-semibold">Join the programme</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        No contract, no cost. We&apos;ll send your code and link once we&apos;ve said hello.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Driving school name" name="name" required />
          <Field label="Your name" name="contactName" required />
          <Field label="Email" name="contactEmail" type="email" required />
          <Field label="Phone" name="contactPhone" type="tel" />
          <Field label="Town" name="town" />
          <Field label="Province" name="province" />
        </div>
        <Field
          label="Roughly how many learners do you teach a month?"
          name="learnersPerMonth"
          placeholder="e.g. 20"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={status === "sending"} className="press">
            {status === "sending" ? "Sending…" : "Apply"}
          </Button>
          {status === "error" && (
            <p role="status" className="text-sm text-danger">
              {message}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const id = `partner-${name}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
      />
    </div>
  );
}
