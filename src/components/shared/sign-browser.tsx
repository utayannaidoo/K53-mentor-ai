"use client";

import * as React from "react";
import Image from "next/image";
import { Search, Octagon, AlertTriangle, Info, Signpost, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SIGN_CATEGORIES } from "@/lib/content/sign-categories";
import {
  traitsFor,
  SHAPE_FILTERS,
  COLOUR_FILTERS,
  type SignShape,
  type SignColour,
} from "@/lib/content/sign-traits";
import type { RoadSign, SignCategory } from "@/types";

/**
 * Search + filter + grid + detail dialog over a set of road signs.
 *
 * Presentational and set-agnostic on purpose: the in-app library passes the full
 * catalogue, while the public /road-signs page passes only the hand-verified
 * subset (see VERIFIED_NAME_IDS). Everything that differs between the two —
 * page chrome, headings, calls to action — belongs to the caller.
 *
 * Category counts come from the `signs` prop rather than the catalogue, so a
 * filtered set never advertises signs it will not show.
 */

const CAT_ICON: Record<SignCategory, typeof Octagon> = {
  regulatory: Octagon,
  warning: AlertTriangle,
  information: Info,
  guidance: Signpost,
  marking: Minus,
};

type Filter = SignCategory | "all";

export function SignBrowser({
  signs,
  initialFilter = "regulatory",
}: {
  signs: RoadSign[];
  initialFilter?: Filter;
}) {
  const [filter, setFilter] = React.useState<Filter>(initialFilter);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<RoadSign | null>(null);
  // Shape and colour are what a learner actually retains from a roadside
  // glance — "it was a red triangle" — so they're the two filters that match
  // how someone searches when they never knew the sign's name.
  const [shape, setShape] = React.useState<SignShape | null>(null);
  const [colour, setColour] = React.useState<SignColour | null>(null);

  const countByCategory = React.useMemo(() => {
    const counts = new Map<SignCategory, number>();
    for (const s of signs) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    return counts;
  }, [signs]);

  // A set trimmed to the verified subset can empty a whole category, and
  // "regulatory" is only the right default while it still has signs in it.
  const categories = React.useMemo(
    () => SIGN_CATEGORIES.filter((c) => (countByCategory.get(c.id) ?? 0) > 0),
    [countByCategory],
  );

  React.useEffect(() => {
    if (filter !== "all" && (countByCategory.get(filter) ?? 0) === 0) {
      setFilter(categories[0]?.id ?? "all");
    }
  }, [filter, countByCategory, categories]);

  const q = query.trim().toLowerCase();
  const results = React.useMemo(() => {
    return signs.filter((s) => {
      if (filter !== "all" && s.category !== filter) return false;
      if (shape || colour) {
        const t = traitsFor(s);
        if (shape && t.shape !== shape) return false;
        if (colour && t.colour !== colour) return false;
      }
      if (q && !`${s.name} ${s.meaning} ${s.subcategory}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [signs, q, filter, shape, colour]);

  // group results by subcategory for tidy section headers
  const groups = React.useMemo(() => {
    const map = new Map<string, RoadSign[]>();
    for (const s of results) {
      const key = `${s.category}__${s.subcategory || "General"}`;
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [results]);

  return (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {/* id/name kept from the in-app library: an unlabelled search box is
            what browsers offer to autofill with an address. */}
        <Input
          id="sign-search"
          name="sign-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search signs — e.g. stop, no entry, pedestrians, freeway"
          className="pl-10"
          aria-label="Search road signs"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All <span className="text-xs opacity-70">{signs.length}</span>
        </Chip>
        {categories.map((c) => {
          const Icon = CAT_ICON[c.id];
          return (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              <Icon className="h-3.5 w-3.5" /> {c.label}
              <span className="text-xs opacity-70">{countByCategory.get(c.id) ?? 0}</span>
            </Chip>
          );
        })}
      </div>

      {/* "What did it look like?" — the way you search when you saw a sign on
          the road and never knew its name. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Shape
        </span>
        {SHAPE_FILTERS.map((s) => (
          <Chip
            key={s.id}
            active={shape === s.id}
            onClick={() => setShape(shape === s.id ? null : s.id)}
          >
            {s.label}
          </Chip>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Colour
        </span>
        {COLOUR_FILTERS.map((c) => (
          <Chip
            key={c.id}
            active={colour === c.id}
            onClick={() => setColour(colour === c.id ? null : c.id)}
          >
            {c.label}
          </Chip>
        ))}
        {(shape || colour) && (
          <button
            type="button"
            onClick={() => {
              setShape(null);
              setColour(null);
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {filter !== "all" && !q && !shape && !colour && (
        <p className="mt-4 text-sm text-muted-foreground">
          {SIGN_CATEGORIES.find((c) => c.id === filter)?.blurb}
        </p>
      )}

      {results.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No signs found"
            description="Try a different word, or switch category."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map(([key, group]) => (
            <section key={key}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {key.split("__")[1]}
                <span className="ml-2 font-normal lowercase opacity-60">{group.length}</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s)}
                    className="press group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-2xl"
                  >
                    <Card className="hover-elevate flex h-full flex-col items-center gap-3 p-4">
                      <span className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2">
                        {/* Decorative here: the sign name is rendered as text
                            directly below, and it is the button's accessible
                            name — a matching alt makes a screen reader
                            announce every sign in the grid twice. */}
                        <Image
                          src={s.image}
                          alt=""
                          width={192}
                          height={192}
                          sizes="120px"
                          className="h-full w-full object-contain"
                        />
                      </span>
                      <span className="line-clamp-2 text-center text-xs font-medium leading-snug text-foreground">
                        {s.name}
                      </span>
                    </Card>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={active !== null} onClose={() => setActive(null)} label="Sign details">
        {active && (
          <div className="text-center">
            <span className="mx-auto flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-4">
              <Image
                src={active.image}
                alt={active.name}
                width={320}
                height={320}
                sizes="320px"
                className="h-full w-full object-contain"
              />
            </span>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {active.category}
              </Badge>
              {active.subcategory && (
                <span className="text-xs text-muted-foreground">{active.subcategory}</span>
              )}
            </div>
            <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">{active.name}</h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              {active.meaning}
            </p>
            <p className="mt-4 text-2xs uppercase tracking-wide text-muted-foreground/70">
              Source · K53 manual, page {active.page}
            </p>
          </div>
        )}
      </Dialog>
    </>
  );
}
