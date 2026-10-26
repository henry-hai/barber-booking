/*
 * Where the dashboard sends its API calls.
 *
 * Empty means same origin, which is the Render deployment: Express serves
 * this bundle and answers its requests, so a relative "/appointments" is
 * correct locally on port 8080 and correct on Render without a rebuild. It
 * also keeps the browser attaching the basic-auth credentials it already
 * prompted for, which it would not do cross-origin.
 *
 * DASHBOARD_API_BASE_URL is inlined at build time by webpack's DefinePlugin.
 * The AWS deploy script sets it to the API Gateway URL, and api.ts then
 * handles the credentials itself because the bundle is on CloudFront and the
 * API is not. Unset, nothing changes.
 *
 * The previous absolute "http://localhost:8080" only worked on the machine
 * doing the developing.
 */

/* Only DefinePlugin's literal replacement exists in the browser. */
declare const process: { env: { DASHBOARD_API_BASE_URL?: string } };

export const config: { serverAddress: string, userEmail: string } = {
    serverAddress: (process.env.DASHBOARD_API_BASE_URL || "").replace(/\/+$/, ""),
    userEmail: "your.email@example.com"
  };
