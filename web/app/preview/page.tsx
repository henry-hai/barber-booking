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
  TRIPTYCH, heroFits, heroOptions, nav, servicesPhoto, servicesPhotoAlt, shop, type HeroFit
} from "./_shared/data";

const michroma = Michroma({ subsets: ["latin"], weight: "400" });

const SERIF = "ui-serif, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif";

/*
 * Treatments for the hero type. White is the safe default; the rest exist
 * because a photograph behind text is never uniform, and the eye needs either
 * more weight, more separation, or more colour to hold the line.
 */
type HeroType = "white" | "shadow" | "cyan" | "bone" | "ink";

const HERO_TYPE: Record<HeroType, { label: string; note: string; title: string; sub: string; eyebrow: string }> = {
  white: {
    label: "White", note: "Plain white. Cleanest, relies entirely on the scrim.",
    title: "text-white", sub: "text-white/75", eyebrow: "text-white/80"
  },
  shadow: {
    label: "White + halo", note: "White with a very soft halo rather than a drop shadow, so it holds over bright patches without casting an edge across the photograph behind it.",
    title: "text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.35)]",
    sub: "text-white/85", eyebrow: "text-white/90"
  },
  cyan: {
    label: "Cyan eyebrow", note: "White headline with the label in brand cyan. Adds colour without tinting the name itself.",
    title: "text-white", sub: "text-white/80", eyebrow: "text-[#22c3dd]"
  },
  bone: {
    label: "Bone", note: "The site's own bone rather than pure white. Warmer, and ties the hero to the page below it.",
    title: "text-[#f5f2ee]",
    sub: "text-[#f5f2ee]/75", eyebrow: "text-[#f5f2ee]/80"
  },
  ink: {
    label: "Ink", note: "Dark navy type. This is the one that works on the light full frame ground, where white type disappears.",
    title: "text-[#1b2436]", sub: "text-[#1b2436]/70", eyebrow: "text-[#0b6f85]"
  }
};

/*
 * The triptych tiles at exactly one third each, with no mask and no gap, and
 * the two joins are dissolved by narrow strips that blur whatever is behind
 * them.
 *
 * Fading the panel edges to transparent was the wrong tool: transparency has to
 * reveal something, and what showed through was the darker wash behind, which
 * is exactly the dark line down each join. A backdrop blur smears across the
 * seam without any panel becoming transparent, so there is nothing to show
 * through, no gap, and no change to any panel's framing.
 */
const SEAM_WIDTH = 7;

const SECTIONS: Array<[string, string]> = [
  ["about", "About"], ["services", "Services"],
  ["gallery", "Gallery"], ["locations", "Locations"], ["book", "Book"]
];

