/**
 * @file CSRF Protection
 * @module lib/csrf
 * @description Validates that state-changing requests (POST, PUT, DELETE)
 *              originate from the same application domain by checking the
 *              Origin and Referer headers.
 *
 *              This prevents cross-site request forgery attacks where a
 *              malicious website could trigger actions on behalf of a
 *              logged-in doctor.
 *
 * @see CLINICPILOT_MASTER_AUDIT.md — Issue #13
 */

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

/**
 * Validates that a request originates from an allowed origin.
 * @param {Request} request - The incoming HTTP request.
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCsrf(request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin || referer;

  if (!source) {
    return { valid: false, error: "Missing origin header" };
  }

  const isAllowed = ALLOWED_ORIGINS.some((allowed) =>
    source.startsWith(allowed)
  );

  if (!isAllowed) {
    return { valid: false, error: `Blocked origin: ${source}` };
  }

  return { valid: true };
}
