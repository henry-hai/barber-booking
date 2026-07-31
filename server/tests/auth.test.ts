/*
 * Covers the dashboard's basic-auth guard and the credential bootstrap.
 *
 * No secrets and no network. The guard is exercised with fabricated
 * credentials passed in as a plain object, and the bootstrap writes into a
 * temporary directory.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  createDashboardAuth,
  parseBasicAuth,
  readDashboardCredentials
} from "../src/Auth";
import { materialize } from "../src/Credentials";

const USER = "henry";
const PASSWORD = "a-test-password-not-a-real-one";

const encode = (user: string, password: string): string =>
  `Basic ${Buffer.from(`${user}:${password}`, "utf8").toString("base64")}`;

/* Minimal stand-ins for the Express request and response the guard touches. */
const request = (authorization?: string): any => ({
  headers: authorization === undefined ? {} : { authorization }
});

const response = (): any => {
  const sent: any = { status: 200, body: undefined, headers: {} };
  return {
    sent,
    status(code: number) { sent.status = code; return this; },
    json(body: unknown) { sent.body = body; return this; },
    set(key: string, value: string) { sent.headers[key] = value; return this; }
  };
};

const env = { DASHBOARD_USER: USER, DASHBOARD_PASSWORD: PASSWORD };

describe("readDashboardCredentials", () => {

  it("reads a user and password out of the environment", () => {
    expect(readDashboardCredentials(env)).toEqual({
      user: USER, password: PASSWORD
    });
  });

  it("returns undefined when either half is missing", () => {
    expect(readDashboardCredentials({ DASHBOARD_USER: USER })).toBeUndefined();
    expect(readDashboardCredentials({ DASHBOARD_PASSWORD: PASSWORD }))
      .toBeUndefined();
    expect(readDashboardCredentials({})).toBeUndefined();
  });

  it("treats a blank or whitespace-only value as missing", () => {
    expect(readDashboardCredentials({
      DASHBOARD_USER: "   ", DASHBOARD_PASSWORD: PASSWORD
    })).toBeUndefined();
    expect(readDashboardCredentials({
      DASHBOARD_USER: USER, DASHBOARD_PASSWORD: ""
    })).toBeUndefined();
  });

});

describe("parseBasicAuth", () => {

  it("decodes a well-formed Basic header", () => {
    expect(parseBasicAuth(encode(USER, PASSWORD)))
      .toEqual({ user: USER, password: PASSWORD });
  });

  it("is case insensitive on the scheme", () => {
    const header = encode(USER, PASSWORD).replace("Basic", "basic");
    expect(parseBasicAuth(header)).toEqual({ user: USER, password: PASSWORD });
  });

  it("keeps colons that belong to the password", () => {
    expect(parseBasicAuth(encode(USER, "a:b:c")))
      .toEqual({ user: USER, password: "a:b:c" });
  });

  it("rejects a missing, malformed or non-Basic header", () => {
    expect(parseBasicAuth(undefined)).toBeUndefined();
    expect(parseBasicAuth("Bearer abcdef")).toBeUndefined();
    expect(parseBasicAuth("Basic")).toBeUndefined();
    /* Valid base64, but no colon to split on. */
    expect(parseBasicAuth(
      `Basic ${Buffer.from("nocolon", "utf8").toString("base64")}`
    )).toBeUndefined();
  });

});

describe("createDashboardAuth", () => {

  it("calls through when the credentials match", () => {
    const guard = createDashboardAuth(env);
    const next = vi.fn();
    const res = response();

    guard(request(encode(USER, PASSWORD)), res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.sent.status).toBe(200);
  });

  it("answers 401 with a challenge when the password is wrong", () => {
    const guard = createDashboardAuth(env);
    const next = vi.fn();
    const res = response();

    guard(request(encode(USER, "wrong")), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.sent.status).toBe(401);
    expect(res.sent.headers["WWW-Authenticate"]).toContain("Basic realm=");
  });

  it("answers 401 when the user is wrong", () => {
    const guard = createDashboardAuth(env);
    const next = vi.fn();
    const res = response();

    guard(request(encode("someone-else", PASSWORD)), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.sent.status).toBe(401);
  });

  it("answers 401 when no credentials are offered at all", () => {
    const guard = createDashboardAuth(env);
    const next = vi.fn();
    const res = response();

    guard(request(), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.sent.status).toBe(401);
  });

  /* The important one: a host that forgot to set the variables must not end up
     serving the dashboard to everybody. */
  it("fails closed with 503 when the host set no credentials", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const guard = createDashboardAuth({});
    const next = vi.fn();
    const res = response();

    guard(request(encode(USER, PASSWORD)), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.sent.status).toBe(503);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

});

describe("materialize", () => {

  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "barber-credentials-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("writes the value when no file is present", () => {
    const target = path.join(dir, "serverInfo.json");
    const value = JSON.stringify({ smtp: { host: "smtp.example.com" } });

    expect(materialize(target, value, "SERVER_INFO_JSON").outcome).toBe("written");
    expect(JSON.parse(fs.readFileSync(target, "utf8"))).toEqual(JSON.parse(value));
  });

  it("leaves an existing file alone", () => {
    const target = path.join(dir, "serverInfo.json");
    fs.writeFileSync(target, '{"from":"disk"}', "utf8");

    expect(materialize(target, '{"from":"env"}', "SERVER_INFO_JSON").outcome)
      .toBe("existing");
    expect(fs.readFileSync(target, "utf8")).toBe('{"from":"disk"}');
  });

  it("reports absent when neither a file nor a value exists", () => {
    const target = path.join(dir, "missing.json");

    expect(materialize(target, undefined, "SERVER_INFO_JSON").outcome)
      .toBe("absent");
    expect(materialize(target, "   ", "SERVER_INFO_JSON").outcome).toBe("absent");
    expect(fs.existsSync(target)).toBe(false);
  });

  it("throws a pointed error when the value is not valid JSON", () => {
    const target = path.join(dir, "serverInfo.json");

    expect(() => materialize(target, "{not json", "SERVER_INFO_JSON"))
      .toThrow(/SERVER_INFO_JSON is set but is not valid JSON/);
    /* Nothing half-written is left behind for the next reader to trip over. */
    expect(fs.existsSync(target)).toBe(false);
  });

});
