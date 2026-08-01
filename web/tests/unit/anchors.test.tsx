/*
 * Every in-page anchor must point at a section that exists.
 *
 * The hero's "Book an appointment" link shipped as href="#book" while the
 * section it meant renders as id="s-book", because Section in page.tsx
 * prefixes every id with "s-". The header nav, the mobile menu and the section
 * index all derive their hrefs from that prefix and were fine; the hero's was
 * written by hand and silently pointed at nothing. Clicking it did nothing at
 * all, and no test noticed.
 *
 * This reads the source rather than rendering, because the anchors are spread
 * across several components and a plain string comparison catches the whole
 * class of bug in one pass.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(__dirname, "..", "..");

const read = (...parts: string[]): string =>
  readFileSync(join(root, ...parts), "utf8");

const SOURCES = [
  ["app", "page.tsx"],
  ["components", "Hero.tsx"],
  ["components", "MobileMenu.tsx"],
  ["components", "SectionIndex.tsx"]
];

/* Section ids are declared as <Section id="book" ...> and rendered with the
   "s-" prefix, so the set of real DOM ids is derived the same way. */
function sectionIds(): string[] {
  const page = read("app", "page.tsx");
  return [...page.matchAll(/<Section\s+id="([a-z-]+)"/g)]
    .map((match) => `s-${match[1] as string}`);
}

/* Literal hash hrefs only. The template-literal ones are built from the same
   prefix by construction and cannot drift. */
function literalHashHrefs(): { file: string, href: string }[] {
  const found: { file: string, href: string }[] = [];

  for (const parts of SOURCES) {
    const source = read(...parts);
    for (const match of source.matchAll(/href="#([a-z-]*)"/g)) {
      found.push({ file: parts.join("/"), href: match[1] as string });
    }
  }

  return found;
}

describe("in-page anchors", () => {

  it("finds the booking section", () => {
    expect(sectionIds()).toContain("s-book");
  });

  it("points every literal anchor at a section that exists", () => {
    const ids = sectionIds();

    /* href="#" is the logo's scroll-to-top and targets nothing by design. */
    const broken = literalHashHrefs()
      .filter((link) => link.href !== "")
      .filter((link) => !ids.includes(link.href));

    expect(broken).toEqual([]);
  });

  /* The regression itself, named so a failure says what actually broke. */
  it("has the hero booking button pointing at s-book", () => {
    const hero = read("components", "Hero.tsx");
    expect(hero).toContain('href="#s-book"');
    expect(hero).not.toContain('href="#book"');
  });

});
