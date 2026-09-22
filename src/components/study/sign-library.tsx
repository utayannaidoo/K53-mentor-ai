"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { SignBrowser } from "@/components/shared/sign-browser";
import { SIGNS } from "@/lib/content/signs";

/**
 * The in-app sign library: the full catalogue, inside the app shell.
 *
 * The browsing itself lives in <SignBrowser>, shared with the public
 * /road-signs page. The two differ only in chrome and in which signs they are
 * allowed to show — this one gets everything, including the derived names that
 * are fine as a study aid but not fit to index.
 */

export function SignLibrary() {
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
      <SignBrowser signs={SIGNS} />
    </div>
  );
}
