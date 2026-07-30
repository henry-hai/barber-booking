/*
 * Full site preview, v2 -- NOT part of the site.
 *
 * One page rather than five directions, built from what survived review:
 * editorial type (01), the bone and ink palette keeping the cyan (03 panel A),
 * restrained motion (04), and the numbered index and locations treatment (05).
 * Direction 02 is gone entirely.
 *
 * Every field the server validates is present, the gallery is the live site's
 * two rows in the live site's order, and the policies are listed and gated.
 *
 * Delete web/app/preview/ once this is signed off and folded into the real site.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Saira } from "next/font/google";
import { Logo } from "./_shared/Logo";
import { Gallery } from "./_shared/Gallery";
import { BookingForm, Locations, Reveal, SectionIndex, ServicesMenu } from "./_shared/Parts";
import { hero, nav, servicesPhoto, shop } from "./_shared/data";

const saira = Saira({ subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "Henry Hai Studio",
  robots: { index: false, follow: false }
};

const SERIF = "ui-serif, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif";

const SECTIONS: Array<[string, string]> = [
  ["about", "About"], ["services", "Services"],
  ["gallery", "Gallery"], ["locations", "Locations"], ["book", "Book"]
];

export default function SitePreview() {
  return (
    <div className="bg-[#f7f5f2] text-neutral-900">

      {/* preview chrome */}
      <div className="sticky top-0 z-[100] flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-white/10 bg-neutral-950 px-5 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Preview, not live
        </span>
        <Link href="/preview/logo" className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7de3ff] hover:text-white">
          Logo lab &rarr;
        </Link>
        <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-white">
          Current site
        </Link>
      </div>

      {/* nav */}
      <header className="sticky top-[33px] z-50 border-b border-neutral-900/10 bg-[#f7f5f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <Logo size={44} variant="a" wordClass={`${saira.className} font-bold`} name={shop.name} />
          <nav className="hidden items-center gap-9 md:flex">
            {nav.map((item) => (
              <a
                key={item}
                href={`#s-${item.toLowerCase()}`}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-900"
              >
                {item}
              </a>
            ))}
            <a
              href="#s-book"
              className="group relative overflow-hidden bg-neutral-900 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white"
            >
              <span className="relative z-10">Book</span>
              <span className="absolute inset-0 -translate-x-full bg-[#0be6f9] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
            </a>
          </nav>
          <a href="#s-book" className="bg-neutral-900 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white md:hidden">
            Book
          </a>
        </div>
      </header>

      {/* hero */}
      <section className="relative h-[76vh] min-h-[460px] overflow-hidden">
        <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-neutral-950/55" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1400px] px-6">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/70">
                Est. {shop.est} &middot; Milpitas &amp; Irvine
              </p>
            </Reveal>
            <Reveal delay={130}>
              <h1
                className="mt-6 max-w-3xl text-[clamp(2.4rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.025em] text-white"
                style={{ fontFamily: SERIF }}
              >
                Personalized, luxury haircuts.
              </h1>
            </Reveal>
            <Reveal delay={260}>
              <a
                href="#s-book"
                className="mt-10 inline-block border-b border-white pb-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white"
              >
                Book an appointment
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* body */}
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex gap-16">

          <aside className="hidden w-40 shrink-0 lg:block">
            <div className="sticky top-[140px] py-24">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-300">Index</p>
              <div className="mt-5">
                <SectionIndex sections={SECTIONS} />
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">

            {/* about: no photograph, short */}
            <Section id="about" number="01" title="About">
              <Reveal>
                <p className="max-w-2xl text-[19px] leading-[1.7] text-neutral-700" style={{ fontFamily: SERIF }}>
                  I have been cutting hair since I was thirteen and running this
                  studio since {shop.est}. Every cut is booked one at a time, and
                  every photograph on this page is one I took myself.
                </p>
              </Reveal>
              <Reveal delay={120}>
                <dl className="mt-10 max-w-lg">
                  {[["Cutting since", "2011"], ["Studio", String(shop.est)], ["Locations", "Milpitas, Irvine"], ["Photography", "In-house"]].map(([key, value]) => (
                    <div key={key} className="flex gap-8 border-b border-neutral-200 py-2.5 first:border-t">
                      <dt className="w-36 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">{key}</dt>
                      <dd className="text-[14px] text-neutral-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </Section>

            {/* services */}
            <Section id="services" number="02" title="Services">
              <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <Reveal>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                      <Image
                        src={servicesPhoto} alt="" fill sizes="(min-width:1024px) 30vw, 90vw"
                        className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
                      />
                    </div>
                  </Reveal>
                  <p className="mt-4 text-[13px] leading-relaxed text-neutral-400">
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

            {/* gallery */}
            <Section id="gallery" number="03" title="Gallery">
              <Reveal>
                <Gallery />
              </Reveal>
            </Section>

            {/* locations */}
            <Section id="locations" number="04" title="Locations">
              <Locations />
            </Section>

            {/* book */}
            <Section id="book" number="05" title="Book" last>
              <Reveal>
                <p className="mb-10 max-w-xl text-[17px] leading-relaxed text-neutral-600" style={{ fontFamily: SERIF }}>
                  Offer up to three times that suit you. I confirm one by email.
                </p>
              </Reveal>
              <Reveal delay={100}>
                <BookingForm />
              </Reveal>
            </Section>

          </main>
        </div>
      </div>

      {/* footer */}
      <footer className="border-t border-neutral-900/10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 py-12">
          <Logo size={38} variant="a" wordClass={`${saira.className} font-bold`} name={shop.name} />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
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
    <section id={`s-${id}`} className={`scroll-mt-32 border-t border-neutral-900/15 py-20 first:border-t-0 ${last ? "pb-32" : ""}`}>
      <div className="mb-10 flex items-baseline gap-5">
        <span className="font-mono text-[11px] tracking-[0.15em] text-neutral-300">{number}</span>
        <h2 className="text-[30px] tracking-tight" style={{ fontFamily: SERIF }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
