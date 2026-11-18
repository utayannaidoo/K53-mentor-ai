import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GUIDES } from "@/app/guides/guides";
import { QUESTION_PAGES, questionsFor } from "@/lib/content/question-pages";
import { SIGN_PAGES } from "@/lib/content/sign-pages";
import {
  INFORMATION_GROUP,
  SIGN_CATEGORY_PAGES,
  sectionAnchor,
  signCategoryPageBySlug,
  signsInGroup,
} from "@/lib/content/sign-category-pages";
import { PAGE_UPDATED } from "@/lib/page-dates";

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
    for (const route of ["/api/", "/onboarding", "/welcome", "/continue"]) {
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
    // Most protected routes live in the (app) group, but not all: the school
    // workspace sits at the top level on purpose, outside the group, so it
    // never mounts the learner study store. Count any real top-level segment
    // — not a route group, not a dynamic segment — that renders a page.
    const dirs = (dir: string) =>
      readdirSync(path.join(ROOT, dir), { withFileTypes: true }).filter((d) => d.isDirectory());
    const topLevel = dirs("src/app")
      .filter((d) => !/^[([_@]/.test(d.name))
      .filter((d) =>
        ["page.tsx", "layout.tsx"].some((f) => existsSync(path.join(ROOT, "src/app", d.name, f))),
      );
    const routes = new Set([
      ...dirs("src/app/(app)").map((d) => `/${d.name}`),
      ...topLevel.map((d) => `/${d.name}`),
    ]);
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

  it("every FAQ answer is plain text — the schema serialises it verbatim", () => {
    // A JSX answer stringifies into React internals ("props", "_owner"),
    // which Google reads as an invalid Answer and drops the rich result for.
    // Rich rendering lives in `richAnswer`; `answer` must stay a plain string.
    // Asserted at source level: vitest runs in a node environment, which does
    // not transform this component's JSX for direct import.
    const src = read("src/components/landing/faq.tsx");
    expect(src).not.toMatch(/answer:\s*\(/);
    const textAnswers = src.match(/^\s{4}answer:\s*`?"/gm) ?? [];
    expect(textAnswers.length).toBeGreaterThanOrEqual(8);
    expect(src).toMatch(/richAnswer\?:/);
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

  it("every guide owns its OG share card, and every card names a real guide", () => {
    // WhatsApp crops share cards into a small tile where the actual headline
    // is the hook — a guide without its own opengraph-image silently falls
    // back to the generic homepage card. Conversely a card naming a slug that
    // is not in the catalogue throws at render time; both directions pinned.
    const dir = path.join(ROOT, "src/app/guides");
    const slugs = readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const catalogueSrc = read("src/app/guides/guides.ts");
    const catalogued = [...catalogueSrc.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);

    for (const slug of slugs) {
      expect(
        existsSync(path.join(ROOT, `src/app/guides/${slug}/opengraph-image.tsx`)),
        `${slug} has no opengraph-image.tsx — it would share with the homepage's generic card`,
      ).toBe(true);
    }
    for (const slug of catalogued) {
      expect(slugs, `catalogue lists "${slug}" but the guide route does not exist`).toContain(
        slug,
      );
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
    for (const route of ["/privacy", "/terms", "/refunds", "/contact", "/about"]) {
      expect(paths, `${route} is public but not in the sitemap`).toContain(route);
    }
  });

  it("leaves out the auth forms, which say noindex", () => {
    // A login form is not content. Submitting two of them made the site look
    // thinner to the AdSense review than it is.
    for (const route of ["/login", "/signup"]) {
      expect(paths).not.toContain(route);
      expect(read(`src/app/(auth)${route}/page.tsx`)).toMatch(/robots: \{ index: false/);
    }
  });

  it("only lists routes that actually exist", () => {
    // A sitemap entry for a deleted page is a soft 404 submitted on purpose.
    for (const p of paths) {
      if (p === "/") continue;
      // Programmatic pages resolve through one dynamic segment each; their
      // slugs are checked against the generating catalogues further down.
      const dynamic = [
        ["/road-signs/", "src/app/road-signs/[category]/page.tsx"],
        ["/k53-questions/", "src/app/k53-questions/[category]/page.tsx"],
      ].find(([prefix]) => p.startsWith(prefix));
      if (dynamic) {
        expect(existsSync(path.join(ROOT, dynamic[1]))).toBe(true);
        continue;
      }
      const direct = path.join(ROOT, "src/app", p, "page.tsx");
      // Grouped pages may live under any route group — /login and /signup sit
      // in (auth) so they don't inherit (app)'s provider layout.
      const grouped = ["(app)", "(auth)"].map((g) => path.join(ROOT, "src/app", g, p, "page.tsx"));
      expect(
        existsSync(direct) || grouped.some(existsSync),
        `sitemap lists ${p}, which is not a route`,
      ).toBe(true);
    }
  });

  it("dates every entry with a real calendar date", () => {
    // 171 of 188 entries had no date when the site was resubmitted to AdSense,
    // which reads as a site nobody maintains. A date must be a real day, and
    // never in the future (a build-time `now` would be today, then stale).
    const today = new Date().toISOString().slice(0, 10);
    for (const e of sitemap()) {
      const date = String(e.lastModified ?? "");
      expect(date, `${e.url} has no lastModified`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(date)), `${e.url}: ${date}`).toBe(false);
      expect(date <= today, `${e.url} is dated in the future`).toBe(true);
    }
  });

  it("takes each info page's date from the same place as its Last updated line", () => {
    // Same rule as the guides: one date, read by both the page and the sitemap.
    for (const route of ["/about", "/privacy", "/refunds", "/sources", "/terms"] as const) {
      const src = read(`src/app${route}/page.tsx`);
      expect(src, `${route} hard-codes its date`).not.toMatch(/updated="/);
      expect(src).toContain(`updated={PAGE_UPDATED["${route}"]}`);
      const entry = sitemap().find((e) => new URL(e.url).pathname === route);
      expect(entry?.lastModified).toBe(PAGE_UPDATED[route]);
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

describe("guide catalogue", () => {
  it("is the only place a guide's date lives", () => {
    // The sitemap's lastModified and the article's "Last updated" line both
    // read the catalogue. A page passing its own `updated` would let the two
    // disagree, which is the fake-date problem the sitemap comment describes.
    for (const guide of GUIDES) {
      expect(guide.updated, `${guide.slug} has no updated date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const src = read(`src/app/guides/${guide.slug}/page.tsx`);
      expect(src, `${guide.slug} sets its own updated date`).not.toMatch(/\bupdated=/);
    }
  });

  it("every guide is submitted with that date", () => {
    const entries = new Map(sitemap().map((e) => [new URL(e.url).pathname, e]));
    for (const guide of GUIDES) {
      expect(entries.get(`/guides/${guide.slug}`)?.lastModified).toBe(guide.updated);
    }
  });
});

describe("programmatic pages", () => {
  const paths = new Set(sitemap().map((e) => new URL(e.url).pathname));

  it("every verified sign has a unique, readable slug", () => {
    // The slug is the sign's anchor on its family page and the source of its
    // old URL's redirect. Two signs sharing one would send a link to the wrong
    // sign.
    const slugs = SIGN_PAGES.map((p) => p.slug);
    expect(slugs.length).toBeGreaterThanOrEqual(90);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("every sign family page and every question page is in the sitemap", () => {
    for (const p of SIGN_CATEGORY_PAGES) expect(paths).toContain(`/road-signs/${p.slug}`);
    for (const p of QUESTION_PAGES) expect(paths).toContain(`/k53-questions/${p.slug}`);
    expect(paths).toContain("/k53-questions");
  });

  it("submits no single-sign page", () => {
    // AdSense rejected the site as "low-value content" twice while 151
    // near-identical single-sign pages were up. They now redirect to their
    // family page, so a sitemap entry for one would submit a redirect.
    const family = new Set(SIGN_CATEGORY_PAGES.map((p) => `/road-signs/${p.slug}`));
    const signPaths = [...paths].filter((p) => p.startsWith("/road-signs/"));
    expect(signPaths.filter((p) => !family.has(p))).toEqual([]);
    expect(existsSync(path.join(ROOT, "src/app/road-signs/[slug]/page.tsx"))).toBe(false);
  });

  it("shows every verified sign exactly once: on its family page, or on the hub", () => {
    // signsInGroup drops a sign whose subcategory no section names, which
    // would hide it and point its old URL at an anchor that isn't there.
    const groups = [...SIGN_CATEGORY_PAGES, INFORMATION_GROUP];
    const shown = groups.flatMap((g) => signsInGroup(g).flatMap((s) => s.signs.map((e) => e.slug)));
    expect(shown.sort()).toEqual(SIGN_PAGES.map((p) => p.slug).sort());
    // Every family the verified set contains has a home.
    const homes = new Set(groups.map((g) => g.category));
    for (const p of SIGN_PAGES) expect(homes, p.slug).toContain(p.sign.category);
  });

  it("no family page is thin, and none has an empty section", () => {
    // A family page replaced dozens of single-sign pages; one with a handful of
    // signs would be the thin page all over again.
    for (const page of SIGN_CATEGORY_PAGES) {
      const groups = signsInGroup(page);
      expect(groups.reduce((n, g) => n + g.signs.length, 0), page.slug).toBeGreaterThanOrEqual(20);
      for (const g of groups) expect(g.signs.length, `${page.slug}: ${g.section.heading}`).toBeGreaterThan(0);
      expect(page.intro.length, page.slug).toBeGreaterThan(0);
    }
  });

  it("anchors on a page never collide", () => {
    // Sign slugs and section anchors share one id namespace per page; a family
    // slug matching a sign slug would also shadow that sign's redirect.
    const slugs = new Set(SIGN_PAGES.map((p) => p.slug));
    for (const page of SIGN_CATEGORY_PAGES) {
      expect(slugs.has(page.slug), page.slug).toBe(false);
      for (const { section } of signsInGroup(page)) {
        expect(slugs.has(sectionAnchor(section)), section.heading).toBe(false);
      }
    }
    for (const id of ["information-signs", "mix-ups"]) expect(slugs.has(id), id).toBe(false);
  });

  it("no question page is thin", () => {
    // A category page with a handful of questions is the thin, near-duplicate
    // page that drags a whole section down. The starter pack is generated, so
    // this catches a regeneration that starves a category.
    for (const p of QUESTION_PAGES) {
      expect(questionsFor(p.categoryId).length, p.slug).toBeGreaterThanOrEqual(10);
    }
  });

  it("question pages cover each study category exactly once", () => {
    const ids = QUESTION_PAGES.map((p) => p.categoryId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(7);
  });

  it("the guide links into sign pages resolve", () => {
    // Guides link to individual signs as /road-signs/<family>#<sign>; a renamed
    // sign would leave the link on a page without that anchor, which no type
    // checks. A bare /road-signs/<sign> link would only work through a redirect.
    const questionSlugs = new Set(QUESTION_PAGES.map((p) => p.slug));
    for (const guide of GUIDES) {
      const src = read(`src/app/guides/${guide.slug}/page.tsx`);
      for (const [, pageSlug, anchor] of src.matchAll(/href="\/road-signs\/([^"/#]+)(?:#([^"]+))?"/g)) {
        const page = signCategoryPageBySlug(pageSlug);
        expect(page, `${guide.slug} links to /road-signs/${pageSlug}, which is not a family page`).toBeDefined();
        if (!page || !anchor) continue;
        const onPage = signsInGroup(page).flatMap((g) => g.signs.map((s) => s.slug));
        expect(onPage, `${guide.slug} links to missing sign ${pageSlug}#${anchor}`).toContain(anchor);
      }
      for (const [, slug] of src.matchAll(/href="\/k53-questions\/([^"/]+)"/g)) {
        expect(questionSlugs, `${guide.slug} links to missing topic ${slug}`).toContain(slug);
      }
      for (const [, slug] of src.matchAll(/href="\/guides\/([^"/]+)"/g)) {
        expect(GUIDES.map((g) => g.slug), `${guide.slug} links to missing guide ${slug}`).toContain(slug);
      }
    }
  });
});

describe("the free material is easy to find", () => {
  // AdSense's site-readiness guidance asks for navigation that helps visitors
  // find what they're looking for. With the site rejected twice for "low-value
  // content", the top menu linked only back into the landing page and the home
  // page linked none of the free material, so a reviewer who never scrolled to
  // the footer saw nothing to read.
  it("the top menu links the free material", () => {
    const nav = read("src/components/landing/marketing-nav.tsx");
    const links = nav.match(/const LINKS = \[([\s\S]*?)\];/)?.[1] ?? "";
    for (const href of ["/free-quiz", "/road-signs", "/guides"]) {
      expect(links, href).toContain(`href: "${href}"`);
    }
  });

  it("the home page links every free hub", () => {
    expect(read("src/app/page.tsx")).toContain("<FreeMaterial />");
    const section = read("src/components/landing/free-material.tsx");
    for (const href of ["/free-quiz", "/road-signs", "/k53-questions", "/guides"]) {
      expect(section, href).toContain(`href: "${href}"`);
    }
    expect(section).not.toContain('"use client"');
  });

  it("the home page's popular guides exist", () => {
    const section = read("src/components/landing/free-material.tsx");
    const list = section.match(/const POPULAR_GUIDES = \[([\s\S]*?)\];/)?.[1] ?? "";
    const slugs = [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) expect(GUIDES.map((g) => g.slug)).toContain(slug);
  });

  it("every guide says who wrote it and how to report a mistake", () => {
    const layout = read("src/components/landing/legal-page.tsx");
    expect(layout).toContain("About this guide");
    expect(layout).toMatch(/articleSlug && \(\s*<>\s*\{" · By "\}/);
    expect(layout).toContain("mailto:${SUPPORT_EMAIL}");
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
