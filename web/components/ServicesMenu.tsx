/*
 * The price list.
 *
 * Each row carries its own terms, revealed on hover or keyboard focus, which
 * replaces the asterisked footnote that used to sit under the whole table. A
 * rule attached to the line it governs gets read; a paragraph below eleven
 * prices does not.
 *
 * The reveal is a grid-rows transition rather than height, because height
 * cannot animate from zero to auto and a fixed pixel height would clip the
 * longer rules.
 */

import { services } from "@/lib/site";

export default function ServicesMenu() {
  return (
    <ul>
      {services.map((service, index) => (
        <li key={service.name} className="group border-b border-neutral-300 py-4 first:border-t">
          <div className="flex items-baseline gap-4">
            <span className="w-6 shrink-0 font-mono text-[11px] text-neutral-400 transition-colors group-hover:text-neutral-900">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[17px] font-medium text-neutral-900 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
              {service.name}
            </span>
            <span className="flex-1 border-b border-dotted border-transparent transition-colors duration-500 group-hover:border-neutral-400" />
            <span className="font-mono text-[14px] font-medium text-neutral-900">
              {service.price}
            </span>
          </div>

          <div className="grid grid-rows-[0fr] pl-10 transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
            <p className="overflow-hidden text-[13px] leading-relaxed text-neutral-600">
              <span className="block pt-2">{service.detail}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
