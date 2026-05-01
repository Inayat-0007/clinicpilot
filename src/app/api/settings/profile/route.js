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

const ClinicProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  brand_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
}).strict();

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
      return NextResponse.json({ error: 'Invalid data', details: validation.error.flatten() }, { status: 400 });
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
      .update(validation.data)
      .eq('id', staff.clinic_id);

    if (updateError) throw updateError;

    logger.info('settings.profile_updated', { clinicId: staff.clinic_id });
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('settings.profile_update.exception', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
