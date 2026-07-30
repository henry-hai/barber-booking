/*
 * Logo lab. Four reconstructions of the H against four candidate typefaces for
 * the wordmark, all next to the original screenshot at matched size.
 *
 * Pick one letter (a/b/c/d) and one typeface, and the rest of this file goes.
 */

import Image from "next/image";
import Link from "next/link";
import { Saira, Rajdhani, Chakra_Petch, Oxanium } from "next/font/google";
import { Logo, LogoMark, CYAN_BOTTOM, CYAN_TOP, WORDMARK_INK, type LogoVariant } from "../_shared/Logo";

export const metadata = { title: "Logo lab", robots: { index: false } };

const saira = Saira({ subsets: ["latin"], weight: ["600", "700"] });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["600", "700"] });
const chakra = Chakra_Petch({ subsets: ["latin"], weight: ["600", "700"] });
const oxanium = Oxanium({ subsets: ["latin"], weight: ["600", "700"] });

const TYPEFACES = [
  { key: "saira", name: "Saira", note: "Closest to the original. Squared terminals, flat-apex A, even stroke.", cls: `${saira.className} font-bold` },
  { key: "rajdhani", name: "Rajdhani", note: "Narrower and more technical. Reads sharper, slightly less premium.", cls: `${rajdhani.className} font-bold` },
  { key: "chakra", name: "Chakra Petch", note: "Angled cuts on the terminals. Most aggressive of the four.", cls: `${chakra.className} font-bold` },
  { key: "oxanium", name: "Oxanium", note: "Softest corners. Modern but drifts away from the original.", cls: `${oxanium.className} font-bold` }
];

const VARIANTS: Array<{ key: LogoVariant; note: string }> = [
  { key: "a", note: "Measured mean. 10 degree lean, 4.5 unit cut at 40 percent height." },
  { key: "b", note: "13 degree lean, matching the right stroke's measured angle. Thinner cut." },
  { key: "c", note: "Thinnest cut at 3.25 units and the shallowest angle. Most restrained." },
  { key: "d", note: "Heaviest strokes, cut riding higher across the crossbar." }
];

export default function LogoLab() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 px-6 py-3 backdrop-blur">
        <Link href="/preview" className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900">
          &larr; Back to the site preview
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-light tracking-tight">Logo lab</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
          Geometry measured off your screenshot rather than eyeballed. Bounding box
          132&times;144, strokes at 23 percent of the width, crossbar between 38 and
          53 percent, cut crossing at 40 percent. Gradient sampled straight from the
          file: <code className="font-mono text-[13px]">{CYAN_TOP}</code> at the top
          to <code className="font-mono text-[13px]">{CYAN_BOTTOM}</code> at the base,
          which is what makes it lighter at the bottom.
        </p>

        {/* reference */}
        <section className="mt-14 rounded-lg border border-neutral-200 p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Original, for reference
          </p>
          <Image src="/img/smallLogo.JPG" alt="Original logo" width={502} height={174} className="mt-5 h-24 w-auto" />
        </section>

        {/* letterforms */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold">1. The letter</h2>
          <p className="mt-2 text-[14px] text-neutral-500">
            Four cuts of the same construction. Compare the slant and how thin the
            razor line reads.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VARIANTS.map((variant) => (
              <div key={variant.key} className="rounded-lg border border-neutral-200 p-6">
                <div className="flex h-32 items-center justify-center">
                  <LogoMark size={104} variant={variant.key} />
                </div>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-900">
                  Variant {variant.key}
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500">{variant.note}</p>
              </div>
            ))}
          </div>

          {/* small sizes, where it actually lives */}
          <div className="mt-6 rounded-lg border border-neutral-200 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              At navbar and favicon size
            </p>
            <div className="mt-5 flex flex-wrap items-end gap-10">
              {VARIANTS.map((variant) => (
                <div key={variant.key} className="flex items-end gap-4">
                  <LogoMark size={44} variant={variant.key} />
                  <LogoMark size={28} variant={variant.key} />
                  <LogoMark size={16} variant={variant.key} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">{variant.key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* on dark and monochrome */}
          <div className="mt-6 rounded-lg bg-neutral-900 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              On dark, and monochrome for print
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-12">
              {VARIANTS.map((variant) => (
                <LogoMark key={variant.key} size={64} variant={variant.key} />
              ))}
              <LogoMark size={64} variant="a" flat="#ffffff" />
              <LogoMark size={64} variant="a" flat="#14212a" />
            </div>
          </div>
        </section>

        {/* typefaces */}
        <section className="mt-16">
          <h2 className="text-xl font-semibold">2. The wordmark</h2>
          <p className="mt-2 max-w-2xl text-[14px] text-neutral-500">
            Your original is a squared geometric sans. These are the four closest
            things that are free, self-hosted, and load without a third-party
            request. Est. 2013 is now centred under the type, as you asked.
            Shown with the name changed to Henry Hai Studio.
          </p>

          <div className="mt-8 space-y-4">
            {TYPEFACES.map((typeface) => (
              <div key={typeface.key} className="flex flex-wrap items-center gap-8 rounded-lg border border-neutral-200 p-7">
                <div className="w-40 shrink-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-900">{typeface.name}</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500">{typeface.note}</p>
                </div>
                <Logo size={54} variant="a" wordClass={typeface.cls} />
                <div className="rounded bg-neutral-900 px-6 py-4">
                  <Logo size={44} variant="a" wordClass={typeface.cls} ink="#ffffff" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* full lockup */}
        <section className="mt-16">
          <h2 className="text-xl font-semibold">3. Recommended lockup</h2>
          <p className="mt-2 text-[14px] text-neutral-500">
            Variant A with Saira, which is what the site preview uses. Say the word
            and I will swap either half.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-14 rounded-lg border border-neutral-200 p-12">
            <Logo size={80} variant="a" wordClass={TYPEFACES[0].cls} />
            <Logo size={46} variant="a" wordClass={TYPEFACES[0].cls} />
            <LogoMark size={40} variant="a" />
          </div>
        </section>

        <p className="mt-14 text-[13px] text-neutral-400">
          Tell me the letter (a, b, c or d) and the typeface, plus anything still
          off: stroke weight, lean, where the cut lands, how thin it reads.
        </p>
      </div>
    </main>
  );
}
