"use client";

import * as React from "react";
import { Select } from "@/components/ui/select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Day/month/year dropdown trio that composes an ISO ("yyyy-mm-dd") date string. */
export function DateSelect({
  value,
  onChange,
  disabled,
  yearsAhead = 3,
}: {
  value: string; // "" (unset) or "yyyy-mm-dd"
  onChange: (value: string) => void;
  disabled?: boolean;
  yearsAhead?: number;
}) {
  const today = new Date();
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  const year = parsed ? parsed.getFullYear() : today.getFullYear();
  const month = parsed ? parsed.getMonth() : today.getMonth();
  const day = parsed ? parsed.getDate() : today.getDate();

  function set(next: { year?: number; month?: number; day?: number }) {
    const y = next.year ?? year;
    const m = next.month ?? month;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const d = Math.min(next.day ?? day, daysInMonth);
    onChange(`${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const years = Array.from({ length: yearsAhead }, (_, i) => today.getFullYear() + i);

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        disabled={disabled}
        value={String(day)}
        onChange={(v) => set({ day: Number(v) })}
        ariaLabel="Day"
        options={Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => ({
          value: String(d),
          label: String(d),
        }))}
      />
      <Select
        disabled={disabled}
        value={String(month)}
        onChange={(v) => set({ month: Number(v) })}
        ariaLabel="Month"
        options={MONTHS.map((m, i) => ({ value: String(i), label: m }))}
      />
      <Select
        disabled={disabled}
        value={String(year)}
        onChange={(v) => set({ year: Number(v) })}
        ariaLabel="Year"
        options={years.map((y) => ({ value: String(y), label: String(y) }))}
      />
    </div>
  );
}
