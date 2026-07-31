/*
 * Base URL of the Express API that handles bookings.
 *
 * The marketing site is statically generated and can be hosted anywhere, so
 * the API lives at a separate origin and is configured at build time. The
 * server sends permissive CORS headers, which is what makes that work.
 */

export const apiBaseUrl: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const bookingEndpoint = (): string => `${apiBaseUrl.replace(/\/+$/, "")}/booking`;
