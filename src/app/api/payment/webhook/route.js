/**
 * @file DEPRECATED — This file is intentionally empty.
 * @description The canonical Razorpay webhook handler lives at:
 *              /api/webhooks/razorpay/route.js
 *
 *              This duplicate was deleted to prevent double payment processing.
 *              See Audit Issue #3.
 *
 * If Razorpay is configured to POST to /api/payment/webhook,
 * update the webhook URL in Razorpay Dashboard to:
 *   https://clinicpilot.in/api/webhooks/razorpay
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST() {
  logger.warn('payment.webhook.deprecated_endpoint_hit');
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use /api/webhooks/razorpay instead.' },
    { status: 410 }
  );
}
