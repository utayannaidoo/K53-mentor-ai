import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { signImageDimensions } from "@/lib/content/signs-dimensions";
import { SIGN_FAMILY_COPY } from "@/lib/content/sign-pages";
import {
  sectionAnchor,
  signsInGroup,
  type SignEntryData,
  type SignGroup,
} from "@/lib/content/sign-category-pages";

/**
 * One sign on a public road-sign page: picture, name and meaning.
 *
 * The id is the sign's old page slug, so /road-signs/<slug> can redirect to
 * the anchor that now shows it (see next.config.mjs). scroll-mt clears the
 * sticky marketing nav when the browser jumps there.
 */
export function SignEntry({
  slug,
  sign,
  headingLevel = 3,
}: SignEntryData & { headingLevel?: 3 | 4 }) {
  const dims = signImageDimensions(sign.image) ?? { w: 400, h: 400 };
  const Heading = `h${headingLevel}` as const;
  return (
    <article id={slug} className="flex scroll-mt-24 items-start gap-4 py-5 sm:gap-6">
      <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-2 sm:h-24 sm:w-24">
        <Image
          src={sign.image}
          alt={`${sign.name}, a South African ${SIGN_FAMILY_COPY[sign.category].noun}`}
          width={dims.w}
          height={dims.h}
          sizes="96px"
          className="h-full w-full object-contain"
        />
      </span>
      <div className="min-w-0">
        <Heading className="font-display text-base font-semibold tracking-tight text-foreground">
          {sign.name}
        </Heading>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{sign.meaning}</p>
      </div>
    </article>
  );
}

/**
 * A group's signs, one section per manual subcategory, each with its intro.
 *
 * `headingLevel` is the level of the section headings; sign names sit one
 * below. `afterFirst` renders between the first and second sections, which is
 * where the category pages put their ad.
 */
export function SignSections({
  group,
  headingLevel = 2,
  afterFirst,
}: {
  group: SignGroup;
  headingLevel?: 2 | 3;
  afterFirst?: React.ReactNode;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <>
      {signsInGroup(group).map(({ section, signs }, i) =>
        signs.length === 0 ? null : (
          <React.Fragment key={section.heading}>
            <section id={sectionAnchor(section)} className="mt-12 scroll-mt-24">
              <Heading
                className={cn(
                  "font-display font-semibold tracking-tight",
                  headingLevel === 2 ? "text-xl" : "text-lg",
                )}
              >
                {section.heading}
              </Heading>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {section.intro}
              </p>
              <div className="mt-4 divide-y divide-border border-y border-border">
                {signs.map((entry) => (
                  <SignEntry
                    key={entry.slug}
                    {...entry}
                    headingLevel={headingLevel === 2 ? 3 : 4}
                  />
                ))}
              </div>
            </section>
            {i === 0 && afterFirst}
          </React.Fragment>
        ),
      )}
    </>
  );
}
