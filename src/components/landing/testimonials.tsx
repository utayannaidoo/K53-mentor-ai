import { Star, Quote } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

// Illustrative testimonials for the MVP. Replace with verified reviews at launch.
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I'd failed twice before. The diagnostic showed me I was actually fine on signs but terrible at intersections — I'd been studying the wrong things the whole time. Passed with 61/64.",
    name: "Lerato M.",
    role: "Johannesburg · Code 8",
    rating: 5,
  },
  {
    quote:
      "The tutor is the difference. When I got a following-distance question wrong it actually explained the two-second rule with an example instead of just showing the answer.",
    name: "Sipho N.",
    role: "Durban · Code 10",
    rating: 5,
  },
  {
    quote:
      "Ten minutes a day on the train. The streak kept me honest and the readiness score climbing from 52% to 84% made it feel like real progress, not guessing.",
    name: "Chantelle P.",
    role: "Cape Town · Code 8",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Loved by learners</p>
        <h2 className="mt-2 text-balance font-display text-3xl font-semibold tracking-tight">
          Less anxiety. More passes.
        </h2>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-soft"
          >
            <Quote className="h-6 w-6 text-primary/30" />
            <div className="mt-2 flex">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              <Avatar name={t.name} />
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
