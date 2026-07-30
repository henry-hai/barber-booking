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
  "/img/1_Murthi_1.JPG", "/img/2_Murthi_2.JPG", "/img/3_Jason_1.JPG",
  "/img/4_KSG_1.JPG", "/img/6_Alex_1.JPG", "/img/5_KSG_2.JPG",
  "/img/7_Alex_2.JPG", "/img/8_Adrian_1.JPG", "/img/9_Adrian_2.JPG",
  "/img/10_Adrian_3.JPG", "/img/11_Elijah_2.JPG", "/img/12_Elijah_2.JPG",
  "/img/13_Jason_2.JPG", "/img/14_Chester_1.JPG", "/img/15_Chester_2.JPG"
];

/* Row two, 1:1. */
export const rowTwo = [
  "/img/19_Cam_1.jpg", "/img/20_Cam_2.jpg", "/img/25_Andrew_1.JPG",
  "/img/26_Hoang_1.jpg", "/img/27_JD_1.jpg", "/img/28_JD_2.jpg",
  "/img/29_Dev_1.JPG", "/img/30_Dev_2.JPG", "/img/21_RR_1.JPG",
  "/img/22_RR_2.JPG", "/img/23_RR_3.JPG", "/img/24_RR_4.JPG",
  "/img/16_Ben_1.JPG", "/img/17_Ben_2.JPG", "/img/18_Ben_3.JPG",
  "/img/31_Hoang_2.jpg", "/img/32_Hoang_3.jpg", "/img/33_Hoang_4.jpg",
  "/img/34_Hoang_5.jpg"
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
  /* Frames for the triptych fit. */
  triptych?: string[];
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
  { id: "triptych", label: "Triptych", note: "Cam 2, Adrian 3 and Hoang 1 across the banner." }
] as const;

export type HeroFit = typeof heroFits[number]["id"];

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
    src: "/img/10_Adrian_3.JPG",
    label: "Adrian 3",
    note: "Back of the head, blue braids. The blue already agrees with the cyan. The phone crop is untouched.",
    focusMobile: "50% 34%",
    focusHigh: "18% 4%",
    focusLow: "18% 30%",
    scrim: 0.5,
    blur: true,
    backdropFocus: "4% 46%",
    triptych: ["/img/20_Cam_2.jpg", "/img/10_Adrian_3.JPG", "/img/26_Hoang_1.jpg"]
  },
  {
    id: "cam2",
    src: "/img/20_Cam_2.jpg",
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
    src: "/img/26_Hoang_1.jpg",
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
    src: "/img/4_KSG_1.JPG",
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
export const servicesPhoto = "/img/4_KSG_1.JPG";
/* Used instead when KSG 1 is promoted to the hero. */
export const servicesPhotoAlt = "/img/1_Murthi_1.JPG";

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
