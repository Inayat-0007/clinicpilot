import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('webhook.whatsapp.verified')
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  return Response.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req) {
  const rawBody = await req.text()
  const signatureHeader = req.headers.get('x-hub-signature-256')
  const signature = signatureHeader?.startsWith('sha256=') ? signatureHeader.slice(7) : null

  if (!signature) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (!appSecret) {
    logger.error('webhook.whatsapp.no_secret', new Error('WHATSAPP_APP_SECRET not configured'))
    return Response.json({ ok: true })
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')

  let isValid = false
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch {
    isValid = false
  }

  if (!isValid) {
    logger.warn('webhook.whatsapp.signature_mismatch')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = JSON.parse(rawBody)
  const changes = body.entry?.[0]?.changes?.[0]?.value ?? {}
  const statuses = changes.statuses ?? []
  const supabase = createAdminClient()

  for (const status of statuses) {
    const reminderStatus = {
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'read',
      'failed': 'failed',
    }[status.status] ?? 'sent'

    await supabase
      .from('reminders')
      .update({
        status: reminderStatus,
        sent_at: status.timestamp
          ? new Date(parseInt(status.timestamp) * 1000).toISOString()
          : null
      })
      .eq('meta_message_id', status.id)
  }

  return Response.json({ ok: true })
}
