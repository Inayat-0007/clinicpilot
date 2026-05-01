/**
 * @file Retry with Exponential Backoff
 * @module lib/retry
 * @description Wraps async functions with automatic retry logic using
 *              exponential backoff. Used for unreliable external API calls
 *              (WhatsApp, Twilio, Razorpay) to handle transient failures.
 *
 * @usage
 *   import { withRetry } from "@/lib/retry";
 *   const result = await withRetry(() => sendWhatsApp(payload), 3);
 *
 * @see CLINICPILOT_MASTER_AUDIT.md — Issue #21
 */

/**
 * Executes an async function with exponential backoff retry.
 *
 * @template T
 * @param {() => Promise<T>} fn - The async function to execute.
 * @param {number} [maxRetries=3] - Maximum number of retry attempts.
 * @param {number} [baseDelay=1000] - Base delay in milliseconds (doubles each retry).
 * @returns {Promise<T>}
 * @throws {Error} The last error if all retries are exhausted.
 */
export async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
