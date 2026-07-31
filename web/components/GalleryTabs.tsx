"use client";

/*
 * The gallery.
 *
 * Haircuts is the two-row layout the live site has: row one at 4:5, row two at
 * 1:1, in the live site's order. The two rows differing in aspect ratio is the
 * design, not an accident, so the dimensions live on the row.
 *
 * Artwork replaces both rows with a single 4:5 row, so the drawings stay hidden
 * until the tab is chosen. 4:5 rather than square because the originals are
 * 4:5, and cropping a drawing to a square cuts its composition; matching row
 * one also means the section does not jump height when the tab changes.
 *
 * Clicking a photograph opens it large rather than navigating to the file.
 * Linking straight to a bare .jpg makes browsers download it instead of showing
 * it, which is what the old gallery did.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { galleryTabs, type IGalleryRow } from "@/lib/gallery";

/* Card width in pixels; rows scroll by roughly two cards per click. */
const CARD = 232;

/*
 * The lightbox sits on bone rather than the near-black that photo viewers
 * normally use. Dark is the better default in isolation, because it removes
 * competing luminance and lets the eye read the photograph's own tonal range.
 * Bone wins here for two reasons specific to this site: the page is bone
 * throughout, and a black overlay on a phone reads as the browser breaking
 * rather than as a designed state. The cost is that pale photographs sit close
 * to the surround, so each one carries a hairline border and a soft shadow.
 */
const LIGHTBOX_SURFACE = "#f5f2ee";

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d={direction === "left" ? "M15 4 L7 12 L15 20" : "M9 4 L17 12 L9 20"} />
    </svg>
  );
}

function Row({
  row, label, onOpen
}: {
  row: IGalleryRow;
  label: string;
  onOpen: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const height = Math.round(CARD * (row.height / row.width));

  const scroll = (direction: -1 | 1) => {
    ref.current?.scrollBy({ left: direction * CARD * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        id={row.id}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {row.photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => onOpen(index)}
            aria-label={`Open ${photo.alt}`}
            className="group relative flex-none overflow-hidden rounded-sm bg-neutral-200"
            style={{ width: CARD, height }}
          >
            <Image
              src={photo.src} alt={photo.alt} fill sizes="232px"
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

function Lightbox({
  photos, index, onClose, onStep
}: {
  photos: Array<{ src: string; alt: string }>;
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-12"
      style={{ backgroundColor: LIGHTBOX_SURFACE }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button" aria-label="Close" onClick={onClose}
        className="absolute right-5 top-5 z-10 rounded-full bg-white/70 p-3 text-neutral-700 shadow-sm backdrop-blur transition-colors hover:text-neutral-900"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 5 L19 19 M19 5 L5 19" />
        </svg>
      </button>

      {[-1, 1].map((delta) => (
        <button
          key={delta}
          type="button"
          aria-label={delta === -1 ? "Previous" : "Next"}
          onClick={(event) => { event.stopPropagation(); onStep(delta); }}
          className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/70 p-4 text-neutral-700 shadow-sm backdrop-blur transition-colors hover:text-neutral-900 ${delta === -1 ? "left-3" : "right-3"}`}
        >
          <Arrow direction={delta === -1 ? "left" : "right"} />
        </button>
      ))}

      <div
        className="relative h-full w-full overflow-hidden rounded-sm border border-neutral-900/10 shadow-[0_2px_40px_rgba(38,48,76,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Image src={photos[index].src} alt={photos[index].alt} fill sizes="100vw" className="object-contain" priority />
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        {index + 1} / {photos.length}
      </p>
    </div>
  );
}

export default function GalleryTabs() {
  const [activeId, setActiveId] = useState(galleryTabs[0].id);
  const [open, setOpen] = useState<{ photos: Array<{ src: string; alt: string }>; index: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const step = useCallback((delta: number) => {
    setOpen((current) => {
      if (!current) { return current; }
      const next = (current.index + delta + current.photos.length) % current.photos.length;
      return { ...current, index: next };
    });
  }, []);

  const active = galleryTabs.find((tab) => tab.id === activeId) ?? galleryTabs[0];

  return (
    <div>
      <div role="tablist" aria-label="Gallery" className="flex gap-7">
        {galleryTabs.map((tab) => {
          const selected = tab.id === active.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`gallery-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`gallery-panel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={`pb-1.5 font-mono text-[12px] uppercase tracking-[0.2em] transition-colors ${
                selected
                  ? "border-b border-neutral-900 text-neutral-900"
                  : "border-b border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`gallery-panel-${active.id}`}
        aria-labelledby={`gallery-tab-${active.id}`}
        className="mt-8 space-y-4"
      >
        {active.rows.map((row, index) => (
          <Row
            key={row.id}
            row={row}
            label={`${active.label} row ${index + 1}`}
            onOpen={(photoIndex) => setOpen({ photos: [...row.photos], index: photoIndex })}
          />
        ))}
      </div>

      {active.id === "artwork" && (
        <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-neutral-600">
          The Godfather. Graphite on a dictionary page.
        </p>
      )}

      {/* Portalled, because a transformed ancestor becomes the containing block
          for position: fixed. Rendered in place inside a Reveal, the overlay
          anchored to the gallery instead of the viewport, which put its close
          button off screen with the page scroll locked. */}
      {mounted && open && createPortal(
        <Lightbox
          photos={open.photos}
          index={open.index}
          onClose={() => setOpen(null)}
          onStep={step}
        />,
        document.body
      )}
    </div>
  );
}
