/*
 * The CORS preflight on POST /booking.
 *
 * This exists because of a bug that got all the way to production. The auth
 * guard is mounted below the booking route, and app.post only matches POST, so
 * an OPTIONS request fell straight past the route into the guard and came back
 * 401. Browsers require a 2xx on a preflight, so the booking form failed for
 * every real visitor, while curl carried on working because it sends no
 * preflight. Nothing in the suite caught it.
 *
 * These tests mount the same middleware ordering main.ts uses and drive it with
 * plain request and response stand-ins, so they need no listening port.
 */

import { describe, expect, it, vi } from "vitest";
import express, { Express } from "express";
import request from "node:http";
import { AddressInfo } from "node:net";
import { createDashboardAuth } from "../src/Auth";

/* Rebuilds main.ts's ordering: CORS and the preflight short-circuit, then the
   public booking route, then the guard over everything else. */
function buildApp(): Express {
  const app = express();
  app.use(express.json({ limit: "64kb" }));

  app.use((inRequest, inResponse, inNext) => {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers",
      "Origin,X-Requested-With,Content-Type,Accept");
    if (inRequest.method === "OPTIONS") {
      inResponse.sendStatus(204);
      return;
    }
    inNext();
  });

  app.get("/healthz", (_inRequest, inResponse) => { inResponse.json({ ok: true }); });
  app.post("/booking", (_inRequest, inResponse) => { inResponse.json({ ok: true }); });

  app.use(createDashboardAuth({
    DASHBOARD_USER: "u", DASHBOARD_PASSWORD: "p"
  }));

  app.get("/appointments", (_inRequest, inResponse) => { inResponse.json([]); });

  return app;
}

/* Starts the app on an ephemeral port, runs one request, shuts it down. */
async function call(
  method: string,
  path: string,
  headers: Record<string, string> = {}
): Promise<{ status: number, headers: Record<string, unknown> }> {
  const app = buildApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      const req = request.request(
        { host: "127.0.0.1", port, path, method, headers },
        (res) => {
          res.resume();
          res.on("end", () => {
            server.close();
            resolve({ status: res.statusCode ?? 0, headers: res.headers });
          });
        }
      );
      req.on("error", (inError) => { server.close(); reject(inError); });
      req.end();
    });
  });
}

const PREFLIGHT = {
  origin: "https://henryhaistudio.com",
  "access-control-request-method": "POST",
  "access-control-request-headers": "content-type"
};

describe("CORS preflight", () => {

  /* The regression. A 401 here blocks the booking form in every browser. */
  it("answers OPTIONS /booking with 204, not 401", async () => {
    const res = await call("OPTIONS", "/booking", PREFLIGHT);
    expect(res.status).toBe(204);
  });

  it("carries the CORS headers on the preflight response", async () => {
    const res = await call("OPTIONS", "/booking", PREFLIGHT);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
    expect(String(res.headers["access-control-allow-methods"])).toContain("POST");
    expect(String(res.headers["access-control-allow-headers"]))
      .toContain("Content-Type");
  });

  /* The short-circuit must not become a hole: OPTIONS reveals nothing, so
     answering it ahead of the guard is safe, but the guard still has to hold
     for every method that returns data. */
  it("still guards GET /appointments", async () => {
    const res = await call("GET", "/appointments");
    expect(res.status).toBe(401);
  });

  it("leaves POST /booking public", async () => {
    const res = await call("POST", "/booking", { "content-type": "application/json" });
    expect(res.status).toBe(200);
  });

  it("leaves /healthz public", async () => {
    const res = await call("GET", "/healthz");
    expect(res.status).toBe(200);
  });

});
