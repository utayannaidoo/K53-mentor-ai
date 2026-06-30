import { Reveal } from "@/components/shared/reveal";
import { Stagger } from "@/components/shared/stagger";

interface Testimonial {
  initials: string;
  name: string;
  place: string;
  quote: string;
}

// Illustrative testimonials for the MVP. Replace with verified reviews at launch.
const TESTIMONIALS: Testimonial[] = [
  {
    initials: "TM",
    name: "Thabo M.",
    place: "Johannesburg",
    quote:
      "I'd failed twice. The diagnostic showed me I was guessing on signs — two weeks later I passed first try.",
  },
  {
    initials: "AP",
    name: "Aisha P.",
    place: "Cape Town",
    quote:
      "The yard-test cook mode is the only reason I didn't stall on the incline. Step by step, exactly what the examiner wants.",
  },
  {
    initials: "LB",
    name: "Liam vd Berg",
    place: "Durban",
    quote:
      "Ten minutes on the train every morning. The streak kept me honest and the score kept climbing.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <Reveal className="mx-auto mb-10 max-w-[560px] text-center">
        <h2 className="text-balance font-display text-[clamp(2rem,4.4vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
          Passed, first time.
        </h2>
      </Reveal>

      <Stagger
        className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]"
        step={90}
      >
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="glass m-0 h-full rounded-[18px] p-[26px]">
            <blockquote className="text-pretty text-[1.02rem] font-medium leading-[1.55]">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-[18px] flex items-center gap-[11px]">
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-primary-light to-primary font-display text-sm font-semibold text-white">
                {t.initials}
              </span>
              <div>
                <div className="text-sm font-semibold leading-tight">{t.name}</div>
                <div className="mt-0.5 text-[0.82rem] text-muted-foreground">{t.place}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </Stagger>
    </section>
  );
}
