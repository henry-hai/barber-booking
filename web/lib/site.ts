/*
 * Single source of truth for the shop's public details. Metadata, Open Graph
 * tags and the page copy all read from here so there is one place to edit.
 */

export const site = {
  name: "Henry Hai's Barbershop",
  shortName: "Henry Hai's Barbershop",
  description:
    "Personalized, luxury haircut experiences in Irvine and Milpitas, California. " +
    "Clipper and scissor cuts, beard work, line-ups and designs by appointment.",
  /* Overridden per deployment; the fallback keeps builds working locally. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://henryhaibarbershop.com",
  ogImage: "/img/barbershop-interior.jpg",
  instagram: "https://www.instagram.com/henryhai_",
  linkedin: "https://www.linkedin.com/in/henry-hai-nguyen",
  phone: "408-858-707",
  foundedYear: 2013
} as const;

export const locations = [
  {
    id: "irvine",
    name: "Irvine",
    address: "71000 Verano Rd, Irvine, CA 92617",
    phone: site.phone,
    image: "/img/jason-02.jpg",
    hours: ["Mon - Fri: TBD", "Sat: TBD", "Sun: TBD"]
  },
  {
    id: "milpitas",
    name: "Milpitas",
    address: "Kennedy Dr, Milpitas, CA 95035",
    phone: site.phone,
    image: "/img/adrian-01.jpg",
    hours: ["Mon - Fri: TBD", "Sat: TBD", "Sun: TBD"]
  }
] as const;

export const services = [
  { name: "Haircut: Clipper Cut", price: "$35" },
  { name: "Haircut: Clipper + Scissor Cut", price: "$40" },
  { name: "Goatee & Mustache", price: "+ $5" },
  { name: "Goatee, Mustache, & Beard", price: "+ $10" },
  { name: "Eyebrows (Straight Razor)", price: "+ $5" },
  { name: "Design", price: "+ $5-10" },
  { name: "Lineup: Hairline + Nape", price: "$15" },
  { name: "Lineup: Full Service + Beard", price: "$20" },
  { name: "Braids", price: "$20" },
  { name: "Threaded Eyebrows", price: "$15" },
  { name: "Housecall", price: "$100 + Add-On Prices" }
] as const;

export const bookingPolicies = [
  "24-hour cancellation notice required.",
  "Late arrivals may need to reschedule.",
  "Being > 15 minutes late will result in a 15$ fee & the appointment may be cancelled.",
  "Being late by ≥ 15min, 3 times will result in a temporary 100-day suspension.",
  "Please wash hair thoroughly before for best results.",
  "Remove all upper cartilage earrings if applicable."
] as const;

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#locations", label: "Locations" }
] as const;
