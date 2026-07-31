"use client";

/*
 * The numbered index that tracks position down the page.
 *
 * Hidden below the large breakpoint, where the top bar takes over: a fixed left
 * rail has nowhere to live on a phone.
 */

import { useEffect, useState } from "react";

export default function SectionIndex({
  sections
}: {
  /* [id, label] pairs. The id matches a section's `s-` prefixed DOM id. */
  sections: ReadonlyArray<readonly [string, string]>;
}) {
  const [active, setActive] = useState(sections[0][0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        /* The most-visible intersecting section wins, so scrolling past a short
           section does not leave the index pointing at it. */
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) { setActive(visible.target.id.replace("s-", "")); }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.05, 0.5] }
    );

    for (const [id] of sections) {
      const element = document.getElementById(`s-${id}`);
      if (element) { observer.observe(element); }
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <ul className="space-y-3">
      {sections.map(([id, label], index) => (
        <li key={id}>
          <a href={`#s-${id}`} className="flex gap-3 font-mono text-[11px] uppercase tracking-[0.15em]">
            <span className="text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
            <span
              className={active === id
                ? "border-b border-neutral-900 pb-0.5 text-neutral-900"
                : "text-neutral-500 transition-colors hover:text-neutral-900"}
            >
              {label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
