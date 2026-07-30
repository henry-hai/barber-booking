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
  focus: string;
  scrim: number;
  blur: boolean;
}

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
    note: "Back of the head, blue braids. Mysterious, and the blue already agrees with the cyan. High key, so it carries a heavier scrim and a light blur.",
    focus: "50% 34%",
    scrim: 0.5,
    blur: true
  },
  {
    id: "cam2",
    src: "/img/20_Cam_2.jpg",
    label: "Cam 2",
    note: "The most composed of the set. Reads luxury rather than edge.",
    focus: "50% 38%",
    scrim: 0.42,
    blur: false
  },
  {
    id: "hoang1",
    src: "/img/26_Hoang_1.jpg",
    label: "Hoang 1",
    note: "Harder and more street. Furthest from quiet luxury.",
    focus: "50% 40%",
    scrim: 0.42,
    blur: false
  },
  {
    id: "ksg1",
    src: "/img/4_KSG_1.JPG",
    label: "KSG 1",
    note: "Simple and clean. Promoting this to hero moves Murthi 1 into the services slot.",
    focus: "50% 32%",
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
