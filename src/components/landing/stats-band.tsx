import { CountUp } from "@/components/landing/count-up";

const STATS = [
  { value: 15, label: "question diagnostic" },
  { value: 68, label: "question mock exam" },
  { value: 7, label: "K53 categories" },
  { value: 10, label: "minutes a day" },
];

export function StatsBand() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-12">
      <div className="glass-subtle grid gap-[18px] rounded-[22px] px-[30px] py-9 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-mono text-[clamp(2.2rem,5vw,3rem)] font-semibold leading-none tracking-[-0.03em] text-primary">
              <CountUp value={s.value} />
            </div>
            <div className="mt-2 text-[0.9rem] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
