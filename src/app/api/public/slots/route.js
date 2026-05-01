import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { format, parse, addMinutes, startOfDay, endOfDay, isBefore, isAfter, getDay } from 'date-fns';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD
    const doctorId = searchParams.get('doctorId');

    if (!slug || !dateStr || !doctorId) {
      return NextResponse.json({ error: 'Missing slug, date, or doctorId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Get Clinic and verify doctor belongs to it
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, doctors(id, name, consultation_duration_min)')
      .eq('slug', slug)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const doctor = clinic.doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found in this clinic' }, { status: 404 });
    }
    // 2. Get working hours for the day of week
    const dayOfWeek = getDay(new Date(dateStr)); // 0 = Sunday, 1 = Monday...
    
    const { data: workingHours, error: whError } = await supabase
      .from('working_hours')
      .select('start_time, end_time')
      .eq('doctor_id', doctor.id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true)
      .single();

    if (whError || !workingHours) {
      return NextResponse.json({ slots: [] });
    }

    // 3. Get existing appointments for that doctor on that date
    const dayStart = startOfDay(new Date(dateStr)).toISOString();
    const dayEnd = endOfDay(new Date(dateStr)).toISOString();

    const { data: existingAppts } = await supabase
      .from('appointments')
      .select('starts_at, ends_at')
      .eq('doctor_id', doctor.id)
      .neq('status', 'cancelled')
      .gte('starts_at', dayStart)
      .lte('starts_at', dayEnd);

    // 4. Generate slots
    const slots = [];
    let current = parse(`${dateStr} ${workingHours.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
    const end = parse(`${dateStr} ${workingHours.end_time}`, 'yyyy-MM-dd HH:mm:ss', new Date());
    const duration = doctor.consultation_duration_min || 15;

    const now = new Date();

    while (isBefore(current, end)) {
      const slotEnd = addMinutes(current, duration);
      
      // Check if slot is in the past
      const isInPast = isBefore(current, now);

      // Check if slot overlaps with existing appointments
      const isBooked = existingAppts?.some(appt => {
        const apptStart = new Date(appt.starts_at);
        const apptEnd = new Date(appt.ends_at);
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        return isBefore(current, apptEnd) && isAfter(slotEnd, apptStart);
      });

      if (!isInPast && !isBooked) {
        slots.push(format(current, 'hh:mm a'));
      }

      current = slotEnd;
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('[Slots API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
