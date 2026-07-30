/* Direction 02 -- Photography First. Layout changes so the photographs lead. */

import Image from "next/image";
import { PreviewBar, Thesis } from "../_shared/Chrome";
import { Logo } from "../_shared/Logo";
import { art, cuts, hero, locations, portrait, priced, nav } from "../_shared/data";

export const metadata = { title: "02 Photography First", robots: { index: false } };

export default function Direction02() {
  return (
    <div className="bg-neutral-950 text-white">
      <PreviewBar current="02" />
      <Thesis
        dark
        number="02"
        name="Photography First"
        thesis="You shot every photograph on this site yourself on a DSLR, and the current gallery shows that work at 224 pixels in a scrolling strip. This inverts the priority: photographs run full-bleed and edge-to-edge, type shrinks to captions and labels, and the page goes dark so the images carry all the light. It is the biggest visual change on the list and the one that most directly monetises what you already own."
        changes={["Dark ground so images carry the light", "Full-bleed hero, no overlay copy box", "Asymmetric editorial gallery grid", "Services over a photograph, not a card", "Type recedes to captions and labels"]}
        leaves={["Section order and content", "The booking fields and flow", "The A..K sheet contract", "The dashboard in client/"]}
      />

      <header className="sticky top-[41px] z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <Logo size={40} ink="#ffffff" tone="#22d3ee" />
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <a key={item} href="#" className="text-[13px] tracking-wide text-white/50 hover:text-white">
                {item}
              </a>
            ))}
            <a href="#" className="bg-white px-5 py-2 text-[12px] font-medium uppercase tracking-[0.15em] text-neutral-900">
              Book
            </a>
          </nav>
        </div>
      </header>

      {/* hero -- full bleed, caption bottom left, no box */}
      <section className="relative h-[92vh] min-h-[560px]">
        <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-neutral-950 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
          <div className="mx-auto flex max-w-[1600px] items-end justify-between gap-8">
            <h1 className="max-w-2xl text-[clamp(2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.03em]">
              Every photograph<br />on this site is<br />
              <span className="text-white/45">a haircut I gave.</span>
            </h1>
            <p className="hidden shrink-0 text-right font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-white/40 sm:block">
              Shot in-house<br />Canon DSLR<br />2013 &mdash; 2026
            </p>
          </div>
        </div>
      </section>

      {/* the grid -- the centrepiece of this direction */}
      <section className="px-2 py-2 sm:px-3 sm:py-3">
        <div className="mx-auto max-w-[1600px]">
          <div
            className="grid grid-cols-6 gap-2 sm:gap-3"
            style={{ gridTemplateRows: "repeat(4, minmax(0,1fr))", height: "clamp(560px, 88vw, 1000px)" }}
          >
            <Tile src={cuts[0]} className="col-span-3 row-span-2" caption="Mid fade" />
            <Tile src={art[0]} className="col-span-2 row-span-3" caption="The Godfather &mdash; graphite" />
            <Tile src={cuts[1]} className="col-span-1 row-span-2" caption="Burst fade" />
            <Tile src={cuts[2]} className="col-span-2 row-span-2" caption="Taper + beard" />
            <Tile src={cuts[3]} className="col-span-1 row-span-2" caption="Low fade" />
            <Tile src={cuts[4]} className="col-span-2 row-span-1" caption="Hard part" />
            <Tile src={art[2]} className="col-span-2 row-span-1" caption="Detail" />
            <Tile src={cuts[5]} className="col-span-2 row-span-1" caption="Scissor top" />
          </div>
        </div>
      </section>

      {/* about -- image left, minimal type right */}
      <section className="mx-auto max-w-[1600px] px-6 py-24 sm:px-12">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/5] w-full">
            <Image src={portrait} alt="Henry Hai" fill sizes="(min-width:768px) 45vw, 90vw" className="object-cover" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">About</p>
            <p className="mt-8 text-[clamp(1.4rem,2.6vw,2.1rem)] font-light leading-[1.35] tracking-[-0.015em]">
              I started this barbershop in 2013 and have been building a
              personalized, luxury haircut experience ever since &mdash;
              <span className="text-white/40"> and photographing every one of them.</span>
            </p>
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[["300+", "Clients"], ["13", "Years"], ["2", "Locations"]].map(([figure, label]) => (
                <div key={label}>
                  <p className="text-3xl font-light tracking-tight">{figure}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* services over a photograph */}
      <section className="relative">
        <div className="relative min-h-[600px]">
          <Image src={cuts[6]} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-neutral-950/75" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">Services</p>
            <div className="mt-8 grid max-w-4xl gap-x-16 gap-y-1 sm:grid-cols-2">
              {priced.map((service) => (
                <div key={service.name} className="flex items-baseline gap-4 border-b border-white/10 py-3.5">
                  <span className="text-[16px] font-light">{service.name}</span>
                  <span className="flex-1" />
                  <span className="font-mono text-[13px] text-white/45">{service.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* booking */}
      <section className="mx-auto max-w-[1600px] px-6 py-24 sm:px-12">
        <div className="grid gap-14 md:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">Book</p>
            <h2 className="mt-6 text-[clamp(1.8rem,3.5vw,2.75rem)] font-light leading-[1.1] tracking-[-0.02em]">
              Offer three times.<br /><span className="text-white/40">I confirm one.</span>
            </h2>
            <div className="mt-10 space-y-3">
              {locations.map((location) => (
                <div key={location.name} className="flex gap-5 border-t border-white/10 pt-3">
                  <span className="w-20 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{location.name}</span>
                  <span className="text-[13px] text-white/40">{location.address}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {["Name", "Email", "Phone", "Preferred date 1"].map((label) => (
              <div key={label}>
                <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">{label}</label>
                <div className="mt-2 h-11 border border-white/15 bg-white/[0.03]" />
              </div>
            ))}
            <button className="mt-3 w-full bg-white py-4 text-[12px] font-medium uppercase tracking-[0.25em] text-neutral-900">
              Send request
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Tile({ src, className, caption }: { src: string; className: string; caption: string }) {
  return (
    <figure className={`group relative overflow-hidden ${className}`}>
      <Image src={src} alt="" fill sizes="50vw" className="object-cover" />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/0 transition-colors duration-300 group-hover:text-white/80">
        {caption}
      </figcaption>
    </figure>
  );
}
