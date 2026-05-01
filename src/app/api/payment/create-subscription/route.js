import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// Plan IDs should be created in Razorpay Dashboard
const PLAN_MAPPING = {
  'starter': process.env.RAZORPAY_PLAN_STARTER_ID,
  'growth': process.env.RAZORPAY_PLAN_GROWTH_ID,
  'pro': process.env.RAZORPAY_PLAN_PRO_ID,
};

export async function POST(request) {
  try {
    // Lazy-init Razorpay — avoids crash at build time when key_id is placeholder
    const Razorpay = (await import('razorpay')).default;
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payments not configured yet' }, { status: 503 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const supabase = await createClient();
    
    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType } = await request.json();
    const planId = PLAN_MAPPING[planType];

    if (!planId) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
    });

    logger.info('payment.subscription_created', { subscriptionId: subscription.id });

    return NextResponse.json({ 
      success: true, 
      subscriptionId: subscription.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID 
    }, { status: 200 });

  } catch (error) {
    logger.error('payment.create_failed', error);
    return NextResponse.json({ error: 'Payment processing failed. Please try again.' }, { status: 500 });
  }
}
