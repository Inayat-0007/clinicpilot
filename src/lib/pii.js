/**
 * @file PII Hashing Utility
 * @module lib/pii
 * @description Hashes personally identifiable information (phone numbers)
 *              before writing to audit logs. This is a DPDP Act 2023
 *              compliance requirement — raw phone numbers must never
 *              appear in log files.
 *
 * @usage
 *   import { hashPhone } from "@/lib/pii";
 *   const hashed = hashPhone("+919876543210"); // → "a3f2b1..."
 *
 * @see CLINICPILOT_MASTER_AUDIT.md — Issue #14
 */

import crypto from "crypto";

// FIX #9: Throw hard error in production if PII_SALT is missing.
// Previously: fell back to a hardcoded default — making all hashes predictable and reversible.
if (process.env.NODE_ENV === "production" && !process.env.PII_SALT) {
  throw new Error(
    "FATAL: PII_SALT is not set in production. " +
    "All phone hashes would be predictable. Set PII_SALT in your environment."
  );
}

const SALT = process.env.PII_SALT || "clinicpilot-dev-salt-not-for-production";

/**
 * Hashes a phone number using HMAC-SHA256 with a project-specific salt.
 * HMAC provides better key separation than plain SHA-256(salt + input).
 * @param {string} phone - Raw phone number.
 * @returns {string} 64-character hex hash.
 */
export function hashPhone(phone) {
  return crypto
    .createHmac("sha256", SALT)
    .update(String(phone))
    .digest("hex");
}
