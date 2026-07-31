"use client";

/*
 * Fades and lifts its children the first time they enter the viewport.
 *
 * One easing curve and one duration are used everywhere on the site, which is
 * the whole discipline of the effect: content should settle rather than
 * announce itself. Under prefers-reduced-motion it renders straight away with
 * no transition at all.
 */

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  /* Stagger, in milliseconds, for items revealed as a group. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const element = ref.current;
    if (!element) { return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
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
