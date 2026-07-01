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
        value={day}
        onChange={(e) => set({ day: Number(e.target.value) })}
        aria-label="Day"
      >
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </Select>
      <Select
        disabled={disabled}
        value={month}
        onChange={(e) => set({ month: Number(e.target.value) })}
        aria-label="Month"
      >
        {MONTHS.map((m, i) => (
          <option key={m} value={i}>{m}</option>
        ))}
      </Select>
      <Select
        disabled={disabled}
        value={year}
        onChange={(e) => set({ year: Number(e.target.value) })}
        aria-label="Year"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </Select>
    </div>
  );
}
