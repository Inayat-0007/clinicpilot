import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PublicBookingSchema } from '@/lib/validation';
import { generateToken, getTokenExpiry } from '@/lib/tokens';
import { logger } from '@/lib/logger';
import { validateCsrf } from '@/lib/csrf';
import { hashPhone } from '@/lib/pii';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request) {
  try {
    // FIX #6: CSRF validation — reject cross-origin state-changing requests
    const csrf = validateCsrf(request);
    if (!csrf.valid) {
      logger.warn('booking.csrf_rejected', { reason: csrf.error });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const validation = PublicBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.flatten() }, { status: 400 });
    }

    const { slug, name, phone, date, slot, doctorId } = validation.data;
    // FIX #9: Hash PII before any log output — DPDP Act 2023 compliance
    const phoneHash = hashPhone(phone);

    const supabase = createAdminClient();

    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name, doctors(id)')
      .eq('slug', slug)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const doctor = clinic.doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found at this clinic' }, { status: 400 });
    }

    const actualDoctorId = doctor.id;

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
          consent_given_at: new Date().toISOString(),
          consent_source: 'booking_form',
        }])
        .select()
        .single();
        
      if (patientError) throw patientError;
      patientId = newPatient.id;
    }

    const dateStr = date;

    // MEDIUM-3 FIX: Validate slot format to prevent NaN timestamps
    const slotMatch = slot.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
    if (!slotMatch) {
      return NextResponse.json({ error: 'Invalid slot format. Expected "HH:MM AM/PM"' }, { status: 400 });
    }
    
    let hours = parseInt(slotMatch[1], 10);
    const minutes = slotMatch[2];
    const modifier = slotMatch[3];
    
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const startsAt = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${minutes}:00`);
    const endsAt = new Date(startsAt.getTime() + 15 * 60000);

    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .insert([{
        clinic_id: clinic.id,
        doctor_id: actualDoctorId,
        patient_id: patientId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'confirmed',
        reschedule_token: generateToken(),
        reschedule_token_expires_at: getTokenExpiry(48),
      }])
      .select()
      .single();

    if (aptError) throw aptError;

    logger.info('booking.created', { clinicId: clinic.id, appointmentId: appointment.id, phoneHash });

    // HIGH-1 FIX: Use NEXT_PUBLIC_APP_URL — no hardcoded production fallback.
    // A missing URL logs an error instead of silently routing to wrong domain.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      logger.error('booking.missing_app_url', {
        hint: 'Set NEXT_PUBLIC_APP_URL in your environment variables'
      });
    }
    const rescheduleLink = appUrl
      ? `${appUrl}/reschedule/${appointment.reschedule_token}`
      : null;
    const timeString = startsAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    
    // We don't await this so it doesn't block the response
    sendWhatsAppMessage(
      phone, 
      'booking_confirmation', 
      [name, timeString, clinic.name, rescheduleLink],
      appointment.id,
      clinic.id
    ).catch(err => logger.error('whatsapp.confirmation.failed_async', err));

    return NextResponse.json({ success: true, appointment }, { status: 200 });
  } catch (error) {
    logger.error('booking.failed', { error: error.message });
    return NextResponse.json({ error: 'Booking failed. Please try again.' }, { status: 500 });
  }
}
