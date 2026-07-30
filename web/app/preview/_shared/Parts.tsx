"use client";

/*
 * Interactive pieces of the preview: scroll reveals, the services menu with its
 * rules folded in on hover, the section index, and the full booking form.
 */

import { useEffect, useRef, useState } from "react";
import { locations, policies, services } from "./data";

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

/* -------------------------------------------------------------- services */

/*
 * The old site carried a footnote explaining that add-ons attach to haircuts
 * and line-ups are a la carte. That rule now lives on each row and surfaces on
 * hover, so the menu states its own terms instead of deferring to an asterisk.
 */
export function ServicesMenu() {
  return (
    <ul>
      {services.map((service, index) => (
        <li
          key={service.name}
          className="group border-b border-neutral-200 py-4 first:border-t"
        >
          <div className="flex items-baseline gap-4">
            <span className="w-6 shrink-0 font-mono text-[11px] text-neutral-300 transition-colors group-hover:text-neutral-900">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[17px] font-medium text-neutral-900 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
              {service.name}
            </span>
            <span className="flex-1 border-b border-dotted border-transparent transition-colors duration-500 group-hover:border-neutral-300" />
            <span className="font-mono text-[14px] font-medium text-neutral-900">{service.price}</span>
          </div>
          {/* Rule for this row. Collapsed until hover or keyboard focus. */}
          <div className="grid grid-rows-[0fr] pl-10 transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
            <p className="overflow-hidden text-[13px] leading-relaxed text-neutral-500">
              <span className="block pt-2">{service.detail}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------- index */

/*
 * Sticky section index. Hidden below lg, where a normal bar takes over, because
 * a fixed left rail has nowhere to live on a phone.
 */
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
      {sections.map(([id, label], index) => (
        <li key={id}>
          <a href={`#s-${id}`} className="flex gap-3 font-mono text-[11px] uppercase tracking-[0.15em]">
            <span className="text-neutral-300">{String(index + 1).padStart(2, "0")}</span>
            <span className={active === id ? "border-b border-neutral-900 pb-0.5 text-neutral-900" : "text-neutral-400 transition-colors hover:text-neutral-700"}>
              {label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------- booking */

const field = "w-full border-b border-neutral-300 bg-transparent pb-2.5 pt-1 text-[15px] text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const label = "font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400";

/*
 * The full form, matching the fields the server validates and the sheet stores:
 * name, email, phone, three date/availability pairs, description, and the
 * policies acceptance. Nothing here is decorative -- dropping a field would
 * break the A..K column contract downstream.
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
            <label htmlFor={`p-${id}`} className={label}>{text}</label>
            <input id={`p-${id}`} type={type} className={`${field} mt-2`} />
          </div>
        ))}
      </div>

      {/* All three preferred slots. Two and three are optional but present. */}
      <div className="space-y-8">
        {[1, 2, 3].map((slot) => (
          <div key={slot} className="grid gap-8 sm:grid-cols-3">
            <div>
              <label htmlFor={`p-date${slot}`} className={label}>
                Preferred date {slot}{slot > 1 ? " (optional)" : ""}
              </label>
              <input id={`p-date${slot}`} type="date" className={`${field} mt-2`} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`p-avail${slot}`} className={label}>Availability</label>
              <input
                id={`p-avail${slot}`} type="text"
                placeholder="Describe your availability"
                className={`${field} mt-2 placeholder:text-neutral-300`}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="p-desc" className={label}>Description of haircut / other comments</label>
        <textarea id="p-desc" rows={3} className={`${field} mt-2 resize-none`} />
      </div>

      {/* Policies. Listed in full, and the box gates submission. */}
      <div className="border-t border-neutral-200 pt-8">
        <p className={label}>Booking policies</p>
        <ul className="mt-4 space-y-2">
          {policies.map((policy) => (
            <li key={policy} className="flex gap-3 text-[13px] leading-relaxed text-neutral-500">
              <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-neutral-400" />
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
          <span className="text-[14px] text-neutral-700">
            I have read and accept the booking policies
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!accepted}
        className="group relative overflow-hidden bg-neutral-900 px-10 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
      >
        <span className="relative z-10">Send request</span>
        <span className="absolute inset-0 -translate-x-full bg-[#0be6f9] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-enabled:group-hover:translate-x-0" />
      </button>

      <p className="text-[13px] text-neutral-400">
        You will get a confirmation by email listing every time you offered.
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
          <div className="border-t border-neutral-900/15 pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-300">
              0{index + 1}
            </p>
            <h3 className="mt-2 text-[22px] font-medium tracking-tight text-neutral-900">
              {location.name}
            </h3>
            <p className="mt-2 text-[14px] text-neutral-500">{location.address}</p>
            {location.note && (
              <p className="mt-1 text-[13px] italic text-neutral-400">{location.note}</p>
            )}
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Seasonal hours, by appointment
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
