/**
 * @file Subscription Plan Enforcement
 * @module lib/plan
 * @description Enforces per-plan limits on WhatsApp messages and SMS
 *              to prevent free-tier abuse and ensure paid customers
 *              get the capacity they've subscribed for.
 *
 * SECURITY FIX (CRITICAL-1): The previous query counted ALL reminders
 * platform-wide without scoping to the calling clinic. This allowed:
 *   - Free-ride attack: Any clinic gets 0-count on day 1 regardless of usage
 *   - Neighbor starvation: A high-volume clinic exhausts the aggregate count
 *     and blocks all other clinics
 *
 * The fix scopes the count to the specific clinic using an inner join
 * through the appointments table (reminders -> appointments -> clinic_id).
 *
 * @usage
 *   import { getPlanLimits, canSendMessage } from "@/lib/plan";
 *   const limits = getPlanLimits("starter");
 *   const allowed = await canSendMessage(supabase, clinicId, "whatsapp");
 *
 * @see CLINICPILOT_MASTER_AUDIT.md — Issue #23
 */

/**
 * Plan limit definitions.
 * @type {Record<string, { whatsapp: number, sms: number }>}
 */
const PLAN_LIMITS = {
  trial:      { whatsapp: 50,       sms: 10 },
  starter:    { whatsapp: 300,      sms: 50 },
  growth:     { whatsapp: Infinity, sms: 200 },
  clinic_pro: { whatsapp: Infinity, sms: 500 },
};

/**
 * Returns the limits for a given subscription plan.
 * @param {string} plan - One of: trial, starter, growth, clinic_pro.
 * @returns {{ whatsapp: number, sms: number }}
 */
export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.trial;
}

/**
 * Checks whether a clinic can send a message on the given channel
 * based on their current plan and this month's usage.
 *
 * SECURITY: Fails closed — if any query errors, we deny the send.
 * This prevents a DB error from being silently treated as "allowed".
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} clinicId
 * @param {"whatsapp"|"sms"} channel
 * @returns {Promise<boolean>}
 */
export async function canSendMessage(supabase, clinicId, channel) {
  // 1. Get clinic plan — fail closed if lookup fails
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("subscription_plan")
    .eq("id", clinicId)
    .single();

  if (clinicError || !clinic) return false;

  const limits = getPlanLimits(clinic.subscription_plan);
  const limit = limits[channel];

  // Infinite = always allowed (Growth/Pro plans)
  if (limit === Infinity) return true;

  // 2. Count THIS CLINIC'S sent messages this calendar month.
  //    CRITICAL FIX: Scope to clinic via inner join through appointments.
  //    Previously counted ALL clinics' reminders — broken billing model.
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from("reminders")
    .select("id, appointments!inner(clinic_id)", { count: "exact", head: true })
    .eq("appointments.clinic_id", clinicId)
    .eq("channel", channel)
    .gte("sent_at", startOfMonth.toISOString())
    .in("status", ["sent", "delivered", "read"]);

  // Fail closed: if the count query fails, deny the send to be safe.
  if (countError) return false;

  return (count || 0) < limit;
}
