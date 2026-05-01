/**
 * @file Twilio Webhook Route
 * @description Handles SMS delivery status callbacks from Twilio.
 *
 * SECURITY FIXES APPLIED:
 * - Added proper Twilio signature validation using HMAC (was: header presence only)
 * - Added URL construction for signature validation
 * - Added status whitelist to prevent arbitrary data injection
 */

import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

/**
 * Validates Twilio webhook signature.
 * @see https://www.twilio.com/docs/usage/security#validating-requests
 */
function validateTwilioSignature(url, params, signature, authToken) {
  if (!authToken || !signature) return false;

  // Build the string: URL + sorted params concatenated
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(data)
    .digest('base64');

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Whitelist of valid Twilio status values to prevent injection
const VALID_STATUSES = new Set([
  'queued', 'sent', 'delivered', 'undelivered', 'failed', 'read'
]);

export async function POST(req) {
  // Twilio sends form-encoded data
  const formData = await req.formData()
  const params = Object.fromEntries(formData.entries())

  const twilioSignature = req.headers.get('x-twilio-signature')
  const authToken = process.env.TWILIO_AUTH_TOKEN

  // FIX: Proper signature validation (was: only checking header existence)
  if (!authToken) {
    logger.warn('webhook.twilio.no_auth_token_configured')
    // In production, reject. In dev, allow for testing.
    if (process.env.NODE_ENV === 'production') {
      return new Response('Server configuration error', { status: 500 })
    }
  } else {
    // Build the full webhook URL for validation
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/twilio`;
    const isValid = validateTwilioSignature(webhookUrl, params, twilioSignature, authToken);

    if (!isValid) {
      logger.warn('webhook.twilio.signature_mismatch')
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const messageSid = params.MessageSid
  const messageStatus = params.MessageStatus

  // FIX: Validate status against whitelist (prevents arbitrary data injection)
  if (messageSid && messageStatus && VALID_STATUSES.has(messageStatus)) {
    const supabase = createAdminClient()
    await supabase
      .from('reminders')
      .update({ status: messageStatus === 'delivered' ? 'delivered' : messageStatus })
      .eq('meta_message_id', messageSid)
    logger.info('webhook.twilio.status_update', { sid: messageSid, status: messageStatus })
  }

  return new Response('', { status: 200 })
}
