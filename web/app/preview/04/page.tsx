"use client";

/*
 * Direction 04 -- Motion & Material.
 *
 * Everything here is interaction, so it has to be used rather than looked at.
 * Scroll for the reveals, hover the photographs, hover the price rows.
 * All of it respects prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PreviewBar, Thesis } from "../_shared/Chrome";
import { Logo } from "../_shared/Logo";
import { art, cuts, hero, portrait, priced } from "../_shared/data";

/* Fades and lifts its children the first time they enter the viewport. */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setShown(true); return; }

    const element = ref.current;
    if (!element) { return; }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

export default function Direction04() {
  return (
    <div className="bg-[#f7f5f2] text-neutral-900">
      <PreviewBar current="04" />
      <Thesis
        number="04"
        name="Motion & Material"
        thesis="This is the daring-detail slot, and the entire craft is in the restraint. One easing curve, one duration, used everywhere: content settles up as it enters view, photographs scale very slowly under the cursor, price rows reveal their detail on hover. No bounce, no parallax, no scroll-jacking. Scroll down and hover things -- it does not read as a screenshot, which is the point."
        changes={["Scroll-triggered settle on every section", "Slow image scale and caption reveal on hover", "Price rows expand detail on hover", "One shared easing curve and duration"]}
        leaves={["Every colour and typeface", "Every layout and section order", "The booking flow", "Falls back to static under reduced-motion"]}
      />

      <header className="sticky top-[41px] z-50 border-b border-neutral-200 bg-[#f7f5f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size={40} tone="#00b9ff" toneEnd="#7de3ff" />
          <span className="group relative cursor-pointer overflow-hidden rounded bg-neutral-900 px-6 py-2.5 text-[12px] font-medium uppercase tracking-[0.15em] text-white">
            <span className="relative z-10">Book</span>
            <span className="absolute inset-0 -translate-x-full bg-[#00b9ff] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
          </span>
        </div>
      </header>

      <section className="relative h-[70vh] min-h-[440px] overflow-hidden">
        <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-neutral-900/55" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#7de3ff]">Est. 2013</p>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-5 max-w-3xl text-[clamp(2.2rem,5.5vw,4.25rem)] font-light leading-[1.03] tracking-[-0.03em] text-white">
                Personalized, luxury haircuts.
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-7 max-w-md text-[15px] leading-relaxed text-white/60">
                Scroll. Everything on this page arrives rather than appears.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
            Hover any photograph
          </p>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[cuts[0], cuts[2], art[0], cuts[4]].map((src, index) => (
            <Reveal key={src} delay={index * 110}>
              <figure className="group cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                  <Image
                    src={src} alt="" fill sizes="25vw"
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-neutral-900/0 transition-colors duration-700 group-hover:bg-neutral-900/15" />
                  <figcaption className="absolute bottom-0 left-0 right-0 translate-y-3 p-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
                    View &rarr;
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              <Reveal>
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                  <Image src={portrait} alt="" fill sizes="33vw" className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.05]" />
                </div>
              </Reveal>
            </div>
            <div className="md:col-span-8">
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
                  Services &mdash; hover a row
                </p>
              </Reveal>
              <ul className="mt-7">
                {priced.map((service, index) => (
                  <Reveal key={service.name} delay={index * 60}>
                    <li className="group flex cursor-pointer items-baseline gap-4 border-b border-neutral-200 py-4 first:border-t">
                      <span className="font-mono text-[11px] text-neutral-300 transition-colors duration-500 group-hover:text-[#00b9ff]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[17px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                        {service.name}
                      </span>
                      <span className="flex-1 border-b border-dotted border-transparent transition-colors duration-500 group-hover:border-neutral-300" />
                      <span className="font-mono text-[13px] text-neutral-500 transition-colors duration-500 group-hover:text-neutral-900">
                        {service.price}
                      </span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(1.8rem,3.5vw,2.75rem)] font-light leading-[1.1] tracking-[-0.02em]">
            Offer three times that suit you.
            <span className="text-neutral-400"> I confirm one by email.</span>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <span className="group relative mt-10 inline-block cursor-pointer overflow-hidden rounded bg-neutral-900 px-9 py-4 text-[12px] font-medium uppercase tracking-[0.22em] text-white">
            <span className="relative z-10">Book an appointment</span>
            <span className="absolute inset-0 -translate-x-full bg-[#00b9ff] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
          </span>
        </Reveal>
      </section>
    </div>
  );
}
