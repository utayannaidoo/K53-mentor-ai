"use client";

import * as React from "react";
import { Select } from "@/components/ui/select";
import { clampDate, localIsoDate } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Day/month/year dropdown trio that composes an ISO ("yyyy-mm-dd") date string.
 *
 * Never offers a day before `min` (today, unless told otherwise): the dates this
 * picker sets are test dates, and a test cannot be booked into the past. Options
 * earlier than the floor are dropped rather than merely rejected on save, so the
 * only reachable dates are the valid ones.
 */
export function DateSelect({
  value,
  onChange,
  disabled,
  yearsAhead = 3,
  min = localIsoDate(),
}: {
  value: string; // "" (unset) or "yyyy-mm-dd"
  onChange: (value: string) => void;
  disabled?: boolean;
  yearsAhead?: number;
  /** Earliest selectable day, "yyyy-mm-dd". Defaults to today. */
  min?: string;
}) {
  const floor = new Date(`${min}T00:00:00`);
  // A stored date from before the floor (a test that has since been sat) shows
  // the floor instead, so what the trio reads is always something selectable.
  const parsed = new Date(`${clampDate(value || min, min)}T00:00:00`);
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const day = parsed.getDate();

  function set(next: { year?: number; month?: number; day?: number }) {
    const y = next.year ?? year;
    const m = next.month ?? month;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const d = Math.min(next.day ?? day, daysInMonth);
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    // Changing year or month can land the day itself before the floor — e.g.
    // dropping back to the current month with the 3rd still selected.
    onChange(clampDate(iso, min));
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = year === floor.getFullYear() && month === floor.getMonth() ? floor.getDate() : 1;
  const firstMonth = year === floor.getFullYear() ? floor.getMonth() : 0;
  const years = Array.from({ length: yearsAhead }, (_, i) => floor.getFullYear() + i);

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        disabled={disabled}
        value={String(day)}
        onChange={(v) => set({ day: Number(v) })}
        ariaLabel="Day"
        options={Array.from({ length: daysInMonth - firstDay + 1 }, (_, i) => i + firstDay).map((d) => ({
          value: String(d),
          label: String(d),
        }))}
      />
      <Select
        disabled={disabled}
        value={String(month)}
        onChange={(v) => set({ month: Number(v) })}
        ariaLabel="Month"
        options={MONTHS.slice(firstMonth).map((m, i) => ({
          value: String(i + firstMonth),
          label: m,
        }))}
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
