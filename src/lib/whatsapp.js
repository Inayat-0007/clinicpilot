/**
 * @file WhatsApp Message Sender
 * @module lib/whatsapp
 * @description Sends WhatsApp template messages via the Meta Cloud API
 *              and records delivery status in the reminders table.
 *
 * HIGH-3 FIX: Previously created a new @supabase/supabase-js client on
 * every invocation, wasting connection pool resources. Now uses the
 * centralized createAdminClient() singleton from lib/supabase/admin.
 */

import { logger } from '@/lib/logger';
import { withRetry } from '@/lib/retry';
import { createAdminClient } from '@/lib/supabase/admin';

export async function sendWhatsAppMessage(to, templateName, parameters, appointmentId, clinicId, language = 'en') {
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
    logger.warn('whatsapp.not_configured', { clinicId });
    return { success: false, error: 'WhatsApp not configured' };
  }

  const sanitizedPhone = to.replace(/[^\d+]/g, '');

  const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: sanitizedPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: language
      },
      components: [
        {
          type: 'body',
          parameters: (parameters || []).map(param => ({
            type: 'text',
            text: String(param).substring(0, 1024)
          }))
        }
      ]
    }
  };

  try {
    const response = await withRetry(() => fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }), 3);

    const data = await response.json();

    // HIGH-3 FIX: Reuse the centralized admin client singleton
    // instead of instantiating a new client on every call.
    const supabase = createAdminClient();

    if (!response.ok) {
      logger.error('whatsapp.api.error', { status: response.status, upstream: data.error?.message });
      
      if (appointmentId) {
        await supabase.from('reminders').insert({
          appointment_id: appointmentId,
          channel: 'whatsapp',
          type: templateName === 'booking_confirmation' ? 'confirmation' : 'other',
          status: 'failed',
          error_message: data.error?.message?.slice(0, 500)
        });
      }

      return { success: false, error: data.error?.message };
    }

    if (appointmentId) {
      await supabase.from('reminders').insert({
        appointment_id: appointmentId,
        channel: 'whatsapp',
        type: templateName === 'booking_confirmation' ? 'confirmation' : 'other',
        status: 'sent',
        meta_message_id: data.messages?.[0]?.id,
        sent_at: new Date().toISOString()
      });
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    logger.error('whatsapp.send.exception', error);
    return { success: false, error: error.message };
  }
}
