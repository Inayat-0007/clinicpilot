/**
 * @file Appointment Status Update Route
 * @description Server-side appointment status mutation endpoint.
 *
 * SECURITY FIX (CRITICAL-3): AppointmentActions.jsx previously mutated
 * appointments directly from the browser using the Supabase client SDK.
 * This bypassed all server-side authorization — only Supabase RLS stood
 * between a malicious user and arbitrary appointment status changes (IDOR).
 *
 * This route enforces three explicit server-side checks before any mutation:
 * 1. The caller is an authenticated user.
 * 2. The caller belongs to a clinic (is a staff member).
 * 3. The appointment being updated belongs to THAT clinic.
 *
 * Defense in depth: RLS is still active at the DB layer, but we no longer
 * rely on it as the sole authorization barrier.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const UpdateStatusSchema = z.object({
  status: z.enum(['completed', 'no_show', 'cancelled'])
}).strict();

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    // Step 1: Verify the caller is authenticated.
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Validate input — reject anything not in our whitelist.
    const body = await request.json();
    const validation = UpdateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid status value', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    const { status } = validation.data;

    // Step 3: Verify the caller is a staff member and belongs to a clinic.
    const { data: staff } = await supabase
      .from('staff')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!staff) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Step 4: THE IDOR FIX — update the appointment, but ONLY if it belongs
    // to the caller's clinic. The extra .eq('clinic_id', staff.clinic_id)
    // ensures a staff member of Clinic A cannot update Clinic B's appointments
    // even if they know the appointment UUID.
    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .eq('clinic_id', staff.clinic_id)
      .select('id')
      .single();

    if (updateError || !updated) {
      logger.warn('appointment.status_update.denied_or_failed', {
        id,
        clinicId: staff.clinic_id,
        error: updateError?.message
      });
      return NextResponse.json({ error: 'Appointment not found or access denied' }, { status: 404 });
    }

    logger.info('appointment.status_updated', {
      appointmentId: id,
      clinicId: staff.clinic_id,
      newStatus: status
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('appointment.status_update.exception', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
