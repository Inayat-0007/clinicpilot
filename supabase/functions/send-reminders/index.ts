import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? ""
const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? ""
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? ""
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? ""
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER") ?? ""

// Issue 19: Sanitize template variables
function sanitizeTemplateVar(value: string): string {
  return value
    .replace(/\{\{/g, '(')
    .replace(/\}\}/g, ')')
    .replace(/\n/g, ' ')
    .slice(0, 60)
    .trim()
}

async function sendWhatsAppTemplate(to: string, templateName: string, parameters: string[]) {
  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components: [{
        type: 'body',
        parameters: parameters.map(param => ({ type: 'text', text: sanitizeTemplateVar(param) }))
      }]
    }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return await res.json()
}

async function sendSMSFallback(to: string, message: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
  const data = new URLSearchParams()
  data.append('To', to)
  data.append('From', TWILIO_PHONE_NUMBER)
  data.append('Body', message)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data
  })
  return await res.json()
}

interface ReminderResult {
  appointmentId: string
  status: 'sent' | 'failed'
  channel: string
  error?: string
}

// Issue 8: Use Deno.serve instead of deprecated serve()
Deno.serve(async (req) => {
  try {
    // Auth: Accept service_role key OR verify caller has service_role JWT claim
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response("Unauthorized: Missing Authorization header", { status: 401 })
    }
    
    // FIX #10: Accept ONLY the actual service role key as Bearer token.
    // The previous code decoded the JWT payload without verifying the signature,
    // allowing anyone to forge a token with { "role": "service_role" } and bypass auth.
    const token = authHeader.replace('Bearer ', '')
    const isServiceRole = token === SUPABASE_SERVICE_ROLE_KEY;
    
    if (!isServiceRole) {
      return new Response("Unauthorized: Requires service_role", { status: 401 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, starts_at, reschedule_token, clinics(name), patients(name, phone)')
      .eq('status', 'confirmed')
      .gte('starts_at', in24h.toISOString())
      .lte('starts_at', in25h.toISOString())

    if (fetchError) {
      console.error('[SendReminders] Fetch error:', fetchError)
      return new Response(JSON.stringify({ error: 'DB fetch failed' }), { status: 500 })
    }

    if (!appointments || appointments.length === 0) {
      return new Response(JSON.stringify({ sent: 0, failed: 0, message: 'No reminders due' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`[SendReminders] Processing ${appointments.length} appointments`)

    // Issue 8: Promise.allSettled — one failure does NOT kill all reminders
    const results = await Promise.allSettled(
      appointments.map(apt => processReminder(apt, supabase))
    )

    const succeeded: ReminderResult[] = []
    const failed: ReminderResult[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        succeeded.push(result.value)
      } else {
        failed.push({
          appointmentId: appointments[index].id,
          status: 'failed',
          channel: 'whatsapp',
          error: result.reason?.message ?? 'Unknown error'
        })
        console.error(`[SendReminders] Failed for ${appointments[index].id}:`, result.reason)
      }
    })

    console.log(`[SendReminders] Done: ${succeeded.length} sent, ${failed.length} failed`)

    return new Response(JSON.stringify({
      sent: succeeded.length,
      failed: failed.length,
      failedIds: failed.map(f => f.appointmentId)
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('[SendReminders] Fatal error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 })
  }
})

async function processReminder(apt: any, supabase: any): Promise<ReminderResult> {
  // Issue 12: Idempotency — skip if already sent
  const { data: existing } = await supabase
    .from('reminders')
    .select('id')
    .eq('appointment_id', apt.id)
    .eq('type', '24h_before')
    .not('status', 'eq', 'failed')
    .maybeSingle()

  if (existing) {
    return { appointmentId: apt.id, status: 'sent', channel: 'whatsapp' }
  }

  const rescheduleLink = `https://clinicpilot.com/reschedule/${apt.reschedule_token}`
  const timeString = new Date(apt.starts_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const phoneWithCode = apt.patients.phone.startsWith('+') ? apt.patients.phone : `+91${apt.patients.phone}`
  const waPhone = phoneWithCode.replace('+', '')

  try {
    let waResponse = await sendWhatsAppTemplate(waPhone, 'reminder_24h', [
      apt.patients.name, timeString, apt.clinics.name, rescheduleLink
    ])

    let channelUsed = 'whatsapp'
    let status: 'sent' | 'failed' = 'sent'
    let externalId = waResponse.messages?.[0]?.id || null
    let errorMsg = waResponse.error?.message || null

    // Fallback to SMS if WhatsApp fails
    if (waResponse.error) {
      const smsText = `Hi ${sanitizeTemplateVar(apt.patients.name)}, reminder for your appointment tomorrow at ${timeString} at ${sanitizeTemplateVar(apt.clinics.name)}. Reschedule: ${rescheduleLink}`
      const smsResponse = await sendSMSFallback(phoneWithCode, smsText)
      channelUsed = 'sms'
      if (smsResponse.error_message) {
        status = 'failed'
        errorMsg = smsResponse.error_message
      } else {
        status = 'sent'
        externalId = smsResponse.sid
        errorMsg = null
      }
    }

    // Issue 12: Use upsert with idempotency
    await supabase.from('reminders').upsert({
      appointment_id: apt.id,
      channel: channelUsed,
      type: '24h_before',
      status,
      meta_message_id: externalId,
      error_message: errorMsg?.slice(0, 500),
      sent_at: new Date().toISOString()
    }, {
      onConflict: 'appointment_id,type',
      ignoreDuplicates: true
    })

    return { appointmentId: apt.id, status, channel: channelUsed }

  } catch (err: any) {
    await supabase.from('reminders').insert({
      appointment_id: apt.id,
      channel: 'whatsapp',
      type: '24h_before',
      status: 'failed',
      error_message: err.message?.slice(0, 500),
    })
    throw err
  }
}
