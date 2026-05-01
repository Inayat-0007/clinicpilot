/**
 * @file WhatsApp Send Route
 * @description Sends WhatsApp template messages via Meta Cloud API.
 *
 * SECURITY FIXES APPLIED:
 * - Added server-side auth check (was: NO AUTH — anyone could call this!)
 * - Replaced console.error with structured logger
 * - No longer leaks upstream WhatsApp API error details to client
 * - Added input sanitization for phone numbers
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { WhatsAppSendSchema } from '@/lib/validation';

export async function POST(request) {
  try {
    // FIX: Auth check — this route sends messages on behalf of a clinic (OWASP A01)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate env
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
      return NextResponse.json({ error: 'WhatsApp integration not configured' }, { status: 503 });
    }

    const body = await request.json();
    const validation = WhatsAppSendSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.flatten() }, { status: 400 });
    }

    const { to, templateName, parameters } = validation.data;
    const sanitizedPhone = to.replace(/[^\d+]/g, '');

    const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: sanitizedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en'
        },
        components: [
          {
            type: 'body',
            parameters: (parameters || []).map(param => ({
              type: 'text',
              text: String(param).substring(0, 1024)  // Limit parameter length
            }))
          }
        ]
      }
    };

    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      // FIX: Log upstream error server-side, return generic message to client
      logger.error('whatsapp.api.error', { status: response.status, upstream: data.error?.message });
      return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 502 });
    }

    logger.info('whatsapp.sent', { messageId: data.messages?.[0]?.id });

    return NextResponse.json({ success: true, messageId: data.messages[0].id }, { status: 200 });

  } catch (error) {
    logger.error('whatsapp.send.failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
