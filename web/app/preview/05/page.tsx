/*
 * Direction 05 -- Editorial Structure.
 *
 * Not an internal-architecture change, despite the name. This is visible page
 * structure: numbered sections, a sticky index that tracks position, hairline
 * rules, and a strict left column for labels. Architectural rather than
 * decorative, and it composes with any of the other four.
 */

import Image from "next/image";
import { PreviewBar, Thesis } from "../_shared/Chrome";
import { Logo } from "../_shared/Logo";
import { art, cuts, hero, locations, portrait, priced } from "../_shared/data";

export const metadata = { title: "05 Editorial Structure", robots: { index: false } };

const SERIF = "ui-serif, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif";

const SECTIONS = [
  ["01", "About"], ["02", "Services"], ["03", "Gallery"],
  ["04", "Locations"], ["05", "Book"]
];

export default function Direction05() {
  return (
    <div className="bg-white text-neutral-900">
      <PreviewBar current="05" />
      <Thesis
        number="05"
        name="Editorial Structure"
        thesis="Structure as the design. Sections carry index numbers, a thin sticky index tracks where you are, labels live in a fixed left column, and hairline rules replace every card and shadow. It reads as considered and catalogued -- the way a good monograph or an architecture practice's site reads. It costs nothing in colour or imagery, which is why it layers cleanly on top of 01, 03 or 04."
        changes={["Numbered sections with a sticky index", "Fixed left label column, content right", "Hairline rules replace cards and shadows", "Wider gutters, much more whitespace"]}
        leaves={["Every colour and photograph", "The booking fields and flow", "Typography, unless paired with 01", "The dashboard in client/"]}
      />

      <header className="sticky top-[41px] z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4">
          <Logo size={38} tone="#00b9ff" toneEnd="#7de3ff" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Irvine &middot; Milpitas
          </span>
        </div>
      </header>

      <section className="relative h-[58vh] min-h-[380px]">
        <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-neutral-900/50" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1400px] px-8 pb-12">
            <h1 className="max-w-3xl text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1.05] tracking-[-0.025em] text-white" style={{ fontFamily: SERIF }}>
              Henry Hai&rsquo;s Barbershop
            </h1>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">
              Est. 2013 &middot; 300+ clients &middot; Two locations
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-8">
        <div className="flex gap-16">

          {/* sticky index */}
          <aside className="hidden w-44 shrink-0 lg:block">
            <div className="sticky top-[120px] py-20">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-300">Index</p>
              <ul className="mt-5 space-y-3">
                {SECTIONS.map(([number, label], index) => (
                  <li key={label}>
                    <a href={`#s${number}`} className="flex gap-3 font-mono text-[11px] uppercase tracking-[0.15em]">
                      <span className="text-neutral-300">{number}</span>
                      <span className={index === 0 ? "border-b border-neutral-900 pb-0.5 text-neutral-900" : "text-neutral-400 hover:text-neutral-900"}>
                        {label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-10 border-t border-neutral-200 pt-5">
                <p className="font-mono text-[10px] leading-relaxed uppercase tracking-[0.15em] text-neutral-300">
                  All photography<br />shot in-house
                </p>
              </div>
            </div>
          </aside>

          {/* content */}
          <div className="min-w-0 flex-1">

            <Row id="s01" number="01" title="About">
              <div className="grid gap-10 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <Image src={portrait} alt="" width={600} height={750} sizes="30vw" className="h-auto w-full object-cover" />
                </div>
                <div className="sm:col-span-3">
                  <p className="text-[17px] leading-[1.8] text-neutral-600">
                    I started this barbershop in 2013 and have been dedicated to
                    creating personalized, luxury haircut experiences ever since.
                  </p>
                  <dl className="mt-9 space-y-0">
                    {[["Founded", "2013"], ["Clients", "300+"], ["Locations", "Irvine, Milpitas"], ["Photography", "In-house, DSLR"]].map(([key, value]) => (
                      <div key={key} className="flex gap-6 border-b border-neutral-200 py-2.5 first:border-t">
                        <dt className="w-32 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">{key}</dt>
                        <dd className="text-[14px] text-neutral-800">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </Row>

            <Row id="s02" number="02" title="Services">
              <ul>
                {priced.map((service, index) => (
                  <li key={service.name} className="flex items-baseline gap-5 border-b border-neutral-200 py-4 first:border-t">
                    <span className="font-mono text-[10px] text-neutral-300">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-[16px] text-neutral-900">{service.name}</span>
                    <span className="flex-1" />
                    <span className="font-mono text-[13px] text-neutral-500">{service.price}</span>
                  </li>
                ))}
              </ul>
            </Row>

            <Row id="s03" number="03" title="Gallery">
              <div className="space-y-8">
                <div>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">03.1 &mdash; Haircuts</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {cuts.map((src) => (
                      <Image key={src} src={src} alt="" width={190} height={238} sizes="190px" className="h-[238px] w-[190px] flex-none object-cover" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">03.2 &mdash; Artwork</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {art.map((src) => (
                      <Image key={src} src={src} alt="" width={190} height={238} sizes="190px" className="h-[238px] w-[190px] flex-none object-cover" />
                    ))}
                  </div>
                </div>
              </div>
            </Row>

            <Row id="s04" number="04" title="Locations">
              <div className="grid gap-8 sm:grid-cols-2">
                {locations.map((location, index) => (
                  <div key={location.name} className="border-t border-neutral-200 pt-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                      04.{index + 1}
                    </p>
                    <h4 className="mt-2 text-[20px]" style={{ fontFamily: SERIF }}>{location.name}</h4>
                    <p className="mt-1.5 text-[14px] text-neutral-500">{location.address}</p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">Seasonal hours &mdash; TBD</p>
                  </div>
                ))}
              </div>
            </Row>

            <Row id="s05" number="05" title="Book" last>
              <div className="max-w-2xl space-y-6">
                {["Name", "Email", "Phone"].map((label) => (
                  <div key={label} className="flex items-baseline gap-6">
                    <label className="w-32 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">{label}</label>
                    <div className="flex-1 border-b border-neutral-300 pb-2">&nbsp;</div>
                  </div>
                ))}
                <div className="flex items-baseline gap-6">
                  <label className="w-32 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Date 1</label>
                  <div className="flex-1 border-b border-neutral-300 pb-2">&nbsp;</div>
                </div>
                <div className="flex gap-6">
                  <label className="w-32 shrink-0 pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Availability</label>
                  <div className="h-20 flex-1 border-b border-neutral-300" />
                </div>
                <div className="flex gap-6">
                  <span className="w-32 shrink-0" />
                  <button className="bg-neutral-900 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white">
                    Send request
                  </button>
                </div>
              </div>
            </Row>

          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  id, number, title, children, last = false
}: {
  id: string; number: string; title: string; children: React.ReactNode; last?: boolean;
}) {
  return (
    <section id={id} className={`border-t border-neutral-900/15 py-20 ${last ? "pb-32" : ""}`}>
      <div className="mb-10 flex items-baseline gap-5">
        <span className="font-mono text-[11px] tracking-[0.15em] text-neutral-300">{number}</span>
        <h3 className="text-[28px] tracking-tight" style={{ fontFamily: SERIF }}>{title}</h3>
      </div>
      {children}
    </section>
  );
}
