"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/app/admin/actions";

/**
 * The one form wrapper every admin mutation uses.
 *
 * Each action returns an `ActionResult` rather than throwing, so the outcome —
 * including "not permitted" — is rendered in place instead of becoming an error
 * page. Money screens should never leave someone guessing whether the click
 * landed, so the result line is a `role="status"` that stays until the next
 * submit replaces it.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  variant = "default",
  className,
  confirm,
}: {
  action: (prev: ActionResult | null, form: FormData) => Promise<ActionResult>;
  children?: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  className?: string;
  /** Shown in a browser confirm before anything irreversible is submitted. */
  confirm?: string;
}) {
  const [result, formAction] = useActionState(action, null);
  return (
    <form
      action={formAction}
      className={cn("space-y-3", className)}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} pendingLabel={pendingLabel} variant={variant} />
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

function SubmitButton({
  label,
  pendingLabel,
  variant,
}: {
  label: string;
  pendingLabel?: string;
  variant: "default" | "secondary" | "outline" | "ghost" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} className="press">
      {pending ? (pendingLabel ?? "Working…") : label}
    </Button>
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
