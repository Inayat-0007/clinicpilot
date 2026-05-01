/**
 * @file Subscription Plan Enforcement
 * @module lib/plan
 * @description Enforces per-plan limits on WhatsApp messages and SMS
 *              to prevent free-tier abuse and ensure paid customers
 *              get the capacity they've subscribed for.
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
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} clinicId
 * @param {"whatsapp"|"sms"} channel
 * @returns {Promise<boolean>}
 */
export async function canSendMessage(supabase, clinicId, channel) {
  // 1. Get clinic plan
  const { data: clinic } = await supabase
    .from("clinics")
    .select("subscription_plan")
    .eq("id", clinicId)
    .single();

  if (!clinic) return false;

  const limits = getPlanLimits(clinic.subscription_plan);
  const limit = limits[channel];

  // Infinite = always allowed
  if (limit === Infinity) return true;

  // 2. Count this month's sent messages
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("reminders")
    .select("id", { count: "exact", head: true })
    .eq("channel", channel)
    .gte("sent_at", startOfMonth.toISOString())
    .in("status", ["sent", "delivered", "read"]);

  return (count || 0) < limit;
}
