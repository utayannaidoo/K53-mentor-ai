"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The select and textarea companions to `Field` in
 * src/components/admin/action-form.tsx — same label, same control height and
 * focus ring, so a form mixing all three reads as one thing.
 */

const CONTROL =
  "flex w-full rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/60";

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  required,
  hint,
  className,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
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
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={cn(CONTROL, "h-10")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <p className="text-2xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 3,
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  const id = `${name}-${React.useId()}`;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className={cn(CONTROL, "min-h-20 resize-y")}
      />
      {hint ? <p className="text-2xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
