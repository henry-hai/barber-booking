/*
 * Henry Hai Studio, statically generated.
 *
 * Everything here is a server component except the hero's reveals, the gallery,
 * the section index, the mobile menu and the booking form, which are the only
 * parts that need to run in the browser.
 *
 * Structure is the design: numbered sections down a fixed left index, hairline
 * rules instead of cards, and a great deal of space. The index is hidden below
 * the large breakpoint, where the top bar takes over.
 */

import Image from "next/image";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import { Logo } from "@/components/Logo";
import GalleryTabs from "@/components/GalleryTabs";
import ServicesMenu from "@/components/ServicesMenu";
import SectionIndex from "@/components/SectionIndex";
import MobileMenu from "@/components/MobileMenu";
import LocationsList from "@/components/Locations";
import BookingForm from "@/components/BookingForm";
import { SERIF } from "@/lib/fonts";
import { locations, navLinks, services, site } from "@/lib/site";

/* LocalBusiness markup, so the shop's name, locations and services are legible
   to search engines without them having to infer any of it from the copy. */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}${site.ogImage}`,
  telephone: site.phone,
  foundingDate: String(site.foundedYear),
  sameAs: [site.instagram],
  location: locations.map((location) => ({
    "@type": "Place",
    name: `${site.name}, ${location.name}`,
    address: { "@type": "PostalAddress", streetAddress: location.address, addressCountry: "US" }
  })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service.name },
      price: service.price
    }))
  }
};

const SECTIONS = [
  ["about", "About"], ["services", "Services"],
  ["gallery", "Gallery"], ["locations", "Locations"], ["book", "Book"]
] as const;

export default function Home() {
  return (
    <div className="bg-[#f5f2ee] text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-neutral-900/10 bg-[#f5f2ee]/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <a href="#" aria-label={site.name}>
            <Logo size={54} />
          </a>

          <nav className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={`#s-${link.label.toLowerCase()}`}
                className="font-mono text-[13px] uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:text-neutral-900"
              >
                {link.label}
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

      <Hero />

      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex gap-16">
          <aside className="hidden w-40 shrink-0 lg:block">
            <div className="sticky top-[120px] py-24">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-neutral-400">
                Index
              </p>
              <div className="mt-5">
                <SectionIndex sections={SECTIONS} />
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            {/* No prose and no portrait. The record says more with less, which
                is the point of the section. */}
            <Section id="about" number="01" title="About">
              <Reveal>
                <dl className="max-w-xl">
                  {[
                    ["Cutting since", String(site.foundedYear)],
                    ["Locations", "Milpitas & Irvine"],
                    ["Photography", "In-house"]
                  ].map(([key, value]) => (
                    <div key={key} className="flex items-baseline gap-8 border-b border-neutral-300 py-4 first:border-t">
                      <dt className="w-40 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        {key}
                      </dt>
                      <dd className="text-[17px] text-neutral-900" style={{ fontFamily: SERIF }}>
                        {value}
                      </dd>
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
                        src="/img/ksg-01.jpg"
                        alt="Mid fade with a scissor-cut top"
                        fill
                        sizes="(min-width: 1024px) 30vw, 90vw"
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
                <GalleryTabs />
              </Reveal>
            </Section>

            <Section id="locations" number="04" title="Locations">
              <LocationsList />
            </Section>

            <Section id="book" number="05" title="Book" last>
              <Reveal>
                <p className="mb-10 max-w-xl text-[17px] leading-relaxed text-neutral-700" style={{ fontFamily: SERIF }}>
                  Offer up to three times that suit you. I will confirm one with you soon.
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
          <Logo size={54} />
          <div className="flex items-center gap-6">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-neutral-500 transition-colors hover:text-neutral-900"
            >
              <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
              </svg>
            </a>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              &copy; {new Date().getFullYear()} {site.name}
            </p>
          </div>
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
    <section
      id={`s-${id}`}
      className={`scroll-mt-28 border-t border-neutral-900/15 py-20 first:border-t-0 ${last ? "pb-32" : ""}`}
    >
      <div className="mb-10 flex items-baseline gap-5">
        <span className="font-mono text-[12px] tracking-[0.15em] text-neutral-400">{number}</span>
        <h2 className="text-[30px] tracking-tight" style={{ fontFamily: SERIF }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
