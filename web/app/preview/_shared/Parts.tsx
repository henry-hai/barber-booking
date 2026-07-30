"use client";

/*
 * Interactive pieces of the preview: scroll reveals, the mobile menu, the
 * services menu with its rules folded in, the section index, and the booking
 * form.
 *
 * Contrast note: every muted tone here sits at neutral-500 or darker on the
 * bone ground. neutral-300 and neutral-400 were failing to read.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { locations, nav, policies, services, shop } from "./data";

/* ---------------------------------------------------------------- reveal */

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(true); return; }
    const element = ref.current;
    if (!element) { return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------- mobile menu */

/*
 * A hamburger that opens the whole screen rather than a dropdown list.
 *
 * The overlay is rendered through a portal into document.body. Left inside the
 * header it was trapped: the header is a positioned element with its own
 * z-index, which starts a stacking context, so no z-index on a descendant can
 * lift it above anything outside. That is why the bar above it stayed visible.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) { return; }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); } };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [...nav, "Book"];

  const overlay = (
    <div
      className={`fixed inset-0 z-[300] bg-neutral-950 transition-opacity duration-500 md:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center text-white"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 5 L19 19 M19 5 L5 19" />
        </svg>
      </button>

      <nav className="flex h-full flex-col justify-center px-8">
        {items.map((item, index) => (
          <a
            key={item}
            href={`#s-${item.toLowerCase()}`}
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${120 + index * 70}ms` : "0ms" }}
            className={`flex items-baseline gap-5 border-b border-white/10 py-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <span className="font-mono text-[11px] text-white/35">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[2rem] font-light leading-none tracking-tight text-white">
              {item}
            </span>
          </a>
        ))}

        <div
          style={{ transitionDelay: open ? "500ms" : "0ms" }}
          className={`mt-10 transition-all duration-700 ${open ? "opacity-100" : "opacity-0"}`}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
            Milpitas &amp; Irvine
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#0be6f9]">
            Est. {shop.est}
          </p>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] text-neutral-900"
      >
        {[0, 1, 2].map((line) => (
          <span key={line} className="block h-[1.5px] w-6 bg-current" />
        ))}
      </button>

      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}

/* -------------------------------------------------------------- services */

export function ServicesMenu() {
  return (
    <ul>
      {services.map((service, index) => (
        <li key={service.name} className="group border-b border-neutral-300 py-4 first:border-t">
          <div className="flex items-baseline gap-4">
            <span className="w-6 shrink-0 font-mono text-[11px] text-neutral-400 transition-colors group-hover:text-neutral-900">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[17px] font-medium text-neutral-900 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
              {service.name}
            </span>
            <span className="flex-1 border-b border-dotted border-transparent transition-colors duration-500 group-hover:border-neutral-400" />
            <span className="font-mono text-[14px] font-medium text-neutral-900">{service.price}</span>
          </div>
          <div className="grid grid-rows-[0fr] pl-10 transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
            <p className="overflow-hidden text-[13px] leading-relaxed text-neutral-600">
              <span className="block pt-2">{service.detail}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------- index */

export function SectionIndex({ sections }: { sections: Array<[string, string]> }) {
  const [active, setActive] = useState(sections[0][0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) { setActive(visible.target.id.replace("s-", "")); }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.05, 0.5] }
    );
    sections.forEach(([id]) => {
      const element = document.getElementById(`s-${id}`);
      if (element) { observer.observe(element); }
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <ul className="space-y-3">
      {sections.map(([id, text], index) => (
        <li key={id}>
          <a href={`#s-${id}`} className="flex gap-3 font-mono text-[11px] uppercase tracking-[0.15em]">
            <span className="text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
            <span className={active === id
              ? "border-b border-neutral-900 pb-0.5 text-neutral-900"
              : "text-neutral-500 transition-colors hover:text-neutral-900"}>
              {text}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------- booking */

const field = "w-full border-b border-neutral-400 bg-transparent pb-2.5 pt-1 text-[15px] text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelClass = "font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-600";

/*
 * Every field the server validates, with the same required/optional split:
 * name, email, phone, date 1 and its availability, and the description are
 * required; dates 2 and 3 are optional but must be complete pairs. Dropping or
 * renaming any of these breaks the A..K sheet contract downstream.
 */
export function BookingForm() {
  const [accepted, setAccepted] = useState(false);

  return (
    <form className="space-y-10" onSubmit={(event) => event.preventDefault()}>
      <div className="grid gap-8 sm:grid-cols-3">
        {[
          ["Name", "text", "name"],
          ["Email", "email", "email"],
          ["Phone number", "tel", "phone"]
        ].map(([text, type, id]) => (
          <div key={id}>
            <label htmlFor={`p-${id}`} className={labelClass}>{text}</label>
            <input id={`p-${id}`} type={type} required className={`${field} mt-2`} />
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {[1, 2, 3].map((slot) => (
          <div key={slot} className="grid gap-8 sm:grid-cols-3">
            <div>
              <label htmlFor={`p-date${slot}`} className={labelClass}>
                Preferred date {slot}
                {slot > 1 && <span className="ml-2 normal-case tracking-normal text-neutral-500">optional</span>}
              </label>
              <input id={`p-date${slot}`} type="date" className={`${field} mt-2`} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`p-avail${slot}`} className={labelClass}>Availability</label>
              <input
                id={`p-avail${slot}`} type="text"
                placeholder="Describe your availability"
                className={`${field} mt-2 placeholder:text-neutral-400`}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="p-desc" className={labelClass}>Description of haircut / other comments</label>
        <textarea id="p-desc" rows={3} className={`${field} mt-2 resize-none`} />
      </div>

      <div className="border-t border-neutral-300 pt-8">
        <p className={labelClass}>Booking policies</p>
        <ul className="mt-4 space-y-2">
          {policies.map((policy) => (
            <li key={policy} className="flex gap-3 text-[13px] leading-relaxed text-neutral-600">
              <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-neutral-500" />
              {policy}
            </li>
          ))}
        </ul>

        <label className="mt-6 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="h-4 w-4 accent-neutral-900"
          />
          <span className="text-[14px] text-neutral-800">
            I have read and accept the booking policies
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!accepted}
        className="group relative overflow-hidden bg-neutral-900 px-10 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="relative z-10">Send request</span>
        <span className="absolute inset-0 -translate-x-full bg-[#0be6f9] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-enabled:group-hover:translate-x-0" />
      </button>

      <p className="text-[13px] text-neutral-600">
        You will get a confirmation by email, and I will be in touch soon.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------- locations */

export function Locations() {
  return (
    <div className="grid gap-10 sm:grid-cols-2">
      {locations.map((location, index) => (
        <Reveal key={location.name} delay={index * 120}>
          <div className="border-t border-neutral-900/20 pt-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
              0{index + 1}
            </p>
            <h3 className="mt-2 text-[22px] font-medium tracking-tight text-neutral-900">
              {location.name}
            </h3>
            <p className="mt-2 text-[14px] text-neutral-600">{location.address}</p>
            {location.note && (
              <p className="mt-1 text-[13px] italic text-neutral-500">{location.note}</p>
            )}
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Seasonal hours, by appointment
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
