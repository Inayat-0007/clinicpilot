/**
 * @file Structured Logger
 * @module lib/logger
 * @description Provides a structured JSON logger designed for Vercel's
 *              log stream. All log entries include a timestamp, event
 *              name, and optional data payload.
 *
 *              In production, Vercel parses JSON stdout automatically,
 *              enabling filtering and alerting in the dashboard.
 *
 * @usage
 *   import { logger } from "@/lib/logger";
 *   logger.info("booking.created", { clinicId, patientId });
 *   logger.error("booking.failed", error);
 *
 * @see CLINICPILOT_MASTER_AUDIT.md — Issue #17
 */

export const logger = {
  /** @param {string} event  @param {object} [data] */
  info(event, data = {}) {
    console.log(JSON.stringify({ level: "info", event, ...data, ts: new Date().toISOString() }));
  },

  /** @param {string} event  @param {object} [data] */
  warn(event, data = {}) {
    console.warn(JSON.stringify({ level: "warn", event, ...data, ts: new Date().toISOString() }));
  },

  /** @param {string} event  @param {Error|object} [err] */
  error(event, err = {}) {
    const payload = err instanceof Error
      ? { message: err.message, stack: err.stack }
      : err;
    console.error(JSON.stringify({ level: "error", event, ...payload, ts: new Date().toISOString() }));
  },
};
