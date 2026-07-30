/* Bar pinned to every preview so it is always clear which one is on screen. */

import Link from "next/link";

const DIRECTIONS = [
  { id: "01", name: "Editorial Type" },
  { id: "02", name: "Photography First" },
  { id: "03", name: "Bone & Ink" },
  { id: "04", name: "Motion & Material" },
  { id: "05", name: "Editorial Structure" }
];

export function PreviewBar({ current }: { current: string }) {
  return (
    <div className="sticky top-0 z-[100] border-b border-white/10 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-1 gap-y-1 px-4 py-2">
        <Link
          href="/preview"
          className="mr-3 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-white"
        >
          &larr; All
        </Link>
        {DIRECTIONS.map((direction) => (
          <Link
            key={direction.id}
            href={`/preview/${direction.id}`}
            className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
              direction.id === current
                ? "bg-white text-neutral-900"
                : "text-neutral-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="opacity-50">{direction.id}</span> {direction.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* Pinned note explaining what this direction changes and what it does not. */
export function Thesis({
  number, name, thesis, changes, leaves, dark = false
}: {
  number: string; name: string; thesis: string;
  changes: string[]; leaves: string[]; dark?: boolean;
}) {
  return (
    <div className={dark ? "bg-neutral-950 text-neutral-300" : "bg-neutral-100 text-neutral-700"}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs opacity-40">{number}</span>
          <h2 className={`text-lg font-semibold ${dark ? "text-white" : "text-neutral-900"}`}>
            {name}
          </h2>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed">{thesis}</p>
        <div className="mt-4 grid gap-4 text-[13px] sm:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Changes</p>
            <ul className="mt-1.5 space-y-1">
              {changes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="opacity-40">+</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Leaves alone</p>
            <ul className="mt-1.5 space-y-1">
              {leaves.map((item) => (
                <li key={item} className="flex gap-2 opacity-60">
                  <span className="opacity-40">&mdash;</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
