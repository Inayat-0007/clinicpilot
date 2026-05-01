import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateToken, getTokenExpiry } from '@/lib/tokens';
import { logger } from '@/lib/logger';
import { validateCsrf } from '@/lib/csrf';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || token.length < 20) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    }

    const supabase = createAdminClient();

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('id, starts_at, reschedule_token_expires_at, clinics(name, slug), patients(name, phone)')
      .eq('reschedule_token', token)
      .eq('status', 'confirmed')
      .single();

    // Issue 1: Same error for invalid AND expired — prevents enumeration
    if (error || !appointment) {
      return NextResponse.json({ error: 'This link is invalid or has expired.' }, { status: 404 });
    }

    // Issue 1: Check expiry
    if (appointment.reschedule_token_expires_at && new Date(appointment.reschedule_token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'This link is invalid or has expired.' }, { status: 404 });
    }

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (error) {
    logger.error('reschedule.get.failed', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // FIX #6: CSRF validation
    const csrf = validateCsrf(request);
    if (!csrf.valid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { token, date, newSlot } = await request.json();

    if (!token || !date || !newSlot) {
      return NextResponse.json({ error: 'Missing token, date, or slot' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Re-validate token
    const { data: appointment, error: fetchErr } = await supabase
      .from('appointments')
      .select('id, starts_at, patient_id, clinic_id, doctor_id, reschedule_token_expires_at')
      .eq('reschedule_token', token)
      .eq('status', 'confirmed')
      .single();

    if (fetchErr || !appointment) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    // Issue 1: Check expiry
    if (appointment.reschedule_token_expires_at && new Date(appointment.reschedule_token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    // Issue 1: Invalidate old token (ONE-TIME USE)
    await supabase.from('appointments').update({
      status: 'rescheduled',
      reschedule_token: null,
      reschedule_token_expires_at: null,
    }).eq('id', appointment.id);

    // Use provided date
    const dateStr = date;
    
    // FIX #4: Correct 12-hour to 24-hour conversion
    let [timePart, meridiem] = newSlot.split(' ');
    let [slotHours, slotMinutes] = timePart.split(':').map(Number);
    if (meridiem === 'PM' && slotHours !== 12) slotHours += 12;
    if (meridiem === 'AM' && slotHours === 12) slotHours = 0;
    
    const startsAt = new Date(`${dateStr}T${String(slotHours).padStart(2, '0')}:${String(slotMinutes).padStart(2, '0')}:00`);
    const endsAt = new Date(startsAt.getTime() + 15 * 60000);

    const { data: newApt, error: insertErr } = await supabase
      .from('appointments')
      .insert([{
        clinic_id: appointment.clinic_id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'confirmed',
        reschedule_token: generateToken(),                   // Issue 1: New secure token
        reschedule_token_expires_at: getTokenExpiry(48),     // Issue 1: New expiry
      }])
      .select()
      .single();

    if (insertErr) throw insertErr;

    logger.info('reschedule.completed', { oldId: appointment.id, newId: newApt.id });

    return NextResponse.json({ success: true, appointment: newApt }, { status: 200 });
  } catch (error) {
    logger.error('reschedule.failed', error);
    return NextResponse.json({ error: 'Rescheduling failed. Please try again.' }, { status: 500 });
  }
}
