"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Octagon, AlertTriangle, Info, Signpost, Minus } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SIGNS, SIGN_CATEGORIES, signsByCategory } from "@/lib/content/signs";
import { cn } from "@/lib/utils";
import type { RoadSign, SignCategory } from "@/types";

const CAT_ICON: Record<SignCategory, typeof Octagon> = {
  regulatory: Octagon,
  warning: AlertTriangle,
  information: Info,
  guidance: Signpost,
  marking: Minus,
};

type Filter = SignCategory | "all";

export function SignLibrary() {
  const [filter, setFilter] = React.useState<Filter>("regulatory");
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<RoadSign | null>(null);

  const q = query.trim().toLowerCase();
  const results = React.useMemo(() => {
    return SIGNS.filter((s) => {
      if (filter !== "all" && s.category !== filter) return false;
      if (q && !`${s.name} ${s.meaning} ${s.subcategory}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [q, filter]);

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
    <div className="mx-auto max-w-5xl">
      <Link
        href="/study"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Study
      </Link>
      <PageHeader
        title="Road signs"
        description="Every official South African sign from the K53 manual — browse, search and learn what each one means."
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search signs — e.g. stop, no entry, pedestrians, freeway"
          className="pl-10"
          aria-label="Search road signs"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All <span className="text-xs opacity-70">{SIGNS.length}</span>
        </Chip>
        {SIGN_CATEGORIES.map((c) => {
          const Icon = CAT_ICON[c.id];
          return (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              <Icon className="h-3.5 w-3.5" /> {c.label}
              <span className="text-xs opacity-70">{signsByCategory(c.id).length}</span>
            </Chip>
          );
        })}
      </div>

      {filter !== "all" && !q && (
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
          {groups.map(([key, signs]) => (
            <section key={key}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {key.split("__")[1]}
                <span className="ml-2 font-normal lowercase opacity-60">{signs.length}</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {signs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s)}
                    className="press group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-2xl"
                  >
                    <Card className="hover-elevate flex h-full flex-col items-center gap-3 p-4">
                      <span className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2">
                        <Image
                          src={s.image}
                          alt={s.name}
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
    </div>
  );
}
