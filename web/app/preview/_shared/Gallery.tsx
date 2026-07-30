"use client";

/*
 * Gallery, preview build.
 *
 * Haircuts is the live site's two rows, in the live site's order, row one at 4:5
 * and row two at 1:1. Artwork replaces both rows with a single 4:5 row, so the
 * drawings stay hidden until the tab is selected.
 *
 * Clicking a photograph opens it large rather than navigating to the file, which
 * is what "open in new tab" was doing before: browsers download a bare .JPG
 * instead of displaying it. The lightbox keeps people on the page.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { artwork, rowOne, rowTwo } from "./data";

const TABS = [
  { id: "haircuts", label: "Haircuts" },
  { id: "artwork", label: "Artwork" }
];

const CARD = 232;

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d={direction === "left" ? "M15 4 L7 12 L15 20" : "M9 4 L17 12 L9 20"} />
    </svg>
  );
}

function Row({
  photos, ratio, label, onOpen
}: {
  photos: string[]; ratio: "4/5" | "1/1"; label: string; onOpen: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const height = ratio === "4/5" ? Math.round(CARD * 1.25) : CARD;

  const scroll = (direction: -1 | 1) => {
    ref.current?.scrollBy({ left: direction * CARD * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => onOpen(index)}
            aria-label={`Open photograph ${index + 1} of ${label}`}
            className="group relative flex-none overflow-hidden rounded-sm bg-neutral-200"
            style={{ width: CARD, height }}
          >
            <Image
              src={src} alt="" fill sizes="232px"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            />
            <span className="absolute inset-0 bg-neutral-900/0 transition-colors duration-500 group-hover:bg-neutral-900/10" />
            <span className="pointer-events-none absolute bottom-3 right-3 translate-y-1 rounded-full bg-white/90 p-2 text-neutral-900 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="M20 20 L16 16 M11 8 v6 M8 11 h6" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <button
        type="button" aria-label={`Scroll ${label} left`} onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-neutral-900 shadow-sm backdrop-blur transition-colors hover:bg-white"
      >
        <Arrow direction="left" />
      </button>
      <button
        type="button" aria-label={`Scroll ${label} right`} onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-neutral-900 shadow-sm backdrop-blur transition-colors hover:bg-white"
      >
        <Arrow direction="right" />
      </button>
    </div>
  );
}

/* Full-screen viewer. Escape closes, arrows step through the set. */
function Lightbox({
  photos, index, onClose, onStep
}: {
  photos: string[]; index: number; onClose: () => void; onStep: (delta: number) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); }
      if (event.key === "ArrowRight") { onStep(1); }
      if (event.key === "ArrowLeft") { onStep(-1); }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, onStep]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-950/95 p-4 sm:p-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button" aria-label="Close" onClick={onClose}
        className="absolute right-5 top-5 z-10 rounded-full p-3 text-white/70 transition-colors hover:text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 5 L19 19 M19 5 L5 19" />
        </svg>
      </button>

      {[-1, 1].map((delta) => (
        <button
          key={delta}
          type="button"
          aria-label={delta === -1 ? "Previous" : "Next"}
          onClick={(event) => { event.stopPropagation(); onStep(delta); }}
          className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full p-4 text-white/60 transition-colors hover:text-white ${delta === -1 ? "left-3" : "right-3"}`}
        >
          <Arrow direction={delta === -1 ? "left" : "right"} />
        </button>
      ))}

      <div className="relative h-full w-full" onClick={(event) => event.stopPropagation()}>
        <Image
          src={photos[index]} alt="" fill sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
        {index + 1} / {photos.length}
      </p>
    </div>
  );
}

export function Gallery() {
  const [tab, setTab] = useState("haircuts");
  const [open, setOpen] = useState<{ photos: string[]; index: number } | null>(null);

  const step = useCallback((delta: number) => {
    setOpen((current) => {
      if (!current) { return current; }
      const next = (current.index + delta + current.photos.length) % current.photos.length;
      return { ...current, index: next };
    });
  }, []);

  return (
    <div>
      <div role="tablist" aria-label="Gallery" className="flex gap-7">
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`pb-1.5 font-mono text-[12px] uppercase tracking-[0.2em] transition-colors ${
                active
                  ? "border-b border-neutral-900 text-neutral-900"
                  : "border-b border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-4">
        {tab === "haircuts" ? (
          <>
            <Row photos={rowOne} ratio="4/5" label="haircuts row 1"
              onOpen={(index) => setOpen({ photos: rowOne, index })} />
            <Row photos={rowTwo} ratio="1/1" label="haircuts row 2"
              onOpen={(index) => setOpen({ photos: rowTwo, index })} />
          </>
        ) : (
          <Row photos={artwork} ratio="4/5" label="artwork"
            onOpen={(index) => setOpen({ photos: artwork, index })} />
        )}
      </div>

      {tab === "artwork" && (
        <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-neutral-600">
          The Godfather. Graphite on a dictionary page.
        </p>
      )}

      {open && (
        <Lightbox
          photos={open.photos}
          index={open.index}
          onClose={() => setOpen(null)}
          onStep={step}
        />
      )}
    </div>
  );
}