export default function SitePreview() {
  const [heroId, setHeroId] = useState(heroOptions[0].id);
  const [fit, setFit] = useState<HeroFit>("triptych");
  const [estColor, setEstColor] = useState<EstColor>("deep");
  const [estBig, setEstBig] = useState(true);
  const [heroType, setHeroType] = useState<HeroType>("white");
  const heroOption = heroOptions.find((option) => option.id === heroId) ?? heroOptions[0];
  const fitOption = heroFits.find((option) => option.id === fit) ?? heroFits[0];
  /* KSG 1 cannot be both hero and services photo. */
  const menuPhoto = heroOption.id === "ksg1" ? servicesPhotoAlt : servicesPhoto;
  /* The frames for a multi-panel fit, or null when this hero has no set. */
  const panels = fit === "triptych" ? TRIPTYCH : null;
  const isTriptych = fit === "triptych";

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

        <div className="mx-auto mt-1.5 flex max-w-[1400px] flex-wrap items-center gap-1">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Hero type
          </span>
          {(Object.keys(HERO_TYPE) as HeroType[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setHeroType(key)}
              className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                key === heroType ? "bg-[#22c3dd] text-neutral-900" : "text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {HERO_TYPE[key].label}
            </button>
          ))}
        </div>

        <p className="mx-auto mt-1.5 max-w-[1400px] text-[11px] leading-relaxed text-neutral-500">
          {heroOption.note} <span className="text-neutral-400">{fitOption.note}</span> <span className="text-neutral-400">{HERO_TYPE[heroType].note}</span>
        </p>
      </div>

      {/* nav */}
      <header className="sticky top-[92px] z-50 border-b border-neutral-900/10 bg-[#f5f2ee]/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Logo size={54} variant="e" wordClass={michroma.className} estScale={estBig ? 1.6 : 1} estColor={estColor} estMin={estBig ? 8 : 0} />
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
        {panels ? (
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
            <div className="relative hidden h-full md:flex">
              {panels.map((panel) => (
                <div key={panel.src} className="relative h-full flex-1">
                  {/* Never inherits the hero's blur. Selecting Adrian 3 was
                      softening the whole triptych. */}
                  <Image
                    src={panel.src} alt="" fill priority sizes="34vw"
                    style={{ objectPosition: panel.focus }}
                    className="object-cover"
                  />
                </div>
              ))}

              {/* The two joins. Each strip blurs across the seam it sits on. */}
              {[1, 2].map((join) => (
                <div
                  key={join}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 backdrop-blur-2xl"
                  style={{
                    left: `calc(${(100 / 3) * join}% - ${SEAM_WIDTH / 2}%)`,
                    width: `${SEAM_WIDTH}%`,
                    maskImage: "linear-gradient(to right, transparent, black 35%, black 65%, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 35%, black 65%, transparent)"
                  }}
                />
              ))}
            </div>
          </>
        ) : fit === "full" || isTriptych ? (
          <>
            {/* Blurred copy of the same photograph fills the sides. */}
            <Image
              key={`${heroOption.src}-bg`}
              src={heroOption.src} alt="" fill priority sizes="100vw"
              /*
                The wash is sampled from the left of the frame, well away from
                the signature on the right edge, then blurred hard and lifted
                so it lands as light grey rather than as a dark field. Scaling
                past the frame keeps the blur's own edges out of view, which is
                where the hard bands were coming from.
              */
              /*
                Desaturated to near-grey on purpose. Sampling colour from the
                photograph pulled skin tones into the wash, which is why the
                ground came out pink. A neutral field is also the only thing a
                cropped-in portrait can sit on without the two competing.
              */
              style={{ objectPosition: heroOption.backdropFocus }}
              className="scale-[1.9] object-cover blur-[100px] grayscale brightness-[1.1] contrast-[0.9]"
            />
            {/* Bone laid over the wash, so the ground is unmistakably light and
                any residual detail from the photograph cannot read through. */}
            <div className="absolute inset-0 bg-[#2b2f36]/45" />
            <div className="absolute inset-0 flex justify-center">
              {/* Feathered left and right so the centre frame dissolves into
                  the wash instead of meeting it at a hard vertical cut. */}
              <div
                className="relative h-full"
                /*
                  Feathered on all four edges rather than just left and right.
                  The frame number and the signature sit in the top corners of
                  the originals, and a corner is only carried away when both the
                  horizontal and the vertical fade reach it.
                */
                style={{
                  aspectRatio: "4 / 5",
                  maskImage:
                    "linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)," +
                    "linear-gradient(to bottom, transparent 0%, black 15%, black 92%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)," +
                    "linear-gradient(to bottom, transparent 0%, black 15%, black 92%, transparent 100%)",
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in"
                }}
              >
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
        {/* Full frame sits on a light ground, so it takes a bone veil rather
            than the dark scrim the cropped fits need. Pair it with Ink type. */}
        <div
          className="absolute inset-0"
          /*
            The triptych shows the same three photographs whichever hero is
            selected, so its scrim is fixed. Reading heroOption.scrim here was
            why switching between Adrian 3 and Cam 2 changed the brightness of
            an image set that had not changed at all.
          */
          style={
            isTriptych ? { backgroundColor: "rgba(15,15,17,0.34)" }
            : fit === "full" ? { backgroundColor: "rgba(15,15,17,0.32)" }
            : { backgroundColor: `rgba(15,15,17,${heroOption.scrim})` }
          }
        />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1400px] px-6">
            <Reveal>
              <p className={`font-mono text-[12px] uppercase tracking-[0.3em] ${HERO_TYPE[heroType].eyebrow}`}>
                Est. {shop.est} &middot; Milpitas &amp; Irvine
              </p>
            </Reveal>
            <Reveal delay={130}>
              <h1
                className={`mt-6 max-w-3xl text-[clamp(2.4rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.025em] ${HERO_TYPE[heroType].title}`}
                style={{ fontFamily: SERIF }}
              >
                {shop.name}
              </h1>
              <p className={`mt-5 max-w-xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed ${HERO_TYPE[heroType].sub}`}>
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
          <Logo size={54} variant="e" wordClass={michroma.className} estScale={estBig ? 1.6 : 1} estColor={estColor} estMin={estBig ? 8 : 0} />
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
