/*
 * Design direction previews -- NOT part of the site.
 *
 * Five directions rendered against the real photography so they can be judged
 * as designs rather than as descriptions. Reachable at /preview only; nothing
 * links to it and it is excluded from the sitemap.
 *
 * Delete this directory once a direction is chosen.
 */

import type { Metadata } from "next";
import Image from "next/image";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Design directions",
  robots: { index: false, follow: false }
};

/* ---------------------------------------------------------------- helpers */

function Option({
  number, name, idea, risk, children
}: {
  number: string; name: string; idea: string; risk: string; children: React.ReactNode;
}) {
  return (
    <section className="border-t border-neutral-200">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-sm text-neutral-400">{number}</span>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{name}</h2>
        </div>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-neutral-600">{idea}</p>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-neutral-400">
          <span className="font-medium text-neutral-500">Risk:</span> {risk}
        </p>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="overflow-hidden rounded-lg border border-neutral-200 shadow-sm">
          {children}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export default function DesignPreview() {
  return (
    <main className="bg-white pb-24">

      <header className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
          Internal preview
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900">
          Five directions
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
          Each uses the real photography. They are not mutually exclusive --
          1 and 3 combine especially well, and 5 is structural rather than
          visual. Scroll to compare, then say which numbers you want.
        </p>
      </header>

      {/* ============================================================ 01 */}
      <Option
        number="01"
        name="Editorial typography"
        idea="Quiet luxury is carried by type before anything else. A high-contrast serif for display, set large and tight, against small uppercase labels with wide letter-spacing. The body copy stays as it is. This is the single highest-leverage change on the list and touches no layout."
        risk="Low. Type-only. Reverts in one file."
      >
        <div className="bg-[#faf9f7] px-8 py-20 sm:px-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">
            Irvine &middot; Milpitas
          </p>
          <h3
            className="mt-6 text-5xl leading-[1.05] tracking-[-0.02em] text-neutral-900 sm:text-7xl"
            style={{ fontFamily: "ui-serif, 'Iowan Old Style', Georgia, serif" }}
          >
            Personalized,<br />luxury haircuts<br />
            <span className="italic text-neutral-500">since 2013.</span>
          </h3>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <a
              href="#"
              className="border-b border-neutral-900 pb-1 text-sm uppercase tracking-[0.15em] text-neutral-900"
            >
              Book an appointment
            </a>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
              300+ clients served
            </span>
          </div>
        </div>
      </Option>

      {/* ============================================================ 02 */}
      <Option
        number="02"
        name="Photography at full scale"
        idea="Your photographs are the product and the differentiator, and the current gallery shows them at 224px in a scrolling strip. This gives them an asymmetric grid at real size, with the two-row scroll kept underneath as the deep archive. You shot all of it on a DSLR; nothing else on the page earns attention this cheaply."
        risk="Medium. Changes the gallery layout, so the two-row scroll behaviour moves rather than disappears."
      >
        <div className="bg-white p-2 sm:p-4">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 sm:gap-4" style={{ height: "clamp(320px, 46vw, 560px)" }}>
            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-md">
              <Image src="/img/26_Hoang_1.jpg" alt="" fill sizes="50vw" className="object-cover" />
            </div>
            <div className="relative col-span-1 row-span-1 overflow-hidden rounded-md">
              <Image src="/img/21_RR_1.JPG" alt="" fill sizes="25vw" className="object-cover" />
            </div>
            <div className="relative col-span-1 row-span-2 overflow-hidden rounded-md">
              <Image src="/img/artwork/godfather-1.jpg" alt="" fill sizes="25vw" className="object-cover" />
            </div>
            <div className="relative col-span-1 row-span-1 overflow-hidden rounded-md">
              <Image src="/img/27_JD_1.jpg" alt="" fill sizes="25vw" className="object-cover" />
            </div>
          </div>
          <p className="px-2 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
            Selected work &mdash; the full archive scrolls below
          </p>
        </div>
      </Option>

      {/* ============================================================ 03 */}
      <Option
        number="03"
        name="Warm neutral palette"
        idea="The current accent is #00b9ff, a saturated cyan, and it is the least quiet thing on the page. This swaps the whole palette to bone and ink with a single restrained accent. Warm neutrals also flatter skin tones and graphite, which is most of what you photograph."
        risk="Low, but it is the most visible change. Every button and link shifts color."
      >
        <div className="bg-[#faf9f7] p-8 sm:p-12">
          <div className="flex flex-wrap gap-3">
            {[
              ["#faf9f7", "Bone", "page"],
              ["#ffffff", "White", "cards"],
              ["#1c1917", "Ink", "text"],
              ["#57534e", "Stone", "body"],
              ["#4a5d43", "Olive", "accent"],
              ["#7c2d2d", "Oxblood", "alt accent"]
            ].map(([hex, name, use]) => (
              <div key={name} className="w-28">
                <div
                  className="h-20 w-full rounded-md border border-black/5"
                  style={{ backgroundColor: hex }}
                />
                <p className="mt-2 text-[13px] font-medium text-neutral-800">{name}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">{use}</p>
                <p className="font-mono text-[10px] text-neutral-400">{hex}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-md rounded-lg bg-white p-8 shadow-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#4a5d43]">
              Services
            </p>
            <ul className="mt-5 space-y-3">
              {services.slice(0, 4).map((service) => (
                <li key={service.name} className="flex items-baseline justify-between gap-4">
                  <span className="text-[15px] text-[#1c1917]">{service.name}</span>
                  <span className="flex-1 border-b border-dotted border-neutral-300" />
                  <span className="font-mono text-[13px] text-[#57534e]">{service.price}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-7 w-full rounded-md bg-[#1c1917] py-3 text-sm uppercase tracking-[0.15em] text-white"
            >
              Book
            </button>
          </div>
        </div>
      </Option>

      {/* ============================================================ 04 */}
      <Option
        number="04"
        name="Restrained motion"
        idea="Images and headings settle into place as they enter the viewport, and photographs lift very slightly on hover. This is the 'daring detail done beautifully' slot, and the discipline is entirely in the restraint: one effect, one duration, no bounce. Hover the photographs below."
        risk="Low, but easy to overdo. Must respect prefers-reduced-motion, which the real implementation would."
      >
        <div className="bg-[#faf9f7] p-8 sm:p-12">
          <div className="grid gap-4 sm:grid-cols-3">
            {["/img/19_Cam_1.jpg", "/img/31_Hoang_2.jpg", "/img/artwork/godfather-3.jpg"].map((src) => (
              <figure key={src} className="group cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                </div>
                <figcaption className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                    Detail
                  </span>
                  <span className="text-[13px] text-neutral-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    View &rarr;
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-neutral-400">
            Hover any photograph. The same easing would carry the scroll-in reveal.
          </p>
        </div>
      </Option>

      {/* ============================================================ 05 */}
      <Option
        number="05"
        name="Numbered structure"
        idea="Architectural rather than decorative: sections carry index numbers, separated by hairline rules with generous space around them, and a thin sticky index tracks position. It reads as considered and deliberate, and it costs nothing in color or imagery. Combines cleanly with any of the above."
        risk="Low. Purely additive structure."
      >
        <div className="bg-white p-8 sm:p-12">
          <div className="flex gap-12">
            <nav className="hidden w-40 shrink-0 sm:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-300">
                Index
              </p>
              <ul className="mt-4 space-y-2.5">
                {["About", "Services", "Gallery", "Locations", "Book"].map((label, index) => (
                  <li key={label} className="flex gap-3 font-mono text-[11px] uppercase tracking-[0.15em]">
                    <span className="text-neutral-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={index === 2 ? "text-neutral-900" : "text-neutral-400"}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="min-w-0 flex-1">
              {[
                ["03", "Gallery", "Haircuts, artwork, and portraiture. Every photograph shot in-house."],
                ["04", "Locations", "Irvine and Milpitas. Seasonal hours, by appointment."]
              ].map(([number, title, copy]) => (
                <div key={number} className="border-t border-neutral-200 py-8 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono text-[11px] tracking-[0.15em] text-neutral-300">
                      {number}
                    </span>
                    <h4
                      className="text-3xl tracking-tight text-neutral-900"
                      style={{ fontFamily: "ui-serif, 'Iowan Old Style', Georgia, serif" }}
                    >
                      {title}
                    </h4>
                  </div>
                  <p className="mt-3 pl-0 text-[15px] leading-relaxed text-neutral-500 sm:pl-[3.6rem]">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Option>

      <footer className="mx-auto max-w-6xl px-6 pt-8">
        <p className="text-[13px] text-neutral-400">
          Preview only. Delete <code className="font-mono">web/app/preview/</code> once a
          direction is chosen.
        </p>
      </footer>
    </main>
  );
}
