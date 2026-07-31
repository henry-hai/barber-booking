/*
 * Stand-in for next/font/google under Vitest.
 *
 * next/font is a build-time transform, not a runtime library: Next rewrites
 * `Michroma({...})` into a reference to a self-hosted font it generated. Outside
 * the Next compiler the import resolves to something that is not callable, so
 * any component importing a font throws on load.
 *
 * Every export is a Proxy that returns the same loader for whatever font name
 * is asked for, so adding a typeface never means editing this file.
 */

interface IFontResult {
  className: string;
  style: { fontFamily: string };
  variable: string;
}

const loader = (): IFontResult => ({
  className: "mock-font",
  style: { fontFamily: "mock-font" },
  variable: "--mock-font"
});

export default new Proxy({}, { get: () => loader });

export const {
  Michroma, Saira, Aldrich, Iceland, Electrolize, Quantico, Jura,
  Share_Tech, Nova_Square, Syncopate, Chakra_Petch, Oxanium
} = new Proxy({}, { get: () => loader }) as Record<string, typeof loader>;
