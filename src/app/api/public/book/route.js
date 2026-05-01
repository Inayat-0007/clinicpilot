import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PublicBookingSchema } from '@/lib/validation';
import { generateToken, getTokenExpiry } from '@/lib/tokens';
import { logger } from '@/lib/logger';

export async function POST(request) {
  try {
    const body = await request.json();

    // Issue 6: Input validation FIRST with Deny by Default strict schema
    const validation = PublicBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.flatten() }, { status: 400 });
    }

    const { slug, name, phone, slot } = validation.data;

    // Issue 10: Use admin client (bypasses RLS for public booking)
    const supabase = createAdminClient();

    // 1. Get Clinic ID
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('slug', slug)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // 2. Upsert Patient (Match by phone and clinic)
    let patientId;
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', clinic.id)
      .eq('phone', phone)
      .single();

    if (existingPatient) {
      patientId = existingPatient.id;
    } else {
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert([{
          clinic_id: clinic.id,
          name,
          phone,
          consent_given_at: new Date().toISOString(),  // Issue 14: DPDP consent
          consent_source: 'booking_form',
        }])
        .select()
        .single();
        
      if (patientError) throw patientError;
      patientId = newPatient.id;
    }

    // 3. Create Appointment
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const isPM = slot.includes('PM') && !slot.includes('12:00 PM');
    let [hours, minutes] = slot.split(' ')[0].split(':');
    if (isPM) hours = String(parseInt(hours) + 12);
    if (hours === '12' && slot.includes('AM')) hours = '00';
    
    const startsAt = new Date(`${dateStr}T${hours}:${minutes}:00`);
    const endsAt = new Date(startsAt.getTime() + 15 * 60000);

    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .insert([{
        clinic_id: clinic.id,
        patient_id: patientId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'confirmed',
        reschedule_token: generateToken(),                       // Issue 1: 256-bit token
        reschedule_token_expires_at: getTokenExpiry(48),         // Issue 1: 48h expiry
      }])
      .select()
      .single();

    if (aptError) throw aptError;

    logger.info('booking.created', { clinicId: clinic.id, appointmentId: appointment.id });

    return NextResponse.json({ success: true, appointment }, { status: 200 });
  } catch (error) {
    logger.error('booking.failed', error);
    return NextResponse.json({ error: 'Booking failed. Please try again.' }, { status: 500 });
  }
}
