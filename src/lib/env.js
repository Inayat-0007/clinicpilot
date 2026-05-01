/**
 * @file DEPRECATED — re-exports from canonical env validation module.
 * @description FIX #26: There were two env validation files (src/env.js and src/lib/env.js).
 *              The Zod-based src/env.js is canonical and imported by next.config.mjs.
 *              This file now re-exports from there for any code that imported from @/lib/env.
 *
 * @deprecated Import from @/env instead. This file will be removed in a future cleanup.
 */

export { env } from "../env.js";

/**
 * @deprecated validateEnv() is now handled automatically by src/env.js at build time.
 *             This is a no-op kept for backward compatibility.
 */
export function validateEnv() {
  // No-op: validation now happens in src/env.js via Zod at module load time.
  // Kept to prevent import errors in any code that previously called validateEnv().
}
