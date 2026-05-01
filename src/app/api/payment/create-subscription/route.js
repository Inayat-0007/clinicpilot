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
    
    // MEDIUM-4 FIX: .env defines NEXT_PUBLIC_RAZORPAY_KEY_ID but code used RAZORPAY_KEY_ID.
    // Check both for backward compatibility.
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: 'Payments not configured yet' }, { status: 503 });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
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

    // Fetch the staff member's clinic_id to link the subscription
    const { data: staff } = await supabase
      .from('staff')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .single();

    if (!staff || staff.role !== 'owner') {
      return NextResponse.json({ error: 'Only clinic owners can manage subscriptions' }, { status: 403 });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
      notes: {
        clinic_id: staff.clinic_id,
        plan_type: planType
      }
    });

    logger.info('payment.subscription_created', { subscriptionId: subscription.id, clinicId: staff.clinic_id });

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
