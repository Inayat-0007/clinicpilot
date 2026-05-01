import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function POST(req) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  if (!signature) {
    logger.warn('webhook.razorpay.missing_signature')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    logger.error('webhook.razorpay.no_secret', new Error('RAZORPAY_WEBHOOK_SECRET not configured'))
    return Response.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
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
    logger.warn('webhook.razorpay.signature_mismatch')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const supabase = createAdminClient()

  try {
    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = event.payload.subscription.entity
        const clinicId = sub.notes?.clinic_id
        const planType = sub.notes?.plan_type

        // FIX #3: On first activation, razorpay_subscription_id isn't in DB yet.
        // Use clinic_id from notes for initial activation, fall back to sub ID for subsequent charges.
        
        const updatePayload = {
          subscription_status: 'active',
          razorpay_subscription_id: sub.id,
        }
        if (planType) {
          updatePayload.subscription_plan = planType
        }

        if (clinicId) {
          await supabase
            .from('clinics')
            .update(updatePayload)
            .eq('id', clinicId)
        } else {
          await supabase
            .from('clinics')
            .update(updatePayload)
            .eq('razorpay_subscription_id', sub.id)
        }
        logger.info('webhook.razorpay.subscription_activated', { subId: sub.id, clinicId })
        break
      }
      case 'subscription.cancelled':
      case 'subscription.halted':
      case 'subscription.completed': {
        const sub = event.payload.subscription.entity
        await supabase
          .from('clinics')
          .update({ subscription_status: 'inactive' })
          .eq('razorpay_subscription_id', sub.id)
        logger.info('webhook.razorpay.subscription_deactivated', { subId: sub.id })
        break
      }
      default:
        logger.info('webhook.razorpay.unhandled', { event: event.event })
    }

    return Response.json({ received: true })
  } catch (err) {
    logger.error('webhook.razorpay.handler_error', err)
    return Response.json({ received: true })
  }
}
