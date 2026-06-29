import { CountUp } from "@/components/landing/count-up";

/**
 * Compact single-stat band: only ~4 in 10 pass first time, because most study
 * everything equally instead of their weak spots. Mirrors the design's
 * glass-pill problem statement.
 */
export function Problem() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 pb-2.5 pt-[30px]">
      <div className="glass-subtle flex flex-wrap items-center justify-center gap-x-10 gap-y-3.5 rounded-[20px] px-[30px] py-[26px] text-center">
        <div className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-semibold leading-none tracking-[-0.02em] text-danger">
          <CountUp value={4} suffix=" in 10" />
        </div>
        <p className="max-w-[560px] text-pretty text-[1.05rem] leading-[1.5] text-muted-foreground">
          people pass the learner&apos;s test on their first attempt. Most fail because they study{" "}
          <em className="not-italic text-foreground">everything equally</em> instead of their actual
          weak spots.
        </p>
      </div>
    </section>
  );
}
