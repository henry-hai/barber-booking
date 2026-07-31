/*
 * HTTP basic auth for the appointments dashboard.
 *
 * The dashboard shows client names, phone numbers and appointment times, so it
 * is not something to leave open on a public URL. Everything it needs is put
 * behind this guard: the dashboard bundle itself, GET /appointments, and the
 * mail and contacts endpoints left over from the mail client.
 *
 * POST /booking is deliberately NOT guarded. It is the public endpoint the
 * marketing site posts to from another origin, and a browser will not attach
 * basic-auth credentials to it. Putting this middleware in front of it would
 * take the live booking path down.
 *
 * NO PASSWORD IS STORED IN THIS REPO. The credentials come from the
 * DASHBOARD_USER and DASHBOARD_PASSWORD environment variables, set in the host
 * dashboard at deploy time. When they are absent the guard fails closed and
 * every protected route answers 503, so a misconfigured deploy exposes nothing
 * rather than silently serving the dashboard to anyone who finds the URL.
 */

import { createHash, timingSafeEqual } from "crypto";
import { NextFunction, Request, RequestHandler, Response } from "express";

export interface IDashboardCredentials {
  user: string;
  password: string;
}

/* Reads the credentials out of the environment. Returns undefined when either
   is missing or blank, which is what puts the guard into its fail-closed
   state. */
export function readDashboardCredentials(
  env: NodeJS.ProcessEnv = process.env
): IDashboardCredentials | undefined {
  const user = (env.DASHBOARD_USER ?? "").trim();
  const password = env.DASHBOARD_PASSWORD ?? "";

  if (user === "" || password === "") { return undefined; }

  return { user, password };
}

/*
 * Constant-time string comparison.
 *
 * timingSafeEqual throws when the two buffers differ in length, which would
 * leak the length of the real password through the error path, so both sides
 * are hashed to a fixed width first. Comparing the digests is equivalent to
 * comparing the inputs and is always the same size.
 */
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string): Buffer =>
    createHash("sha256").update(value, "utf8").digest();

  return timingSafeEqual(digest(a), digest(b));
}

/* Pulls the user and password out of an Authorization header. Returns
   undefined for anything that is not a well-formed Basic credential. */
export function parseBasicAuth(
  header: string | undefined
): IDashboardCredentials | undefined {
  if (typeof header !== "string") { return undefined; }

  const match = /^Basic\s+(.+)$/i.exec(header.trim());
  if (match === null) { return undefined; }

  let decoded: string;
  try {
    decoded = Buffer.from(match[1] as string, "base64").toString("utf8");
  } catch {
    return undefined;
  }

  /* The password may itself contain colons, so split on the first one only. */
  const separator = decoded.indexOf(":");
  if (separator === -1) { return undefined; }

  return {
    user: decoded.slice(0, separator),
    password: decoded.slice(separator + 1)
  };
}

/*
 * Builds the guard.
 *
 * The credentials are read once when the middleware is created rather than per
 * request: they cannot change without a restart on any of the hosts this runs
 * on, and reading them once keeps a request from depending on process.env.
 */
export function createDashboardAuth(
  env: NodeJS.ProcessEnv = process.env
): RequestHandler {

  const expected = readDashboardCredentials(env);

  if (expected === undefined) {
    console.warn(
      "DASHBOARD_USER and DASHBOARD_PASSWORD are not set. The appointments " +
      "dashboard and its endpoints will refuse every request. Set both in " +
      "the host environment to enable them."
    );
  }

  return (
    inRequest: Request,
    inResponse: Response,
    inNext: NextFunction
  ): void => {
    if (expected === undefined) {
      inResponse.status(503).json({
        ok: false,
        message: "The dashboard is not configured on this host."
      });
      return;
    }

    const offered = parseBasicAuth(inRequest.headers.authorization);

    /* Both comparisons always run, so the response time does not reveal
       whether it was the user or the password that was wrong. */
    const ok = offered !== undefined &&
      [
        safeEqual(offered.user, expected.user),
        safeEqual(offered.password, expected.password)
      ].every(Boolean);

    if (!ok) {
      inResponse.set("WWW-Authenticate",
        'Basic realm="Henry Hai Studio appointments", charset="UTF-8"');
      inResponse.status(401).json({ ok: false, message: "Authentication required." });
      return;
    }

    inNext();
  };
}
