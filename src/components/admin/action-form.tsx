"use client";

import * as React from "react";
import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/forms/action-result";

/**
 * The one form wrapper every admin and school mutation uses.
 *
 * Each action returns an `ActionResult` rather than throwing, so the outcome —
 * including "not permitted" — is rendered in place instead of becoming an error
 * page. Money screens should never leave someone guessing whether the click
 * landed, so the result line is a `role="status"` that stays until the next
 * submit replaces it.
 *
 * Submitted by hand rather than through `<form action>`, on purpose. React 19
 * resets a form automatically once its action settles — whatever the result.
 * On a failed save that silently wipes everything someone typed: a lesson
 * record's summary, every rating and fault, gone because the signal dropped.
 * Here the form is cleared only when the action says it succeeded.
 *
 * The button stays disabled until the page is interactive. Before hydration a
 * tap would fall through to a native submit, which puts every field — learner
 * names, phone numbers — into the URL's query string.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  variant = "default",
  className,
  confirm,
  resetOnSuccess = true,
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;
  children?: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  className?: string;
  /** Shown in a browser confirm before anything irreversible is submitted. */
  confirm?: string;
  /** Clear the fields after a successful submit. Off for forms that edit a record in place. */
  resetOnSuccess?: boolean;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  const [result, dispatch, pending] = useActionState(
    async (previous: ActionResult | null, data: FormData) => {
      const outcome = await action(previous, data);
      if (outcome.ok && resetOnSuccess) formRef.current?.reset();
      return outcome;
    },
    null,
  );

  return (
    <form
      ref={formRef}
      method="post"
      className={cn("space-y-3", className)}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        if (confirm && !window.confirm(confirm)) return;
        const data = new FormData(event.currentTarget);
        React.startTransition(() => dispatch(data));
      }}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant={variant} disabled={!hydrated || pending} className="press">
          {pending ? (pendingLabel ?? "Working…") : submitLabel}
        </Button>
        {result ? (
          <p
            role="status"
            className={cn("text-sm", result.ok ? "text-success" : "text-danger")}
          >
            {result.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

/** A labelled field, so the admin forms stay accessible without ceremony. */
export function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  required,
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  const id = `${name}-${React.useId()}`;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        autoCapitalize="none"
        className="flex h-10 w-full rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
      />
      {hint ? <p className="text-2xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
