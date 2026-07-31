/*
 * Content for the site preview.
 *
 * The two haircut rows reproduce the live site exactly: same photographs, same
 * order, row one at 4:5 and row two at 1:1.
 */

export const shop = {
  name: "Henry Hai Studio",
  est: 2013,
  phone: "408-858-707"
};

export const nav = ["About", "Services", "Gallery", "Locations"];

/* Row one, 4:5. */
export const rowOne = [
  "/img/murthi-01.jpg", "/img/murthi-02.jpg", "/img/jason-01.jpg",
  "/img/ksg-01.jpg", "/img/alex-01.jpg", "/img/ksg-02.jpg",
  "/img/alex-02.jpg", "/img/adrian-01.jpg", "/img/adrian-02.jpg",
  "/img/adrian-03.jpg", "/img/elijah-01.jpg", "/img/elijah-02.jpg",
  "/img/jason-02.jpg", "/img/chester-01.jpg", "/img/chester-02.jpg"
];

/* Row two, 1:1. */
export const rowTwo = [
  "/img/cam-01.jpg", "/img/cam-02.jpg", "/img/andrew-01.jpg",
  "/img/hoang-01.jpg", "/img/jd-01.jpg", "/img/jd-02.jpg",
  "/img/dev-01.jpg", "/img/dev-02.jpg", "/img/rr-01.jpg",
  "/img/rr-02.jpg", "/img/rr-03.jpg", "/img/rr-04.jpg",
  "/img/ben-01.jpg", "/img/ben-02.jpg", "/img/ben-03.jpg",
  "/img/hoang-02.jpg", "/img/hoang-03.jpg", "/img/hoang-04.jpg",
  "/img/hoang-05.jpg"
];

export const artwork = [
  "/img/artwork/godfather-1.jpg",
  "/img/artwork/godfather-2.jpg",
  "/img/artwork/godfather-3.jpg",
  "/img/artwork/godfather-4.jpg"
];

export interface IHeroOption {
  id: string;
  src: string;
  label: string;
  note: string;
  /*
   * object-position values, applied as inline style rather than as Tailwind
   * classes. `object-[34%_14%]` is an ambiguous arbitrary value: Tailwind
   * cannot tell whether it means object-fit or object-position, so it silently
   * generates nothing and the crop never moves.
   *
   * These are 4:5 portraits going into a wide banner, and a phone's tall
   * viewport keeps far more of the frame than a desktop's, so the two need
   * different values to show the same part of the photograph.
   */
  focusMobile: string;
  /* Desktop crops, one per fit mode. See heroFits. */
  focusHigh: string;
  focusLow: string;
  scrim: number;
  blur: boolean;

  /* Where the blurred backdrop is sampled from for the full frame fit. Aimed at
     a flat, uniform part of the photograph so the fill reads as a wash rather
     than as recognisable blurred anatomy. */
  backdropFocus: string;
}

/*
 * How the hero photograph fills a wide banner.
 *
 * "Generative fill" is not on the table: nothing here can invent pixels, and I
 * am not going to pretend otherwise. "Full frame" is the standard alternative
 * and is what streaming services and photo viewers use for the same problem.
 * The whole 4:5 frame sits centred and uncropped, and the empty sides are
 * filled by a scaled, heavily blurred copy of the same photograph. Nothing is
 * fabricated, the colour matches exactly because it is the same pixels, and no
 * part of the composition is lost.
 */
export const heroFits = [
  { id: "high", label: "High", note: "Shifted right so the signature clears the edge, and raised, though not to the very top of the frame." },
  { id: "low", label: "Low", note: "Shifted right and dropped, leaving space above the head. Closest to how the phone reads." },
  { id: "full", label: "Full frame", note: "The whole 4:5 photograph, uncropped, with the sides filled by a blurred copy of itself. No pixels invented." },
  { id: "triptych", label: "Triptych", note: "Cam 2, Adrian 3 and Hoang 1 across the banner, dissolving into one another." }
] as const;

export type HeroFit = typeof heroFits[number]["id"];

/*
 * The triptych compositions.
 *
 * These are fixed sets, not a property of whichever hero is selected. Hanging
 * them off one hero meant picking any other hero silently fell back to a single
 * photograph, so choosing Triptych appeared to do nothing.
 */
