"use client";

/*
 * Gallery, preview build.
 *
 * Haircuts is the live site's two rows, in the live site's order, row one at
 * 4:5 and row two at 1:1. Artwork replaces both rows with a single 4:5 row, so
 * the drawings are never visible until the tab is selected.
 *
 * 4:5 for artwork rather than 1:1, because the originals are 4:5 and cropping a
 * drawing to square would cut the composition. Matching row one also means the
 * two tabs share a top edge and the section does not jump height on switch.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { artwork, rowOne, rowTwo } from "./data";

const TABS = [
  { id: "haircuts", label: "Haircuts" },
  { id: "artwork", label: "Artwork" }
];

/* Card width, in pixels. Rows scroll by roughly one card per click. */
const CARD = 232;

function Row({ photos, ratio, label }: { photos: string[]; ratio: "4/5" | "1/1"; label: string }) {
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
        {photos.map((src) => (
          <figure
            key={src}
            className="group relative flex-none overflow-hidden rounded-sm bg-neutral-100"
            style={{ width: CARD, height }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="232px"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            />
          </figure>
        ))}
      </div>

      <button
        type="button" aria-label={`Scroll ${label} left`} onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-3 text-neutral-900 shadow-sm backdrop-blur transition-colors hover:bg-white"
      >
        <Arrow direction="left" />
      </button>
      <button
        type="button" aria-label={`Scroll ${label} right`} onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-3 text-neutral-900 shadow-sm backdrop-blur transition-colors hover:bg-white"
      >
        <Arrow direction="right" />
      </button>
    </div>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={direction === "left" ? "M15 4 L7 12 L15 20" : "M9 4 L17 12 L9 20"} />
    </svg>
  );
}

export function Gallery() {
  const [tab, setTab] = useState("haircuts");

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
              className={`pb-1.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                active
                  ? "border-b border-neutral-900 text-neutral-900"
                  : "border-b border-transparent text-neutral-400 hover:text-neutral-700"
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
            <Row photos={rowOne} ratio="4/5" label="haircuts row 1" />
            <Row photos={rowTwo} ratio="1/1" label="haircuts row 2" />
          </>
        ) : (
          <Row photos={artwork} ratio="4/5" label="artwork" />
        )}
      </div>

      {tab === "artwork" && (
        <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-neutral-500">
          The Godfather. Graphite on a dictionary page, drawn over the entries
          running from god to godfather. Started at 16, finished at 24.
        </p>
      )}
    </div>
  );
}
