/*
 * Logo lab, second pass.
 *
 * The letter is now built from a row-by-row scan of the original rather than by
 * eye. Ten candidate typefaces are set at the original's actual weight, which is
 * light, not bold. Getting that wrong is why the first four all read as off.
 */

import Image from "next/image";
import Link from "next/link";
import {
  Iceland, Aldrich, Electrolize, Quantico, Jura, Share_Tech,
  Nova_Square, Syncopate, Michroma, Saira
} from "next/font/google";
import { Logo, LogoMark, CYAN_BOTTOM, CYAN_TOP, type LogoVariant } from "../_shared/Logo";

export const metadata = { title: "Logo lab", robots: { index: false } };

const iceland = Iceland({ subsets: ["latin"], weight: "400" });
const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });
const electrolize = Electrolize({ subsets: ["latin"], weight: "400" });
const quantico = Quantico({ subsets: ["latin"], weight: "400" });
const jura = Jura({ subsets: ["latin"], weight: ["400", "500"] });
const shareTech = Share_Tech({ subsets: ["latin"], weight: "400" });
const novaSquare = Nova_Square({ subsets: ["latin"], weight: "400" });
const syncopate = Syncopate({ subsets: ["latin"], weight: "400" });
const michroma = Michroma({ subsets: ["latin"], weight: "400" });
const saira = Saira({ subsets: ["latin"], weight: ["300", "400"] });

const TYPEFACES = [
  { name: "Aldrich", note: "Squared bowls, flat apex A, straight R leg. My closest read of the original.", cls: aldrich.className },
  { name: "Electrolize", note: "Thin and even, superelliptical O. Very near, slightly narrower.", cls: electrolize.className },
  { name: "Iceland", note: "Thinnest of the set, wide counters. Reads lighter than the original.", cls: iceland.className },
  { name: "Quantico", note: "Squared with a little more contrast. Slightly more corporate.", cls: quantico.className },
  { name: "Nova Square", note: "Hard corners, technical. Firmer than the original.", cls: novaSquare.className },
  { name: "Jura", note: "Softened square, humanist details. Warmer, less machined.", cls: jura.className },
  { name: "Share Tech", note: "Narrow techno. Good small, drifts wide of the original.", cls: shareTech.className },
  { name: "Syncopate", note: "Very wide, high contrast. Handsome but a different animal.", cls: syncopate.className },
  { name: "Michroma", note: "Widest here. Strong large, unusable small.", cls: michroma.className },
  { name: "Saira Light", note: "The closest non-square option, for contrast with the rest.", cls: `${saira.className} font-light` }
];

const VARIANTS: Array<{ key: LogoVariant; note: string }> = [
  { key: "a", note: "Straight off the measurements. 4 unit cuts at 12 degrees." },
  { key: "b", note: "Same placement, cuts thinned to 3 units." },
  { key: "c", note: "Cuts steepened to 14 degrees and slightly thicker." },
  { key: "d", note: "Heavier strokes, cuts sitting closer to the crossbar." }
];

export default function LogoLab() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 px-6 py-3 backdrop-blur">
        <Link href="/preview" className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900">
          &larr; Back to the site preview
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-light tracking-tight">Logo lab, second pass</h1>

        <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-relaxed text-neutral-600">
          <p>
            Three things were wrong last time. The letter had one slash across it
            instead of <strong className="text-neutral-900">two separate cuts</strong>,
            one per stroke, both above the crossbar with the right one higher. The
            viewBox was clipping the bottom-left of the left stroke. And the
            wordmark was set <strong className="text-neutral-900">bold when the
            original is light</strong>, which is why none of the four read right.
          </p>
          <p>
            A row-by-row scan of your file gives the construction: 132&times;144
            box, 7.4 degree slant, strokes at 22.7 percent of the width, crossbar
            from 42 to 58 percent, left cut centred at 22 percent across and 35
            percent down, right cut at 84 percent across and 21 percent down, both
            at about 12 degrees. Gradient sampled at{" "}
            <code className="font-mono text-[13px]">{CYAN_TOP}</code> down to{" "}
            <code className="font-mono text-[13px]">{CYAN_BOTTOM}</code>.
          </p>
        </div>

        <section className="mt-14 rounded-lg border border-neutral-200 p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400">
            Original and rebuild, matched height
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-16">
            <div>
              <Image src="/img/smallLogo.JPG" alt="Original" width={502} height={174} className="h-[120px] w-auto" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Original</p>
            </div>
            <div>
              <LogoMark size={120} variant="a" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Rebuild, variant A</p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold">1. The letter</h2>
          <p className="mt-2 text-[14px] text-neutral-500">
            All four now have two cuts and the full uncropped extent. They differ
            only in cut thickness and angle.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VARIANTS.map((variant) => (
              <div key={variant.key} className="rounded-lg border border-neutral-200 p-6">
                <div className="flex h-36 items-center justify-center">
                  <LogoMark size={116} variant={variant.key} />
                </div>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-900">
                  Variant {variant.key}
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500">{variant.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-neutral-900 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              Small sizes, on dark, and flat for print
            </p>
            <div className="mt-5 flex flex-wrap items-end gap-10">
              <LogoMark size={44} variant="a" />
              <LogoMark size={28} variant="a" />
              <LogoMark size={16} variant="a" />
              <LogoMark size={56} variant="a" flat="#ffffff" />
              <LogoMark size={56} variant="a" flat="#0be6f9" />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-semibold">2. The wordmark</h2>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-neutral-500">
            Ten squared geometric faces at light weight. Each is shown twice, once
            with your original wording so the letterforms line up against the file
            above, and once with the new name. Est. 2013 is centred now. I cannot
            identify the original with certainty from a 502 pixel screenshot, so if
            none of these land, run the file through a font identifier and give me
            the name.
          </p>

          <div className="mt-8 space-y-3">
            {TYPEFACES.map((typeface) => (
              <div key={typeface.name} className="rounded-lg border border-neutral-200 p-6">
                <div className="flex flex-wrap items-center gap-x-12 gap-y-5">
                  <p className="w-32 shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-900">
                    {typeface.name}
                  </p>
                  <Logo size={52} variant="a" wordClass={typeface.cls} lines={["Henry Hai's", "Barbershop"]} />
                  <Logo size={52} variant="a" wordClass={typeface.cls} />
                </div>
                <p className="mt-3 text-[12px] text-neutral-500">{typeface.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-lg border border-neutral-200 p-10">
          <h2 className="text-xl font-semibold">3. In place</h2>
          <p className="mt-2 text-[14px] text-neutral-500">
            Aldrich at navbar size and large, which is what the site preview uses
            until you pick.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-16">
            <Logo size={84} variant="a" wordClass={aldrich.className} />
            <Logo size={46} variant="a" wordClass={aldrich.className} />
            <div className="rounded bg-neutral-900 px-7 py-5">
              <Logo size={46} variant="a" wordClass={aldrich.className} ink="#ffffff" />
            </div>
          </div>
        </section>

        <p className="mt-14 text-[13px] text-neutral-400">
          Tell me the variant letter and the typeface, plus anything still off in
          the cuts: thickness, angle, or where they sit relative to the crossbar.
        </p>
      </div>
    </main>
  );
}