export const TRIPTYCH: Array<{ src: string; focus: string }> = [
  { src: "/img/cam-02.jpg", focus: "50% 28%" },
  /*
   * Shifted left of centre on purpose. The HENRYHAI signature sits on the right
   * edge of this frame, and pulling the crop left walks it out of view. Nothing
   * is painted over or invented; the panel simply shows a different part of the
   * photograph.
   */
  { src: "/img/adrian-03.jpg", focus: "34% 26%" },
  { src: "/img/hoang-01.jpg", focus: "50% 30%" }
];

/*
 * Hero candidates, all your own photographs.
 *
 * The old hero was a watermarked Stocksy stock image, so it had to go. The
 * watermark is a licensing mark on someone else's work and removing it would
 * not make the photo licensed.
 *
 * `focus` sets object-position, since these are 4:5 portraits cropped into a
 * wide banner. `scrim` is how dark the overlay has to be for white type to
 * hold, which depends on how bright the photograph is.
 */
export const heroOptions: IHeroOption[] = [
  {
    id: "adrian3",
    src: "/img/adrian-03.jpg",
    label: "Adrian 3",
    note: "Back of the head, blue braids. The blue already agrees with the cyan. The phone crop is untouched.",
    focusMobile: "50% 34%",
    focusHigh: "18% 4%",
    focusLow: "18% 30%",
    scrim: 0.5,
    blur: true,
    backdropFocus: "4% 46%"
  },
  {
    id: "cam2",
    src: "/img/cam-02.jpg",
    label: "Cam 2",
    note: "The most composed of the set. Reads luxury rather than edge.",
    focusMobile: "50% 38%",
    focusHigh: "34% 10%",
    focusLow: "34% 30%",
    backdropFocus: "6% 46%",
    scrim: 0.42,
    blur: false
  },
  {
    id: "hoang1",
    src: "/img/hoang-01.jpg",
    label: "Hoang 1",
    note: "Harder and more street. Furthest from quiet luxury.",
    focusMobile: "50% 40%",
    focusHigh: "34% 10%",
    focusLow: "34% 32%",
    backdropFocus: "6% 46%",
    scrim: 0.42,
    blur: false
  },
  {
    id: "ksg1",
    src: "/img/ksg-01.jpg",
    label: "KSG 1",
    note: "Simple and clean. Promoting this to hero moves Murthi 1 into the services slot.",
    focusMobile: "50% 32%",
    focusHigh: "34% 10%",
    focusLow: "34% 28%",
    backdropFocus: "6% 46%",
    scrim: 0.48,
    blur: false
  }
];

/* The services photograph the original site used. */
export const servicesPhoto = "/img/ksg-01.jpg";
/* Used instead when KSG 1 is promoted to the hero. */
export const servicesPhotoAlt = "/img/murthi-01.jpg";

/*
 * Services. `detail` is the per-item rule, surfaced on hover rather than as a
 * footnote, which folds the old asterisk paragraph into the menu itself.
 */
export const services = [
  { name: "Haircut: Clipper Cut", price: "$35", detail: "Includes a line-up." },
  { name: "Haircut: Clipper + Scissor Cut", price: "$40", detail: "Includes a line-up." },
  { name: "Goatee & Mustache", price: "+$5", detail: "Add-on. Attaches to a haircut." },
  { name: "Goatee, Mustache, & Beard", price: "+$10", detail: "Add-on. Attaches to a haircut." },
  { name: "Eyebrows (Straight Razor)", price: "+$5", detail: "Add-on. Attaches to a haircut." },
  { name: "Design", price: "+$5-10", detail: "Add-on. Priced by complexity." },
  { name: "Lineup: Hairline + Nape", price: "$15", detail: "A la carte only." },
  { name: "Lineup: Full Service + Beard", price: "$20", detail: "A la carte only." },
  { name: "Braids", price: "$20", detail: "A la carte." },
  { name: "Threaded Eyebrows", price: "$15", detail: "A la carte." },
  { name: "Housecall", price: "$100", detail: "Plus add-on prices." }
];

/* Milpitas first: that is where the practice started. */
export const locations = [
  { name: "Milpitas", address: "Kennedy Dr, Milpitas, CA 95035", note: "Where it started." },
  { name: "Irvine", address: "71000 Verano Rd, Irvine, CA 92617", note: "" }
];

/* Unchanged from the live site. Read and accepted before a booking is sent. */
export const policies = [
  "24-hour cancellation notice required.",
  "Late arrivals may need to reschedule.",
  "Being more than 15 minutes late will result in a $15 fee and the appointment may be cancelled.",
  "Being late by 15 minutes or more, 3 times, will result in a temporary 100-day suspension.",
  "Please wash hair thoroughly before for best results.",
  "Remove all upper cartilage earrings if applicable."
];
