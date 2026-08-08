import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const ROOT = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(ROOT, p), "utf8");

describe("robots", () => {
  const rule = robots().rules;
  const disallow = (Array.isArray(rule) ? rule[0] : rule).disallow as string[];

  it("disallows every route the middleware protects", () => {
    // These need auth, so a crawler only ever sees the login redirect. Letting
    // them into the index spends crawl budget on a bounce and can surface an
    // app URL as a search result that nobody can open.
    const mw = read("src/lib/supabase/middleware.ts");
    const protectedList = mw.match(/const PROTECTED = \[([^\]]*)\]/)?.[1] ?? "";
    const routes = [...protectedList.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      expect(disallow, `${route} is protected but crawlable`).toContain(route);
    }
  });

  it("disallows the API and the post-signup handoff routes", () => {
    for (const route of ["/api/", "/onboarding", "/diagnostic", "/welcome", "/continue"]) {
      expect(disallow).toContain(route);
    }
  });

  it("never disallows a marketing route — those exist to be found", () => {
    for (const route of ["/", "/pricing", "/guides", "/privacy", "/terms"]) {
      expect(disallow).not.toContain(route);
    }
  });

  it("only names routes that actually exist", () => {
    // A stale disallow entry is invisible: it protects nothing and nobody
    // notices the route it referred to was renamed.
    const routes = new Set(
      readdirSync(path.join(ROOT, "src/app/(app)"), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => `/${d.name}`),
    );
    for (const entry of disallow) {
      if (entry === "/api/") continue;
      expect(routes, `robots disallows ${entry}, which is not a route`).toContain(entry);
    }
  });
});

describe("structured data", () => {
  it("the FAQ emits one Question per rendered item", () => {
    // The schema is derived from FAQ_ITEMS rather than duplicated, so this
    // guards the derivation, not the content.
    const src = read("src/components/landing/faq.tsx");
    expect(src).toContain('"@type": "FAQPage"');
    expect(src).toContain("mainEntity: FAQ_ITEMS.map");
    expect(src).toContain('"@type": "Answer"');
  });

  it("every guide claims its own Article schema, with a slug that matches its route", () => {
    const dir = path.join(ROOT, "src/app/guides");
    const guides = readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    expect(guides.length).toBeGreaterThanOrEqual(4);
    for (const slug of guides) {
      const src = read(`src/app/guides/${slug}/page.tsx`);
      expect(src, `${slug} has no articleSlug`).toContain(`articleSlug="${slug}"`);
    }
  });

  it("legal pages do NOT claim to be articles", () => {
    for (const p of ["src/app/privacy/page.tsx", "src/app/terms/page.tsx"]) {
      expect(read(p)).not.toContain("articleSlug");
    }
  });

  it("exactly one page opts into the FAQ schema", () => {
    // <Faq /> renders on both / and /pricing. Emitting the FAQPage block from
    // both gave Google two competing candidates for one rich result, so the
    // schema is opt-in and only the homepage opts in.
    const pages = readdirSync(path.join(ROOT, "src/app"), { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("("))
      .map((d) => `src/app/${d.name}/page.tsx`)
      .filter((p) => existsSync(path.join(ROOT, p)));

    const optedIn = ["src/app/page.tsx", ...pages].filter((p) =>
      /<Faq\s+withSchema/.test(read(p)),
    );
    expect(optedIn).toEqual(["src/app/page.tsx"]);
  });
});

describe("sitemap", () => {
  const paths = sitemap().map((e) => new URL(e.url).pathname);

  it("lists every public legal page — they are footer-linked and indexable", () => {
    // /refunds was missing for months: linked from the footer, crawlable, and
    // absent from the sitemap, so it depended entirely on link discovery.
    for (const route of ["/privacy", "/terms", "/refunds", "/contact"]) {
      expect(paths, `${route} is public but not in the sitemap`).toContain(route);
    }
  });

  it("only lists routes that actually exist", () => {
    // A sitemap entry for a deleted page is a soft 404 submitted on purpose.
    for (const p of paths) {
      if (p === "/") continue;
      const direct = path.join(ROOT, "src/app", p, "page.tsx");
      const grouped = path.join(ROOT, "src/app/(app)", p, "page.tsx");
      expect(
        existsSync(direct) || existsSync(grouped),
        `sitemap lists ${p}, which is not a route`,
      ).toBe(true);
    }
  });

  it("never lists a route robots disallows", () => {
    const rule = robots().rules;
    const disallow = (Array.isArray(rule) ? rule[0] : rule).disallow as string[];
    for (const p of paths) {
      expect(disallow, `${p} is both submitted and disallowed`).not.toContain(p);
    }
  });
});

describe("titles", () => {
  it("every app section names itself, so tabs are distinguishable", () => {
    const sections = readdirSync(path.join(ROOT, "src/app/(app)"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    // The sections that own a nav entry each carry a layout with a title.
    for (const slug of ["account", "dashboard", "licence-prep", "study", "tutor"]) {
      expect(sections).toContain(slug);
      const src = read(`src/app/(app)/${slug}/layout.tsx`);
      expect(src, `${slug} layout exports no metadata title`).toMatch(
        /export const metadata: Metadata = \{ title: "[^"]+" \}/,
      );
    }
  });

  it("the root layout keeps a title template for them to slot into", () => {
    expect(read("src/app/layout.tsx")).toContain("template:");
  });
});
