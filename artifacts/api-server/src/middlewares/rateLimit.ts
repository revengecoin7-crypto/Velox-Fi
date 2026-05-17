import type { Request, Response, NextFunction } from "express";

// In-memory token bucket per (ip + bucket key). Resets every windowMs.
// For a multi-instance deployment this would need to be moved to Redis,
// but on a single Railway service this is fine and zero-dependency.
interface BucketState { count: number; resetAt: number }
const buckets = new Map<string, BucketState>();

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded.length > 0) return String(forwarded[0]).split(",")[0].trim();
  return req.ip ?? "unknown";
}

export interface RateLimitOptions {
  windowMs: number;     // time window in milliseconds
  max:      number;     // max requests per IP per window
  key:      string;     // bucket label so different routes don't share quota
}

/**
 * Sliding(ish) rate limiter middleware. Returns 429 with Retry-After when
 * the bucket for (ip + key) is exhausted within windowMs.
 */
export function rateLimit(opts: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = clientIp(req);
    const bucketKey = `${opts.key}:${ip}`;
    const now = Date.now();

    let state = buckets.get(bucketKey);
    if (!state || state.resetAt <= now) {
      state = { count: 0, resetAt: now + opts.windowMs };
      buckets.set(bucketKey, state);
    }

    state.count += 1;

    if (state.count > opts.max) {
      const retryAfterSec = Math.ceil((state.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSec));
      res.status(429).json({
        error:        "Too many requests. Slow down.",
        retryAfterMs: state.resetAt - now,
      });
      return;
    }

    next();
  };
}

// Sweep expired buckets every 5 min to keep the Map from growing unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}, 5 * 60 * 1000).unref?.();

// ── Preset limits ──────────────────────────────────────────────────────────
// Tight: auth endpoints (register, login, password reset)  → 5 / min
// Medium: write actions (mining/claim, daily/*, pet/*, convert) → 30 / min
// Loose: read endpoints (status, leaderboard, profile)      → 200 / min
export const authLimit   = rateLimit({ windowMs: 60_000,  max:   5, key: "auth"   });
export const writeLimit  = rateLimit({ windowMs: 60_000,  max:  30, key: "write"  });
export const readLimit   = rateLimit({ windowMs: 60_000,  max: 200, key: "read"   });
