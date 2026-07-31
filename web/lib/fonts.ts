/*
 * Typefaces, in one place so the site and the emails cannot drift apart.
 *
 * Michroma is self-hosted by next/font at build time, so the page makes no
 * request to Google and there is no third-party stylesheet to block rendering.
 */

import { Michroma } from "next/font/google";

export const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  display: "swap"
});

/*
 * The display serif is a system stack rather than a webfont. It costs nothing
 * to load, and the headline is short enough that the small differences between
 * platforms do not read as inconsistency.
 */
export const SERIF =
  "ui-serif, 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
