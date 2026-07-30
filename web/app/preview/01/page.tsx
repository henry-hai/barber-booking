/* Direction 01 -- Editorial Type. Palette and layout stay; typography changes. */

import Image from "next/image";
import { PreviewBar, Thesis } from "../_shared/Chrome";
import { Logo } from "../_shared/Logo";
import { art, cuts, hero, locations, portrait, priced, nav } from "../_shared/data";

export const metadata = { title: "01 Editorial Type", robots: { index: false } };

const SERIF = "ui-serif, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif";

export default function Direction01() {
  return (
    <div className="bg-white">
      <PreviewBar current="01" />
      <Thesis
        number="01"
        name="Editorial Type"
        thesis="Nothing here moves and nothing changes color. The entire difference is the typeface, the scale it is set at, and the space around it. A high-contrast serif at display size, italic for emphasis, against monospaced micro-labels in wide caps. This is the cheapest possible route to looking expensive, because expense in typography reads as restraint rather than ornament."
        changes={["Display serif for all headings", "Monospaced uppercase micro-labels", "Larger type scale, tighter tracking", "Editorial pull quotes and drop detail"]}
        leaves={["The cyan and the logo", "Every layout and section order", "The booking form and its flow", "The dashboard in client/"]}
      />

      {/* nav */}
      <header className="sticky top-[41px] z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size={40} />
          <nav className="hidden items-center gap-9 md:flex">
            {nav.map((item) => (
              <a key={item} href="#" className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500 hover:text-neutral-900">
                {item}
              </a>
            ))}
            <a href="#" className="border-b border-neutral-900 pb-0.5 font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-900">
              Book
            </a>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[520px]">
          <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-6 pb-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/70">
              Irvine &middot; Milpitas &middot; California
            </p>
            <h1
              className="mt-6 max-w-4xl text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.025em] text-white"
              style={{ fontFamily: SERIF }}
            >
              A haircut is<br />
              <span className="italic text-white/75">an hour of</span> attention.
            </h1>
            <div className="mt-9 flex flex-wrap items-center gap-x-10 gap-y-4">
              <a href="#" className="border-b border-white pb-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white">
                Book an appointment
              </a>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
                300+ clients &middot; Est. 2013
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* about -- editorial two column with a drop-cap style opening */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Image
              src={portrait} alt="Henry Hai" width={800} height={1000}
              sizes="(min-width:768px) 40vw, 90vw"
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="md:col-span-7 md:pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
              01 &mdash; About
            </p>
            <h2
              className="mt-6 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.02em] text-neutral-900"
              style={{ fontFamily: SERIF }}
            >
              I started this shop at seventeen and never handed it to anyone else.
            </h2>
            <p className="mt-8 max-w-xl text-[17px] leading-[1.75] text-neutral-600">
              <span
                className="float-left mr-3 mt-1 text-[3.5rem] leading-[0.75] text-neutral-900"
                style={{ fontFamily: SERIF }}
              >
                E
              </span>
              very cut is personal, and every photograph on this page is one I took
              myself. Since 2013 I have built a practice around one idea &mdash;
              that a luxury haircut is not a product you buy, it is time someone
              spends on you carefully.
            </p>
            <blockquote
              className="mt-10 border-l-2 border-neutral-900 pl-6 text-[22px] italic leading-snug text-neutral-800"
              style={{ fontFamily: SERIF }}
            >
              &ldquo;Minimal, modern, and finished by hand.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* services -- price list as a typographic table */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
                02 &mdash; Services
              </p>
              <h2
                className="mt-6 text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em] text-neutral-900"
                style={{ fontFamily: SERIF }}
              >
                Clipper,<br /><span className="italic">scissor,</span><br />razor.
              </h2>
              <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-neutral-500">
                Add-ons marked with a plus attach to a haircut. Line-ups are
                &agrave; la carte.
              </p>
            </div>
            <div className="md:col-span-8">
              <ul>
                {priced.map((service, index) => (
                  <li
                    key={service.name}
                    className="flex items-baseline gap-5 border-b border-neutral-200 py-5 first:border-t"
                  >
                    <span className="font-mono text-[11px] text-neutral-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[19px] text-neutral-900" style={{ fontFamily: SERIF }}>
                      {service.name}
                    </span>
                    <span className="flex-1" />
                    <span className="font-mono text-[13px] tracking-wider text-neutral-500">
                      {service.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* gallery -- same scroll strip, editorial framing */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
              03 &mdash; Gallery
            </p>
            <h2
              className="mt-6 text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em] text-neutral-900"
              style={{ fontFamily: SERIF }}
            >
              The work, <span className="italic">and the hand</span> behind it.
            </h2>
          </div>
          <div className="hidden gap-6 font-mono text-[11px] uppercase tracking-[0.2em] md:flex">
            <span className="border-b border-neutral-900 pb-1 text-neutral-900">Haircuts</span>
            <span className="pb-1 text-neutral-400">Artwork</span>
          </div>
        </div>

        <div className="mt-10 flex gap-4 overflow-x-auto pb-4">
          {cuts.map((src) => (
            <Image
              key={src} src={src} alt="" width={224} height={280} sizes="224px"
              className="h-[280px] w-56 flex-none object-cover"
            />
          ))}
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {art.map((src) => (
            <Image
              key={src} src={src} alt="" width={180} height={225} sizes="180px"
              className="h-[225px] w-[180px] flex-none object-cover"
            />
          ))}
        </div>
      </section>

      {/* booking */}
      <section className="border-t border-neutral-200 bg-neutral-900">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-28 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
              04 &mdash; Book
            </p>
            <h2
              className="mt-6 text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em] text-white"
              style={{ fontFamily: SERIF }}
            >
              Three times<br />that suit you.
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/50">
              Offer up to three slots and I will confirm one by email, usually the
              same day.
            </p>
            <ul className="mt-8 space-y-2.5 text-[13px] text-white/40">
              {locations.map((location) => (
                <li key={location.name} className="flex gap-4">
                  <span className="w-20 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                    {location.name}
                  </span>
                  <span>{location.address}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-7">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {["Name", "Email"].map((label) => (
                  <div key={label}>
                    <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                      {label}
                    </label>
                    <div className="mt-2 border-b border-white/25 pb-2.5 text-white/80">&nbsp;</div>
                  </div>
                ))}
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Preferred date 1
                </label>
                <div className="mt-2 border-b border-white/25 pb-2.5 text-white/80">&nbsp;</div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Availability
                </label>
                <div className="mt-2 h-16 border-b border-white/25" />
              </div>
              <button className="mt-4 border border-white px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-neutral-900">
                Send request
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
