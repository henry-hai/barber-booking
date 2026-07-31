/*
 * The hero banner.
 *
 * Desktop shows a triptych: three photographs tiled at exactly one third each,
 * with the joins dissolved by narrow strips that blur what sits behind them.
 *
 * The blur strip matters. Fading the panel edges to transparent seems like the
 * obvious way to soften a seam, but transparency has to reveal something, and
 * what showed through was a dark line down each join. Overlapping the panels
 * instead widened every box, and a wider box with object-cover on a portrait
 * frame crops harder, so the three began to read as one zoomed-in creature.
 * Blurring across the seam changes neither opacity nor framing.
 *
 * A phone has no room for three, so it falls back to a single frame.
 */

import Image from "next/image";
import Reveal from "./Reveal";
import { SERIF } from "@/lib/fonts";
import { heroPanels, heroMobile, site } from "@/lib/site";

/* Width of each blur strip, as a percentage of the banner. */
const SEAM_WIDTH = 7;

/* One fixed scrim. The three photographs never change, so nothing about the
   page should be able to change how bright they are. */
const SCRIM = "rgba(15,15,17,0.34)";

/* A wide, very diffuse glow rather than a drop shadow. A hard shadow casts a
   visible edge across the fade of the haircuts behind the type. */
const TYPE_HALO = "0 0 34px rgba(0,0,0,0.62), 0 0 12px rgba(0,0,0,0.45)";

export default function Hero() {
  return (
    <section className="relative h-[78vh] min-h-[480px] overflow-hidden">
      {/* Phone: one frame, its own crop. A tall viewport keeps far more of a
          4:5 portrait than a wide one, so it cannot share the desktop value. */}
      <Image
        src={heroMobile.src}
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectPosition: heroMobile.focus }}
        className="scale-105 object-cover blur-[2px] md:hidden"
      />

      {/* Desktop: the triptych. */}
      <div className="relative hidden h-full md:flex">
        {heroPanels.map((panel) => (
          <div key={panel.src} className="relative h-full flex-1">
            <Image
              src={panel.src}
              alt=""
              fill
              priority
              sizes="34vw"
              style={{ objectPosition: panel.focus }}
              className="object-cover"
            />
          </div>
        ))}

        {[1, 2].map((join) => (
          <div
            key={join}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 backdrop-blur-2xl"
            style={{
              left: `calc(${(100 / 3) * join}% - ${SEAM_WIDTH / 2}%)`,
              width: `${SEAM_WIDTH}%`,
              maskImage: "linear-gradient(to right, transparent, black 35%, black 65%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 35%, black 65%, transparent)"
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0" style={{ backgroundColor: SCRIM }} />

      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-[1400px] px-6">
          <Reveal>
            <p
              className="font-mono text-[12px] uppercase tracking-[0.3em] text-white/90"
              style={{ textShadow: TYPE_HALO }}
            >
              Est. {site.foundedYear} &middot; Milpitas &amp; Irvine
            </p>
          </Reveal>

          <Reveal delay={130}>
            <h1
              className="mt-6 max-w-3xl text-[clamp(2.4rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.025em] text-white"
              style={{ fontFamily: SERIF, textShadow: TYPE_HALO }}
            >
              {site.name}
            </h1>
            <p
              className="mt-5 max-w-xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-white/85"
              style={{ textShadow: TYPE_HALO }}
            >
              Personalized, luxury haircuts.
            </p>
          </Reveal>

          <Reveal delay={260}>
            {/* Hover thickens the rule and turns it cyan. Darkening the label
                instead would make it unreadable against the photographs. */}
            <a
              href="#book"
              className="group mt-10 inline-block font-mono text-[12px] uppercase tracking-[0.2em] text-white"
              style={{ textShadow: TYPE_HALO }}
            >
              Book an appointment
              <span className="mt-1.5 block h-[1.5px] w-full bg-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:h-[3px] group-hover:bg-[#0be6f9]" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
