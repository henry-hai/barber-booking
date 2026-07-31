"use client";

/*
 * The phone navigation: a hamburger that opens the whole screen rather than a
 * dropdown list, with the sections at display size and their index numbers.
 *
 * The overlay is portalled to document.body. Left inside the header it was
 * trapped: the header is a positioned element with its own z-index, which
 * starts a stacking context, and no z-index on a descendant can lift something
 * out of that. The bars above it stayed on top no matter what.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { navLinks, site } from "@/lib/site";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* createPortal needs document, which does not exist during the server pass. */
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) { return; }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [...navLinks.map((link) => link.label), "Book"];

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
            Est. {site.foundedYear}
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
