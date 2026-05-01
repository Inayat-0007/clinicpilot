import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      logger.warn('payment.webhook.missing_config');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // HMAC-SHA256 verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    // Issue 2: Timing-safe comparison
    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      logger.warn('payment.webhook.signature_mismatch');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const supabase = createAdminClient();

    if (payload.event === 'subscription.charged' || payload.event === 'subscription.activated') {
      const sub = payload.payload.subscription.entity;
      const clinicId = sub.notes?.clinic_id;

      if (clinicId) {
        await supabase
          .from('clinics')
          .update({ 
            subscription_status: 'active',
            razorpay_subscription_id: sub.id,
          })
          .eq('id', clinicId);
        logger.info('payment.webhook.activated', { clinicId, subId: sub.id });
      }
    }

    if (payload.event === 'subscription.cancelled' || payload.event === 'subscription.halted') {
      const sub = payload.payload.subscription.entity;
      await supabase
        .from('clinics')
        .update({ subscription_status: 'inactive' })
        .eq('razorpay_subscription_id', sub.id);
      logger.info('payment.webhook.deactivated', { subId: sub.id });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    logger.error('payment.webhook.error', error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
