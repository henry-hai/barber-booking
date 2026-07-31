"use client";

/*
 * Fixed top navigation. Ported from the Babel-in-the-browser class component
 * that used to live at the bottom of index.html; same markup, same Tailwind
 * classes, now compiled ahead of time instead of transpiled in the browser.
 */

import { useState } from "react";
import Image from "next/image";
import { navLinks } from "@/lib/site";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white fixed top-0 left-0 right-0 z-50 shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-6">

        <a href="#" className="flex items-center">
          <Image
            src="/img/logo-original.jpg"
            alt="Henry Hai's Barbershop logo"
            width={48}
            height={48}
            priority
            className="h-12 w-auto inline"
          />
        </a>

        <button
          id="hamburger"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobileMenu"
          className="text-3xl md:hidden block focus:outline-none"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          &#9776;
        </button>

        <nav className="hidden md:flex md:items-center md:space-x-8 text-gray-700 text-lg font-semibold">
          <ul className="flex space-x-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-black">{link.label}</a>
              </li>
            ))}
            <li>
              <a
                href="#appointment"
                className="bg-brand hover:bg-brand-dark transition-colors duration-300 text-white px-4 py-2 rounded-md whitespace-nowrap"
              >
                Book An Appointment
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile dropdown: hidden until the hamburger toggles it. */}
      <div
        id="mobileMenu"
        className={`bg-white text-center py-4 shadow-md md:hidden ${isMenuOpen ? "" : "hidden"}`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block py-2 text-gray-700 hover:bg-gray-200"
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#appointment"
          className="block py-2 mx-4 rounded-md text-white bg-brand hover:bg-brand-dark transition-colors duration-300"
          onClick={() => setIsMenuOpen(false)}
        >
          Book An Appointment
        </a>
      </div>
    </header>
  );
}
