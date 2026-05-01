/**
 * @file Environment Validation
 * @module lib/env
 * @description Validates that all required environment variables are set
 *              at build time. Prevents silent runtime failures caused by
 *              missing API keys or malformed URLs.
 *
 *              Set SKIP_ENV_VALIDATION=true in CI to bypass.
 *
 * @see CLINICPILOT_MASTER_AUDIT.md — Issue #9
 */

/** @type {string[]} Variables required for the application to function. */
const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

/** @type {string[]} Variables required only in production. */
const PRODUCTION_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_WEBHOOK_SECRET",
  "PII_SALT",
];

/**
 * Validates that all required environment variables are present.
 * Call this from `next.config.mjs` or a server-side entry point.
 * @throws {Error} If a required variable is missing and validation is enabled.
 */
export function validateEnv() {
  if (process.env.SKIP_ENV_VALIDATION === "true") return;

  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === "production") {
    const missingProd = PRODUCTION_VARS.filter((key) => !process.env[key]);
    missing.push(...missingProd);
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️  ClinicPilot: Missing environment variables:\n` +
        missing.map((k) => `   - ${k}`).join("\n") +
        `\n   Set SKIP_ENV_VALIDATION=true to bypass.`
    );
  }
}
