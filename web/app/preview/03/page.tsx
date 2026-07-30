/*
 * Direction 03 -- Bone & Ink. Palette only.
 *
 * Rendered twice, because the real question is not "warm neutrals or not" but
 * "does the cyan survive the change". Panel A keeps it as the sole accent;
 * panel B swaps in olive. Same layout, same type, same photographs.
 */

import Image from "next/image";
import { PreviewBar, Thesis } from "../_shared/Chrome";
import { Logo, LogoMark } from "../_shared/Logo";
import { art, cuts, hero, portrait, priced } from "../_shared/data";

export const metadata = { title: "03 Bone & Ink", robots: { index: false } };

const SERIF = "ui-serif, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif";

interface IPalette {
  key: string;
  label: string;
  note: string;
  page: string;
  card: string;
  ink: string;
  body: string;
  rule: string;
  accent: string;
  accentSoft: string;
  logoTone: string;
  logoToneEnd?: string;
}

const CYAN: IPalette = {
  key: "cyan",
  label: "A -- Bone & Ink, cyan retained",
  note: "Your existing mark is untouched. The cyan stops competing with a blue-grey page and a saturated button, and instead becomes the only saturated thing on a warm neutral ground -- which is exactly how a signature colour is supposed to behave.",
  page: "#f7f5f2", card: "#ffffff", ink: "#1c1917", body: "#57534e",
  rule: "#e7e2db", accent: "#00b9ff", accentSoft: "#e6f7ff",
  logoTone: "#00b9ff", logoToneEnd: "#7de3ff"
};

const OLIVE: IPalette = {
  key: "olive",
  label: "B -- Bone & Ink, olive accent",
  note: "The alternative if you ever rebrand. Quieter and more traditional-barber, but it costs you the recognition the cyan already carries with 300+ clients, and the logo has to be redrawn. Shown for completeness -- I do not recommend it over A.",
  page: "#f7f5f2", card: "#ffffff", ink: "#1c1917", body: "#57534e",
  rule: "#e7e2db", accent: "#4a5d43", accentSoft: "#eef0ec",
  logoTone: "#4a5d43", logoToneEnd: "#8a9b82"
};

export default function Direction03() {
  return (
    <div>
      <PreviewBar current="03" />
      <Thesis
        number="03"
        name="Bone & Ink"
        thesis="One change: the neutrals go warm. Today the page sits on a cool blue-grey (#f3f4f6) with white cards and a saturated cyan button, and those three fight each other. Bone and ink is warmer, calmer, and flatters both skin tones and graphite -- which is everything you photograph. Shown twice below so you can see whether your cyan survives it. It does, and it gets stronger."
        changes={["Page ground from cool grey to bone", "Text from blue-grey to true ink", "Hairline rules replace card shadows", "Accent used once per section, not everywhere"]}
        leaves={["All layout and section order", "All typography and sizing", "The logo, in variant A", "Booking flow and the sheet contract"]}
      />

      {/* the logo question, answered first */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400">
            Your mark, rebuilt as vector
          </p>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-neutral-600">
            The screenshot is the only surviving copy, so this is a reconstruction
            of the idea rather than a trace &mdash; an italic H with a razor line
            cut clean through it. As SVG it scales to a billboard, recolours with
            one prop, and weighs about 2&nbsp;KB. Compare against your original:
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-12">
            <div>
              <Image src="/img/smallLogo.JPG" alt="Original logo" width={200} height={78} className="h-16 w-auto" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Original screenshot</p>
            </div>
            <div>
              <Logo size={52} tone="#00b9ff" toneEnd="#7de3ff" ink="#1e2a44" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Rebuilt, cyan</p>
            </div>
            <div className="flex items-center gap-5 rounded bg-neutral-900 px-6 py-4">
              <LogoMark size={44} tone="#00b9ff" toneEnd="#7de3ff" />
              <LogoMark size={44} tone="#ffffff" />
              <LogoMark size={44} tone="#4a5d43" toneEnd="#8a9b82" />
            </div>
          </div>
        </div>
      </div>

      {[CYAN, OLIVE].map((palette) => (
        <PalettePanel key={palette.key} palette={palette} />
      ))}
    </div>
  );
}

function PalettePanel({ palette }: { palette: IPalette }) {
  return (
    <div style={{ backgroundColor: palette.page }}>
      {/* label */}
      <div className="border-y" style={{ borderColor: palette.rule, backgroundColor: palette.card }}>
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: palette.accent }}>
            {palette.label}
          </p>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed" style={{ color: palette.body }}>
            {palette.note}
          </p>
          <div className="mt-5 flex gap-2">
            {[palette.page, palette.card, palette.ink, palette.body, palette.rule, palette.accent].map((hex) => (
              <div key={hex} className="w-24">
                <div className="h-12 rounded-sm border" style={{ backgroundColor: hex, borderColor: "rgba(0,0,0,0.08)" }} />
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: palette.body }}>{hex}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* nav */}
      <div className="border-b" style={{ borderColor: palette.rule, backgroundColor: palette.card }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size={40} tone={palette.logoTone} toneEnd={palette.logoToneEnd} ink={palette.ink} accent={palette.accent} />
          <div className="hidden items-center gap-8 md:flex">
            {["About", "Services", "Gallery"].map((item) => (
              <span key={item} className="text-[14px]" style={{ color: palette.body }}>{item}</span>
            ))}
            <span
              className="rounded px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.15em] text-white"
              style={{ backgroundColor: palette.ink }}
            >
              Book
            </span>
          </div>
        </div>
      </div>

      {/* hero */}
      <div className="relative h-[46vh] min-h-[340px]">
        <Image src={hero} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(28,25,23,0.55)" }} />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: palette.accent }}>
              Est. 2013 &middot; Irvine &amp; Milpitas
            </p>
            <h2 className="mt-5 max-w-2xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] text-white" style={{ fontFamily: SERIF }}>
              Personalized, luxury haircuts.
            </h2>
          </div>
        </div>
      </div>

      {/* about + services */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Image src={portrait} alt="" width={700} height={875} sizes="40vw" className="h-auto w-full rounded-sm object-cover" />
          </div>
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: palette.accent }}>Services</p>
            <ul className="mt-7">
              {priced.map((service) => (
                <li key={service.name} className="flex items-baseline gap-4 border-b py-4 first:border-t" style={{ borderColor: palette.rule }}>
                  <span className="text-[17px]" style={{ color: palette.ink, fontFamily: SERIF }}>{service.name}</span>
                  <span className="flex-1" />
                  <span className="font-mono text-[13px]" style={{ color: palette.body }}>{service.price}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <span className="rounded px-7 py-3.5 text-[12px] font-medium uppercase tracking-[0.2em] text-white" style={{ backgroundColor: palette.ink }}>
                Book an appointment
              </span>
              <span
                className="rounded px-7 py-3.5 text-[12px] font-medium uppercase tracking-[0.2em]"
                style={{ backgroundColor: palette.accentSoft, color: palette.accent }}
              >
                See the gallery
              </span>
            </div>
          </div>
        </div>

        {/* gallery strip */}
        <div className="mt-16 flex gap-4 overflow-x-auto pb-3">
          {[...cuts.slice(0, 5), art[0]].map((src) => (
            <Image key={src} src={src} alt="" width={200} height={250} sizes="200px" className="h-[250px] w-[200px] flex-none rounded-sm object-cover" />
          ))}
        </div>
      </div>
    </div>
  );
}
