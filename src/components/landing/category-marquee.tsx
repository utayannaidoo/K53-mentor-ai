const CATEGORIES = [
  "Road signs",
  "Rules of the road",
  "Vehicle controls",
  "Intersections",
  "Parking",
  "Following distance",
  "Hazard awareness",
];

/**
 * Edge-masked, infinitely-scrolling strip of K53 categories. The list is
 * duplicated so the -50% keyframe loops seamlessly.
 */
export function CategoryMarquee() {
  const items = [...CATEGORIES, ...CATEGORIES];

  return (
    <section className="overflow-hidden py-12">
      <p className="mb-[22px] text-center text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Every part of the test, covered
      </p>
      <div className="relative [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max gap-3.5 motion-safe:animate-[k53marquee_32s_linear_infinite]">
          {items.map((cat, i) => (
            <span
              key={`${cat}-${i}`}
              className="glass inline-flex cursor-default items-center gap-2.5 whitespace-nowrap rounded-full px-[18px] py-[11px] text-[14.5px] font-medium text-foreground transition-transform duration-200 ease-glass hover:scale-110"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {cat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
