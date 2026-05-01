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

const SALT = process.env.PII_SALT || "clinicpilot-default-salt";

/**
 * Hashes a phone number using SHA-256 with a project-specific salt.
 * @param {string} phone - Raw phone number.
 * @returns {string} 64-character hex hash.
 */
export function hashPhone(phone) {
  return crypto
    .createHash("sha256")
    .update(SALT + phone)
    .digest("hex");
}
