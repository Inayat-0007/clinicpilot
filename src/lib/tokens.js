/**
 * @file Secure Token Generation
 * @module lib/tokens
 * @description Generates cryptographically secure, URL-safe tokens for
 *              1-click reschedule links. Tokens are 256-bit entropy,
 *              base64url-encoded, and expire after a configurable duration.
 *
 * @usage
 *   import { generateToken, getTokenExpiry } from "@/lib/tokens";
 *   const token = generateToken();     // → "xK9m2..."
 *   const expiry = getTokenExpiry(48); // → ISO timestamp 48h from now
 *
 * @see CLINICPILOT_MASTER_AUDIT.md — Issue #1
 */

import crypto from "crypto";

/**
 * Generates a 256-bit, URL-safe random token.
 * @returns {string} 43-character base64url string.
 */
export function generateToken() {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Returns an ISO timestamp N hours from now.
 * @param {number} [hours=48] - Hours until token expiry.
 * @returns {string} ISO 8601 timestamp.
 */
export function getTokenExpiry(hours = 48) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
