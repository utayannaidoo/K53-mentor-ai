"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { passwordRules } from "@/lib/auth/password";

/**
 * Live checklist of the password policy, shown under a new-password field.
 * Each rule turns from muted to success as the typed password satisfies it —
 * inline feedback that mirrors the server-enforced Supabase Auth policy.
 */
export function PasswordRequirements({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-1.5", className)} aria-label="Password requirements">
      {passwordRules(password).map((rule) => (
        <li
          key={rule.label}
          className={cn(
            "flex items-center gap-1.5 text-2xs transition-colors",
            rule.ok ? "text-success" : "text-muted-foreground",
          )}
        >
          <Check className={cn("h-3 w-3 shrink-0 transition-opacity", rule.ok ? "opacity-100" : "opacity-30")} />
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
