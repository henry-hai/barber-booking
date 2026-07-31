import { describe, expect, it } from "vitest";
import { RateLimiter } from "../src/RateLimit";

const WINDOW = 10 * 60 * 1000;

describe("RateLimiter", () => {

  it("allows up to the limit inside one window", () => {
    const limiter = new RateLimiter(5, WINDOW);
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) {
      expect(limiter.check("1.2.3.4", now + i).allowed).toBe(true);
    }
  });

  it("blocks the request past the limit", () => {
    const limiter = new RateLimiter(5, WINDOW);
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) { limiter.check("1.2.3.4", now); }
    expect(limiter.check("1.2.3.4", now).allowed).toBe(false);
  });

  it("counts each key separately", () => {
    const limiter = new RateLimiter(2, WINDOW);
    const now = 1_000_000;
    limiter.check("1.2.3.4", now);
    limiter.check("1.2.3.4", now);
    expect(limiter.check("1.2.3.4", now).allowed).toBe(false);
    expect(limiter.check("5.6.7.8", now).allowed).toBe(true);
  });

  it("resets once the window has passed", () => {
    const limiter = new RateLimiter(2, WINDOW);
    const now = 1_000_000;
    limiter.check("1.2.3.4", now);
    limiter.check("1.2.3.4", now);
    expect(limiter.check("1.2.3.4", now).allowed).toBe(false);
    expect(limiter.check("1.2.3.4", now + WINDOW + 1).allowed).toBe(true);
  });

  it("reports how long until the window resets", () => {
    const limiter = new RateLimiter(1, WINDOW);
    const now = 1_000_000;
    limiter.check("1.2.3.4", now);
    const blocked = limiter.check("1.2.3.4", now + 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(540);
  });

  it("reports remaining requests", () => {
    const limiter = new RateLimiter(3, WINDOW);
    const now = 1_000_000;
    expect(limiter.check("1.2.3.4", now).remaining).toBe(2);
    expect(limiter.check("1.2.3.4", now).remaining).toBe(1);
    expect(limiter.check("1.2.3.4", now).remaining).toBe(0);
    expect(limiter.check("1.2.3.4", now).remaining).toBe(0);
  });

  it("evicts expired windows rather than growing without bound", () => {
    const limiter = new RateLimiter(5, WINDOW);
    for (let i = 0; i < 100; i++) { limiter.check(`ip-${i}`, 1_000_000); }
    /* Well past the window: the next check should clear everything stale, so a
       previously-exhausted key is allowed again. */
    for (let i = 0; i < 5; i++) { limiter.check("ip-0", 1_000_000 + WINDOW + 1); }
    expect(limiter.check("ip-0", 1_000_000 + WINDOW + 1).allowed).toBe(false);
    expect(limiter.check("ip-1", 1_000_000 + WINDOW + 1).allowed).toBe(true);
  });

});
