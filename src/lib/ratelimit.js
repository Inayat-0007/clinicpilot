/**
 * @file Rate Limiting
 * @module lib/ratelimit
 * @description Configures Upstash Redis-backed rate limiters for
 *              different route categories. Rate limiting prevents
 *              brute-force attacks, DDoS, and API abuse.
 *
 * @usage
 *   import { bookingLimiter } from "@/lib/ratelimit";
 *   const { success } = await bookingLimiter.limit(ip);
 *
 * @see CLINICPILOT_MASTER_AUDIT.md — Issue #4
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Creates a Redis-backed rate limiter. Returns a no-op limiter if
 * Upstash credentials are not configured (allows local dev to work).
 */
function createLimiter(prefix, tokens, window) {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    // No-op limiter for local development
    return { limit: async () => ({ success: true, remaining: 999 }) };
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: `clinicpilot:${prefix}`,
  });
}

/** 5 bookings per IP per 60 seconds. */
export const bookingLimiter = createLimiter("booking", 5, "60 s");

/** 3 reschedule attempts per IP per 60 seconds. */
export const rescheduleLimiter = createLimiter("reschedule", 3, "60 s");

/** 10 auth attempts per IP per 5 minutes. */
export const authLimiter = createLimiter("auth", 10, "5 m");

/** 10 WhatsApp messages per IP per 1 minute (prevent cost exhaustion) */
export const whatsappLimiter = createLimiter("whatsapp", 10, "1 m");

/** 20 admin actions per IP per 1 minute */
export const adminLimiter = createLimiter("admin", 20, "1 m");
