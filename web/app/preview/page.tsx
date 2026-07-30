"use client";

/*
 * Full site preview, v3 -- NOT part of the site.
 *
 * A client component only so the hero photograph can be swapped live from the
 * preview bar. The real build would pick one and go back to static.
 *
 * Delete web/app/preview/ once this is signed off and folded into the site.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Michroma } from "next/font/google";
import { Logo, EST_COLOR_OPTIONS, type EstColor } from "./_shared/Logo";
import { Gallery } from "./_shared/Gallery";
import {
  BookingForm, Locations, MobileMenu, Reveal, SectionIndex, ServicesMenu
} from "./_shared/Parts";
import {
  heroFits, heroOptions, nav, servicesPhoto, servicesPhotoAlt, shop, type HeroFit
} from "./_shared/data";

const michroma = Michroma({ subsets: ["latin"], weight: "400" });

const SERIF = "ui-serif, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif";

const SECTIONS: Array<[string, string]> = [
  ["about", "About"], ["services", "Services"],
  ["gallery", "Gallery"], ["locations", "Locations"], ["book", "Book"]
];

export default function SitePreview() {
  const [heroId, setHeroId] = useState(heroOptions[0].id);
  const [fit, setFit] = useState<HeroFit>("high");
  const [estColor, setEstColor] = useState<EstColor>("deep");
  const [estBig, setEstBig] = useState(true);
  const heroOption = heroOptions.find((option) => option.id === heroId) ?? heroOptions[0];
  const fitOption = heroFits.find((option) => option.id === fit) ?? heroFits[0];
  /* KSG 1 cannot be both hero and services photo. */
  const menuPhoto = heroOption.id === "ksg1" ? servicesPhotoAlt : servicesPhoto;

  return (
    <div className="bg-[#f5f2ee] text-neutral-900">

      {/* preview chrome */}
      <div className="sticky top-0 z-[100] border-b border-white/10 bg-neutral-950 px-5 py-2">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Preview
          </span>
          <Link href="/preview/logo" className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7de3ff] hover:text-white">
            Logo lab
          </Link>
          <span className="ml-auto flex flex-wrap items-center gap-1">
            <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Hero
            </span>
            {heroOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setHeroId(option.id)}
                className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                  option.id === heroId ? "bg-white text-neutral-900" : "text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </span>
        </div>

        <div className="mx-auto mt-1.5 flex max-w-[1400px] flex-wrap items-center gap-1">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Desktop fit
          </span>
          {heroFits.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFit(option.id)}
              className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                option.id === fit ? "bg-[#0be6f9] text-neutral-900" : "text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-1.5 flex max-w-[1400px] flex-wrap items-center gap-1">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Est. 2013
          </span>
          {EST_COLOR_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setEstColor(option.id)}
              className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                option.id === estColor ? "bg-white text-neutral-900" : "text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setEstBig((value) => !value)}
            className={`ml-3 rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
              estBig ? "bg-white text-neutral-900" : "text-neutral-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {estBig ? "Enlarged" : "Faithful size"}
          </button>
        </div>

        <p className="mx-auto mt-1.5 max-w-[1400px] text-[11px] leading-relaxed text-neutral-500">
          {heroOption.note} <span className="text-neutral-400">{fitOption.note}</span>
        </p>
      </div>

      {/* nav */}
      <header className="sticky top-[92px] z-50 border-b border-neutral-900/10 bg-[#f5f2ee]/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Logo size={54} variant="e" wordClass={michroma.className} estScale={estBig ? 1.6 : 1} estColor={estColor} />
          <nav className="hidden items-center gap-9 md:flex">
            {nav.map((item) => (
              <a
                key={item}
                href={`#s-${item.toLowerCase()}`}
                className="font-mono text-[13px] uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:text-neutral-900"
              >
                {item}
              </a>
            ))}
            <a
              href="#s-book"
              className="group relative overflow-hidden bg-neutral-900 px-7 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-white"
            >
              <span className="relative z-10">Book</span>
              <span className="absolute inset-0 -translate-x-full bg-[#0be6f9] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
            </a>
          </nav>
          <MobileMenu />
        </div>
      </header>

      {/* hero */}
      <section className="relative h-[78vh] min-h-[480px] overflow-hidden">
        {fit === "triptych" && heroOption.triptych ? (
          /*
            Three frames of the same sitting, the option's own photograph in the
            centre so the panel is symmetrical. On a phone there is no room for
            three, so it falls back to the single mobile crop.
          */
          <>
            <Image
              key={`${heroOption.src}-tm`}
              src={heroOption.src} alt="" fill priority sizes="100vw"
              style={{ objectPosition: heroOption.focusMobile }}
              className={`object-cover md:hidden ${heroOption.blur ? "scale-105 blur-[2px]" : ""}`}
            />
            <div className="hidden h-full md:flex">
              {heroOption.triptych.map((src, index) => (
                <div key={src} className="relative h-full flex-1">
                  <Image
                    src={src} alt="" fill priority sizes="34vw"
                    style={{ objectPosition: index === 1 ? "50% 22%" : "50% 30%" }}
                    className={`object-cover ${heroOption.blur ? "blur-[4px]" : ""}`}
                  />
                  {index < 2 && (
                    <span className="absolute inset-y-0 right-0 w-px bg-white/15" />
                  )}
                </div>
              ))}
            </div>
          </>
        ) : fit === "full" || fit === "triptych" ? (
          <>
            {/* Blurred copy of the same photograph fills the sides. */}
            <Image
              key={`${heroOption.src}-bg`}
              src={heroOption.src} alt="" fill priority sizes="100vw"
              className="scale-125 object-cover blur-[36px] saturate-[1.15]"
            />
            <div className="absolute inset-0 flex justify-center">
              <div className="relative h-full" style={{ aspectRatio: "4 / 5" }}>
                <Image
                  key={heroOption.src}
                  src={heroOption.src} alt="" fill priority
                  sizes="(min-width: 768px) 62vh, 100vw"
                  className="object-contain"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/*
              Two elements rather than one, because object-position has to
              differ per breakpoint and inline style cannot carry a media
              query. The phone element is the one that was already right, so it
              keeps its own value untouched.

              Blur is also per breakpoint: a fixed pixel radius reads far
              stronger on a narrow viewport, which is why the phone genuinely
              looked blurrier than the desktop at the same value.
            */}
            <Image
              key={`${heroOption.src}-m`}
              src={heroOption.src} alt="" fill priority sizes="100vw"
              style={{ objectPosition: heroOption.focusMobile }}
              className={`object-cover md:hidden ${heroOption.blur ? "scale-105 blur-[2px]" : ""}`}
            />
            <Image
              key={`${heroOption.src}-d-${fit}`}
              src={heroOption.src} alt="" fill priority sizes="100vw"
              style={{ objectPosition: fit === "high" ? heroOption.focusHigh : heroOption.focusLow }}
              className={`hidden object-cover md:block ${heroOption.blur ? "scale-105 blur-[4px]" : ""}`}
            />
          </>
        )}
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(15,15,17,${heroOption.scrim})` }} />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1400px] px-6">
            <Reveal>
              <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-white/80">
                Est. {shop.est} &middot; Milpitas &amp; Irvine
              </p>
            </Reveal>
            <Reveal delay={130}>
              <h1
                className="mt-6 max-w-3xl text-[clamp(2.4rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.025em] text-white"
                style={{ fontFamily: SERIF }}
              >
                {shop.name}
              </h1>
              <p className="mt-5 max-w-xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-white/75">
                Personalized, luxury haircuts.
              </p>
            </Reveal>
            <Reveal delay={260}>
              {/* Hover fills the underline cyan and thickens it. Going black on a
                  dark photograph would make the label unreadable. */}
              <a
                href="#s-book"
                className="group mt-10 inline-block font-mono text-[12px] uppercase tracking-[0.2em] text-white"
              >
                Book an appointment
                <span className="mt-1.5 block h-[1.5px] w-full bg-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:h-[3px] group-hover:bg-[#0be6f9]" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* body */}
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex gap-16">

          <aside className="hidden w-40 shrink-0 lg:block">
            <div className="sticky top-[160px] py-24">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-neutral-400">Index</p>
              <div className="mt-5">
                <SectionIndex sections={SECTIONS} />
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">

            {/* No prose. The record stands on its own and says less, which is
                the point of the section. */}
            <Section id="about" number="01" title="About">
              <Reveal>
                <dl className="max-w-xl">
                  {[
                    ["Cutting since", String(shop.est)],
                    ["Locations", "Milpitas & Irvine"],
                    ["Photography", "In-house"]
                  ].map(([key, value]) => (
                    <div key={key} className="flex items-baseline gap-8 border-b border-neutral-300 py-4 first:border-t">
                      <dt className="w-40 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">{key}</dt>
                      <dd className="text-[17px] text-neutral-900" style={{ fontFamily: SERIF }}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </Section>

            <Section id="services" number="02" title="Services">
              <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <Reveal>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                      <Image
                        key={menuPhoto}
                        src={menuPhoto} alt="" fill sizes="(min-width:1024px) 30vw, 90vw"
                        className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
                      />
                    </div>
                  </Reveal>
                  <p className="mt-4 text-[13px] leading-relaxed text-neutral-600">
                    Hover any line for its terms.
                  </p>
                </div>
                <div className="lg:col-span-8">
                  <Reveal>
                    <ServicesMenu />
                  </Reveal>
                </div>
              </div>
            </Section>

            <Section id="gallery" number="03" title="Gallery">
              <Reveal>
                <Gallery />
              </Reveal>
            </Section>

            <Section id="locations" number="04" title="Locations">
              <Locations />
            </Section>

            <Section id="book" number="05" title="Book" last>
              <Reveal>
                <p className="mb-10 max-w-xl text-[17px] leading-relaxed text-neutral-700" style={{ fontFamily: SERIF }}>
                  Offer up to three times that suit you. I will confirm one with you
                  soon.
                </p>
              </Reveal>
              <Reveal delay={100}>
                <BookingForm />
              </Reveal>
            </Section>

          </main>
        </div>
      </div>

      <footer className="border-t border-neutral-900/10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 py-12">
          <Logo size={46} variant="e" wordClass={michroma.className} estScale={estBig ? 1.6 : 1} estColor={estColor} />
          {/* Always the current year, not the founding year. */}
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            &copy; {new Date().getFullYear()} {shop.name}
          </p>
        </div>
      </footer>
    </div>
  );
}

function Section({
  id, number, title, children, last = false
}: {
  id: string; number: string; title: string; children: React.ReactNode; last?: boolean;
}) {
  return (
    <section id={`s-${id}`} className={`scroll-mt-36 border-t border-neutral-900/15 py-20 first:border-t-0 ${last ? "pb-32" : ""}`}>
      <div className="mb-10 flex items-baseline gap-5">
        <span className="font-mono text-[12px] tracking-[0.15em] text-neutral-400">{number}</span>
        <h2 className="text-[30px] tracking-tight" style={{ fontFamily: SERIF }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
