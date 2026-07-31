"use client";

/*
 * One horizontally scrolling row of photos with arrow buttons on either side.
 *
 * This replaces src/GalleryRow.ts from the Webpack bundle. That version looked
 * the container up by id and scrolled it by a fixed 200px; this one holds a ref
 * instead, but the scroll distance and smooth behavior are unchanged.
 */

import { useRef } from "react";
import Image from "next/image";
import type { IGalleryRow } from "@/lib/gallery";

/* Pixels scrolled per arrow click -- carried over from the original gallery. */
const SCROLL_AMOUNT = 200;

interface IGalleryRowProps {
  row: IGalleryRow;
  /* Describes the row for screen readers on the arrow buttons. */
  label: string;
}

export default function GalleryRow({ row, label }: IGalleryRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: -1 | 1) => {
    containerRef.current?.scrollBy({
      left: direction * SCROLL_AMOUNT,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        aria-label={`Scroll ${label} left`}
        className="absolute left-0 z-10 bg-gray-800 text-white px-4 py-2 rounded-full"
        onClick={() => scrollBy(-1)}
      >
        &larr;
      </button>

      <div
        ref={containerRef}
        id={row.id}
        className="flex overflow-x-auto space-x-4 px-12 scroll-smooth"
      >
        {row.photos.map((photo) =>
          row.pending ? (
            /* The image file is not in the repo yet; name the file it wants so
               the gap is obvious rather than a broken image icon. */
            <div
              key={photo.src}
              className={`${row.sizeClasses} flex-none flex items-center justify-center rounded-lg shadow-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-center`}
            >
              <span className="text-xs text-gray-500 break-all">
                Add <code>public{photo.src}</code>
              </span>
            </div>
          ) : (
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              width={row.width}
              height={row.height}
              sizes={`${row.width}px`}
              className={`${row.sizeClasses} flex-none object-cover rounded-lg shadow-lg`}
            />
          )
        )}
      </div>

      <button
        type="button"
        aria-label={`Scroll ${label} right`}
        className="absolute right-0 z-10 bg-gray-800 text-white px-4 py-2 rounded-full"
        onClick={() => scrollBy(1)}
      >
        &rarr;
      </button>
    </div>
  );
}
