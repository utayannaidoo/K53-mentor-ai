import * as React from "react";
import { Check } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export function OptionCard({
  selected,
  onClick,
  icon,
  title,
  description,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        haptics.tap();
        onClick();
      }}
      aria-pressed={selected}
      className={cn(
        "press group relative flex w-full items-center gap-4 rounded-xl border-2 bg-card p-4 text-left",
        selected
          ? "border-primary bg-primary/[0.04] shadow-soft"
          : "border-border hover:border-primary/40",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
            selected ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{title}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
        )}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {selected && <Check className="h-3 w-3" />}
      </span>
    </button>
  );
}
