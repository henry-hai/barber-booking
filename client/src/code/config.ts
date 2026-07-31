/*
 * Where the dashboard sends its API calls.
 *
 * Empty means same origin, which is what this app always wants: the Express
 * server serves this bundle and answers its requests, so a relative
 * "/appointments" is correct locally on port 8080 and correct on a deployed
 * host without a rebuild. It also keeps the browser attaching the basic-auth
 * credentials it already prompted for, which it would not do cross-origin.
 *
 * The previous absolute "http://localhost:8080" only worked on the machine
 * doing the developing.
 */
export const config: { serverAddress: string, userEmail: string } = {
    serverAddress: "",
    userEmail: "your.email@example.com"
  };
