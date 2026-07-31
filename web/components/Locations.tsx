/*
 * The two shops. Milpitas first, because that is where the practice started,
 * and the note under it says so rather than leaving the order looking arbitrary.
 */

import Reveal from "./Reveal";
import { locations } from "@/lib/site";

export default function Locations() {
  return (
    <div className="grid gap-10 sm:grid-cols-2">
      {locations.map((location, index) => (
        <Reveal key={location.id} delay={index * 120}>
          <div className="border-t border-neutral-900/20 pt-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
              0{index + 1}
            </p>
            <h3 className="mt-2 text-[22px] font-medium tracking-tight text-neutral-900">
              {location.name}
            </h3>
            <p className="mt-2 text-[14px] text-neutral-600">{location.address}</p>
            {location.note && (
              <p className="mt-1 text-[13px] italic text-neutral-500">{location.note}</p>
            )}
            <p className="mt-3 text-[14px] text-neutral-600">
              <a href={`tel:${location.phone.replace(/[^\d+]/g, "")}`} className="hover:text-neutral-900">
                {location.phone}
              </a>
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Seasonal hours, by appointment
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
