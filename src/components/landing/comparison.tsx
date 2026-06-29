import { Check, X } from "lucide-react";

type CellValue = boolean | string;

const ROWS: { feature: string; values: [CellValue, CellValue, CellValue] }[] = [
  { feature: "Free to start", values: [true, true, false] },
  { feature: "Personalised AI diagnostic", values: [true, false, false] },
  { feature: "Readiness score & pass prediction", values: [true, false, false] },
  { feature: "Spaced repetition that adapts to you", values: [true, "Some", false] },
  { feature: "AI tutor that explains your mistakes", values: [true, false, false] },
  { feature: "Scenario-based judgement training", values: [true, false, "Some"] },
  { feature: "Full 68-question mock exam", values: [true, "Some", false] },
  { feature: "Targets your weakest categories", values: [true, false, false] },
  { feature: "Driver's (yard) test prep", values: [true, false, "Varies"] },
  { feature: "10-minute daily study plan", values: [true, false, false] },
];

function Cell({ value }: { value: CellValue }) {
  if (value === true)
    return <Check className="mx-auto h-[18px] w-[18px] text-success" strokeWidth={3} aria-label="Yes" />;
  if (value === false)
    return <X className="mx-auto h-[18px] w-[18px] text-danger" strokeWidth={2.6} aria-label="No" />;
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

export function Comparison() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <div className="mb-10 max-w-[620px]">
        <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
          How we compare
        </span>
        <h2 className="mt-3 text-balance font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
          Everything the free apps and books leave out.
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="px-5 py-4 text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Feature
              </th>
              <th className="rounded-t-2xl border-b-2 border-accent bg-primary/[0.07] px-5 py-4 text-center font-display text-[15px] font-semibold">
                K53 Mentor AI
              </th>
              <th className="px-5 py-4 text-center text-[15px] font-medium text-muted-foreground">
                Free apps
              </th>
              <th className="px-5 py-4 text-center text-[15px] font-medium text-muted-foreground">
                Study book
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => {
              const last = i === ROWS.length - 1;
              const alt = i % 2 === 1 ? "bg-card/30" : "";
              return (
                <tr key={row.feature} className="group">
                  <td
                    className={`border-t border-border/40 px-5 py-3.5 text-[0.95rem] font-medium transition-colors duration-200 group-hover:bg-foreground/[0.035] ${alt}`}
                  >
                    {row.feature}
                  </td>
                  <td
                    className={`bg-primary/[0.07] px-5 py-3.5 text-center transition-colors duration-200 group-hover:bg-primary/[0.13] ${last ? "rounded-b-2xl" : ""}`}
                  >
                    <Cell value={row.values[0]} />
                  </td>
                  <td className={`border-t border-border/40 px-5 py-3.5 text-center transition-colors duration-200 group-hover:bg-foreground/[0.035] ${alt}`}>
                    <Cell value={row.values[1]} />
                  </td>
                  <td className={`border-t border-border/40 px-5 py-3.5 text-center transition-colors duration-200 group-hover:bg-foreground/[0.035] ${alt}`}>
                    <Cell value={row.values[2]} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
