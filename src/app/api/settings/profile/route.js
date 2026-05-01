/**
 * @file Clinic Settings Update Route
 * @description Server-side settings mutation endpoint.
 *
 * SECURITY FIX (DEBT-1): settings/page.js previously mutated
 * clinics, working_hours, and message_templates directly from the browser.
 * This bypassed application-layer ownership checks.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Allow partial updates — the frontend sends either a full profile form
// or a single toggle field. All fields are optional.
const ClinicProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal('')),
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  whatsapp_reminders_enabled: z.boolean().optional(),
  sms_reminders_enabled: z.boolean().optional(),
}).strip(); // strip() removes unknown keys silently instead of rejecting

export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = ClinicProfileSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('settings.profile_validation_failed', { errors: validation.error.flatten() });
      return NextResponse.json({ error: 'Invalid data', details: validation.error.flatten() }, { status: 400 });
    }

    // Ensure at least one field is being updated
    const cleanData = validation.data;
    if (Object.keys(cleanData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: staff } = await supabase
      .from('staff')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .single();

    if (!staff || staff.role !== 'owner') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from('clinics')
      .update(cleanData)
      .eq('id', staff.clinic_id);

    if (updateError) throw updateError;

    logger.info('settings.profile_updated', { clinicId: staff.clinic_id, fields: Object.keys(cleanData) });
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('settings.profile_update.exception', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
