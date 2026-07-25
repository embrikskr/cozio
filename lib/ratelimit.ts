// Rate limiter. Uses Upstash Redis when configured — counts are then shared
// across Vercel's serverless instances (the only way limiting actually works in
// production). Without Upstash it falls back to a per-instance in-memory limiter
// (fine for local dev / a single instance, but not distributed).
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = URL && TOKEN ? new Redis({ url: URL, token: TOKEN }) : null;

// Cache one Ratelimit instance per (limit, window) config.
const limiters = new Map<string, Ratelimit>();
function upstashLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let rl = limiters.get(cacheKey);
  if (!rl) {
    rl = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: "rl",
      analytics: false,
    });
    limiters.set(cacheKey, rl);
  }
  return rl;
}

/** True when distributed (Upstash) limiting is active. */
export function rateLimitReady(): boolean {
  return !!redis;
}

// How much to tighten the in-memory fallback. Each serverless instance keeps its
// own counter, so with N warm instances the effective ceiling is N * limit — the
// configured number is close to meaningless under real traffic. Dividing keeps
// the exposure bounded while the app still works. This is damage control, not a
// substitute for Upstash: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
const FALLBACK_DIVISOR = 4;

function fallbackLimit(limit: number): number {
  return Math.max(1, Math.ceil(limit / FALLBACK_DIVISOR));
}

let warned = false;
function warnOnce(): void {
  if (warned) return;
  warned = true;
  console.warn(
    "[ratelimit] Upstash is not configured — falling back to a per-instance " +
      "in-memory limiter. On serverless this does NOT bound request rates across " +
      "instances. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
  );
}

/**
 * Returns true if the request is allowed. Identify callers by a stable key
 * (e.g. `concierge:<ip>`). `limit` requests per `windowMs`.
 *
 * With Upstash configured this is a real distributed limit. Without it, the
 * request still goes through a local check, but at a tightened threshold — see
 * FALLBACK_DIVISOR.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (redis) {
    try {
      const { success } = await upstashLimiter(limit, windowMs).limit(key);
      return success;
    } catch {
      // Redis hiccup → fall back to a local check rather than blocking traffic,
      // at the tightened threshold since we no longer have a shared count.
      return memoryLimit(key, fallbackLimit(limit), windowMs);
    }
  }
  warnOnce();
  return memoryLimit(key, fallbackLimit(limit), windowMs);
}

// --- in-memory fallback ---------------------------------------------------
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
function memoryLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

/** Best-effort client IP from common proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Opportunistic cleanup so the in-memory map can't grow unbounded.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }, 60_000).unref?.();
}
