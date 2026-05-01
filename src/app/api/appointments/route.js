/**
 * @file Admin Booking Route
 * @description Server-side appointment creation for authenticated staff.
 *
 * SECURITY FIXES APPLIED:
 * - Replaced Math.random() token with crypto.randomBytes (OWASP A02)
 * - Added token expiry (48 hours)
 * - Replaced error.message leak with generic response (OWASP A09)
 * - Replaced console.error with structured logger
 * - Added input length validation
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateToken, getTokenExpiry } from '@/lib/tokens';
import { logger } from '@/lib/logger';
import { AdminAppointmentSchema } from '@/lib/validation';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Auth check (server-side — OWASP A01: Broken Access Control)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Input validation with strict Zod schema (Deny by Default)
    const validation = AdminAppointmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.flatten() }, { status: 400 });
    }
    const { patientId, startsAt, endsAt, notes } = validation.data;

    // Get clinic via staff record (enforced via RLS)
    const { data: staff } = await supabase
      .from('staff')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!staff) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // IDOR Check: Ensure the patient belongs to the staff's clinic
    const { data: patientCheck } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('clinic_id', staff.clinic_id)
      .single();

    if (!patientCheck) {
      return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 403 });
    }

    // FIX: Cryptographically secure token (was: Math.random() — predictable!)
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .insert([{
        clinic_id: staff.clinic_id,
        patient_id: patientId,
        starts_at: startsAt,
        ends_at: endsAt,
        status: 'confirmed',
        reschedule_token: generateToken(),
        reschedule_token_expires_at: getTokenExpiry(48),
        notes: notes || ''
      }])
      .select()
      .single();

    if (aptError) throw aptError;

    logger.info('admin.booking.created', { clinicId: staff.clinic_id, appointmentId: appointment.id });

    return NextResponse.json({ success: true, appointment }, { status: 200 });
  } catch (error) {
    // FIX: Structured logging — never leak raw error.message to client (OWASP A09)
    logger.error('admin.booking.failed', error);
    return NextResponse.json({ error: 'Booking failed. Please try again.' }, { status: 500 });
  }
}
