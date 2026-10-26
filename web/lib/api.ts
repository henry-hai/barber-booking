/*
 * Base URL of the API that handles bookings.
 *
 * The marketing site is statically generated and can be hosted anywhere, so
 * the API lives at a separate origin and is fixed at build time. Both APIs,
 * the Express one on Render and the Lambda one behind API Gateway, send
 * permissive CORS headers, which is what makes that work.
 *
 * The default is the Render API, so a build with nothing set keeps pointing
 * where the live site points today. Local development sets
 * NEXT_PUBLIC_API_BASE_URL=http://localhost:8080, and the AWS deploy script
 * sets it to the stack's API Gateway URL.
 */

export const apiBaseUrl: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://henryhaistudio-api.onrender.com";

export const bookingEndpoint = (): string => `${apiBaseUrl.replace(/\/+$/, "")}/booking`;
