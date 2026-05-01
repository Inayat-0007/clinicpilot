/**
 * @file Utility Functions
 * @module lib/utils
 * @description Shared utility functions used across the application.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (dedup).
 *
 * @param {...(string|undefined|null|boolean|Record<string,boolean>)} inputs
 * @returns {string} Merged class string.
 *
 * @example
 *   cn("px-4 py-2", isActive && "bg-blue-600", "px-8")
 *   // → "py-2 px-8 bg-blue-600" (px-8 overrides px-4)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
