import { CountUp } from "@/components/landing/count-up";
import { PASS_RATE_BEFORE, PASS_RATE_NOW } from "@/lib/constants";

/**
 * Compact single-stat band: the national learner's-licence pass rate under the
 * RTMC's computerised test.
 *
 * Honesty rules for this band, learned the hard way:
 * - The 68% → 40% figures are real RTMC data (May 2026 reporting — see
 *   constants.ts). They are the OVERALL pass rate, not a first-attempt one,
 *   so the copy may not say "first attempt".
 * - No invented causality. An earlier draft claimed "most fail because they
 *   study everything equally" — nothing in the source says why individuals
 *   fail. The section pass-mark sentence below carries the same persuasive
 *   weight using only the official exam format (EXAM_FORMAT).
 */
export function Problem() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-12">
      <div className="glass-subtle flex flex-wrap items-center justify-center gap-x-10 gap-y-3.5 rounded-[20px] px-[30px] py-[26px] text-center">
        <div className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-semibold leading-none tracking-[-0.02em] text-danger">
          <CountUp value={PASS_RATE_NOW} suffix="%" />
        </div>
        <p className="max-w-[560px] text-pretty text-[1.05rem] leading-[1.5] text-muted-foreground">
          of learners pass South Africa&apos;s computerised learner&apos;s test — down from{" "}
          {PASS_RATE_BEFORE}% before it went digital (RTMC, 2026). And there&apos;s no averaging
          your way through: signs, rules and controls must{" "}
          <em className="not-italic text-foreground">each</em> clear their own pass mark.
        </p>
      </div>
    </section>
  );
}
