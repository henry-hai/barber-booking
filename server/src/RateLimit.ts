/*
 * Fixed-window rate limiter, in memory.
 *
 * The booking endpoint is public and unauthenticated, so it needs a cap. This
 * is deliberately dependency-free and process-local: the API runs as a single
 * long-lived Node process, so a Map is the whole implementation. If it is ever
 * scaled to more than one instance this needs to move to shared storage --
 * until then a shared store would be more moving parts for no benefit.
 */

interface IWindow {
  count: number;
  /* Epoch ms at which this window expires and the count resets. */
  resetAt: number;
}

export interface IRateLimitResult {
  allowed: boolean;
  /* Requests left in the current window. */
  remaining: number;
  /* Seconds until the window resets, for the Retry-After header. */
  retryAfterSeconds: number;
}

export class RateLimiter {

  private windows = new Map<string, IWindow>();
  private limit: number;
  private windowMs: number;
  /* Guards against unbounded growth if the key space is large. */
  private maxKeys: number;

  constructor(limit: number, windowMs: number, maxKeys: number = 10000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.maxKeys = maxKeys;
  }

  /* Records a hit against the key and reports whether it is allowed. */
  public check(key: string, now: number = Date.now()): IRateLimitResult {
    this.evictExpired(now);

    const existing = this.windows.get(key);

    if (existing === undefined || now >= existing.resetAt) {
      /* Only enforce the key cap when adding a key, so callers already being
         tracked are never dropped mid-window. */
      if (existing === undefined && this.windows.size >= this.maxKeys) {
        this.windows.clear();
      }
      this.windows.set(key, { count: 1, resetAt: now + this.windowMs });
      return {
        allowed: true,
        remaining: this.limit - 1,
        retryAfterSeconds: Math.ceil(this.windowMs / 1000)
      };
    }

    existing.count += 1;
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

    return {
      allowed: existing.count <= this.limit,
      remaining: Math.max(0, this.limit - existing.count),
      retryAfterSeconds
    };
  }

  /* Drops windows that have already reset. Called on every check, which is
     cheap at this volume and keeps the Map from growing without bound. */
  private evictExpired(now: number): void {
    for (const [key, window] of this.windows) {
      if (now >= window.resetAt) { this.windows.delete(key); }
    }
  }

  /* Test seam. */
  public reset(): void {
    this.windows.clear();
  }

}
