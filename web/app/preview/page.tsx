/*
 * Design direction index -- NOT part of the site.
 *
 * Five full-page treatments at /preview/01 .. /preview/05, each rendered
 * against the real photography. Nothing links here from the site and every
 * page is noindex. Delete web/app/preview/ once a direction is chosen.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "./_shared/Logo";

export const metadata: Metadata = {
  title: "Design directions",
  robots: { index: false, follow: false }
};

const DIRECTIONS = [
  {
    id: "01",
    name: "Editorial Type",
    lead: "The cheapest route to looking expensive.",
    body: "Nothing moves, nothing changes colour. A high-contrast serif at display size, italic for emphasis, against monospaced micro-labels in wide caps. Quiet luxury is carried by typography before anything else, and this is the only direction that costs you nothing but a font stack.",
    diff: "Type only",
    effort: "Low",
    risk: "Reverts in one file"
  },
  {
    id: "02",
    name: "Photography First",
    lead: "You own the asset. Stop showing it at 224 pixels.",
    body: "Dark ground, full-bleed hero, and an asymmetric editorial grid where photographs run edge to edge. Type recedes to captions. This is the biggest visual change on the list and the one that most directly monetises the DSLR work you already did.",
    diff: "Layout",
    effort: "High",
    risk: "Gallery layout moves"
  },
  {
    id: "03",
    name: "Bone & Ink",
    lead: "Your cyan survives this. It gets stronger.",
    body: "Warm neutrals replace the cool blue-grey. Rendered twice so you can judge the real question -- whether the logo colour holds up. It does: on bone, the cyan becomes the only saturated thing on the page instead of one of three competing blues. Includes your logo rebuilt as vector.",
    diff: "Palette",
    effort: "Low",
    risk: "Dashboard must follow"
  },
  {
    id: "04",
    name: "Motion & Material",
    lead: "Has to be used, not looked at. Scroll it.",
    body: "One easing curve, one duration, applied with discipline: content settles up as it enters view, photographs scale slowly under the cursor, price rows reveal on hover. No bounce, no parallax, no scroll-jacking. Falls back to static under prefers-reduced-motion.",
    diff: "Interaction",
    effort: "Medium",
    risk: "Easy to overdo"
  },
  {
    id: "05",
    name: "Editorial Structure",
    lead: "Reads like a monograph, not a template.",
    body: "Numbered sections, a sticky index that tracks position, a fixed left label column, hairline rules instead of cards. Architectural rather than decorative. Costs nothing in colour or imagery, which is exactly why it layers on top of any of the other four.",
    diff: "Structure",
    effort: "Medium",
    risk: "Purely additive"
  }
];

export default function PreviewIndex() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex items-center gap-4">
          <LogoMark size={44} tone="#00b9ff" toneEnd="#7de3ff" />
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">
            Internal &mdash; not linked from the site
          </p>
        </div>

        <h1 className="mt-10 text-5xl font-light tracking-[-0.03em]">Five directions</h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
          Each is a full page treatment rendered against your real photography,
          not a mockup. They are not mutually exclusive: 01, 03 and 04 stack into
          one coherent look, 05 layers on top of any of them, and 02 is the only
          one that meaningfully conflicts with the others.
        </p>

        <div className="mt-16 space-y-4">
          {DIRECTIONS.map((direction) => (
            <Link
              key={direction.id}
              href={`/preview/${direction.id}`}
              className="group block rounded-lg border border-white/10 p-7 transition-colors hover:border-white/30 hover:bg-white/[0.03]"
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <span className="font-mono text-sm text-neutral-600">{direction.id}</span>
                <h2 className="text-2xl font-medium tracking-tight">{direction.name}</h2>
                <span className="flex-1" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100">
                  Open &rarr;
                </span>
              </div>

              <p className="mt-3 text-[15px] text-[#7de3ff]">{direction.lead}</p>
              <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-neutral-400">
                {direction.body}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                <span>Changes: <span className="text-neutral-300">{direction.diff}</span></span>
                <span>Effort: <span className="text-neutral-300">{direction.effort}</span></span>
                <span>Risk: <span className="text-neutral-300">{direction.risk}</span></span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-16 text-[13px] text-neutral-600">
          Delete <code className="font-mono text-neutral-500">web/app/preview/</code> once
          a direction is chosen. Nothing in it is imported by the site.
        </p>
      </div>
    </main>
  );
}
