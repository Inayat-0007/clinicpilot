/**
 * @file Zod Validation Schemas
 * @module lib/validation
 * @description Centralized input validation schemas using Zod. All
 *              user-facing API routes must validate payloads against
 *              these schemas before processing.
 *
 * @usage
 *   import { PublicBookingSchema } from "@/lib/validation";
 *   const result = PublicBookingSchema.safeParse(body);
 *   if (!result.success) return Response.json(result.error, { status: 400 });
 *
 * @see CLINICPILOT_MASTER_AUDIT.md — Issue #6
 */

import { z } from "zod";

// ── Phone number pattern (Indian mobile) ────────────────────────
const indianPhone = z
  .string()
  .regex(/^\+91\d{10}$/, "Phone must be in +91XXXXXXXXXX format");

// ── Public Booking Schema ───────────────────────────────────────
export const PublicBookingSchema = z.object({
  slug: z.string().min(1).max(100),
  name: z.string().min(2).max(100),
  phone: indianPhone,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  slot: z.string().regex(/^\d{1,2}:\d{2}\s(AM|PM)$/, "Slot must be in 'HH:MM AM/PM' format"),
  doctorId: z.string().uuid("Invalid doctor ID")
}).strict();

// ── Admin Appointment Create Schema ─────────────────────────────
export const AdminAppointmentSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  doctorId: z.string().uuid("Invalid doctor ID").optional(),
  startsAt: z.string().datetime("Invalid ISO datetime"),
  endsAt: z.string().datetime("Invalid ISO datetime"),
  notes: z.string().max(500).optional()
}).strict();

// ── Appointment Update Schema ───────────────────────────────────
export const AppointmentUpdateSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed", "no_show", "rescheduled"]),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
}).strict();

// ── Patient Schema ──────────────────────────────────────────────
export const PatientSchema = z.object({
  name: z.string().min(2).max(100),
  phone: indianPhone,
  email: z.string().email().optional(),
  preferredLanguage: z.enum(["en", "hi", "mr", "ta", "te"]).default("en"),
  hasWhatsapp: z.boolean().default(true),
}).strict();

// ── WhatsApp Send Schema ────────────────────────────────────────
export const WhatsAppSendSchema = z.object({
  to: indianPhone,
  templateName: z.string().min(1).max(100),
  parameters: z.array(z.string().max(1024)).optional()
}).strict();
