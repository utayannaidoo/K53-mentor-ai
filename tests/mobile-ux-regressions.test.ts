import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Mobile UX fixes that regress silently.
 *
 * Every rule here was earned by an actual phone-sized failure: side arrows
 * that stole 104px from the question column, a tutor pane that pushed its
 * composer under the fixed tab bar, a banner that broke that sizing by
 * rendering above it. None of these typecheck differently when undone — the
 * desktop view looks identical — so they are pinned at the source level,
 * same approach as mobile-nav-coverage.test.ts.
 */

const read = (...p: string[]) =>
  readFileSync(path.resolve(__dirname, "../src", ...p), "utf8");

const PLAYERS = [
  ["study/question-practice.tsx", "question"],
  ["study/mock-exam.tsx", "exam"],
  ["study/scenario-player.tsx", "scenario"],
] as const;

describe("session players keep their mobile thumb-row", () => {
  for (const [file, label] of PLAYERS) {
    it(`${label} practice renders SessionNavRow below sm`, () => {
      const src = read("components", file);
      expect(src).toContain(`from "@/components/ui/session-nav"`);
      expect(
        /<SessionNavRow[\s\S]*?\/>/.test(src),
        `${file} must render <SessionNavRow> — without it a phone has no way to advance`,
      ).toBe(true);
    });

    it(`${label} practice hides its desktop flanking arrows on phones`, () => {
      const src = read("components", file);
      // Both arrows carry hidden sm:flex; if one loses it, the question column
      // is squeezed back to ~184px on a 320px screen.
      const occurrences = src.match(/className="hidden sm:flex"/g)?.length ?? 0;
      expect(occurrences, `${file} expected 2 flanking arrows hidden on phones`).toBe(2);
    });
  }
});

describe("tutor chat fits between the header and the bottom tab bar", () => {
  const src = read("components/tutor/tutor-chat.tsx");

  it("sizes to the real chrome (header + paddings + nav clearance)", () => {
    expect(
      src.includes("h-[calc(100dvh-12.5rem)]"),
      "Chrome is 4rem header + 1.5rem top padding + 7rem bottom clearance = 12.5rem. " +
        "Any smaller value pushes the composer under the fixed bottom nav.",
    ).toBe(true);
  });

  it("keeps a usable floor on short landscape windows", () => {
    expect(src).toContain("min-h-[380px]");
  });
});

describe("streak banner never renders inside exact-fit flows", () => {
  it("is gated off /tutor as well as /study/*", () => {
    const src = read("components/app/streak-banner.tsx");
    expect(
      src.includes('pathname.startsWith("/tutor")'),
      "The tutor pane is sized to the viewport; a banner above it reintroduces page scroll.",
    ).toBe(true);
  });
});

describe("Select dropdowns stay reachable inside dialogs", () => {
  const src = read("components/ui/select.tsx");

  it("flips above the trigger when there is no room below", () => {
    expect(src).toContain('"bottom-full mb-1.5"');
  });

  it("caps the open list to the space it opens into", () => {
    expect(src).toContain("style={{ maxHeight: listMaxH }}");
    expect(
      !src.includes("max-h-60"),
      "The static cap must not come back — it let long lists clip against sheet edges.",
    );
  });
});

describe("onboarding choice tiles stack on phones", () => {
  it("step 6 knowledge/frequency grids wait for sm before three across", () => {
    const src = read("components/onboarding/onboarding-wizard.tsx");
    // The two step-6 selectors must not regress to bare grid-cols-3, which
    // left each tile ~72px of content at 320px.
    expect(src).toContain('"grid grid-cols-1 gap-2 sm:grid-cols-3"');
  });
});
