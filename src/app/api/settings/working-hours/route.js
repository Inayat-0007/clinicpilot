/**
 * @file Working Hours Update Route
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const HourSchema = z.object({
  id: z.string().uuid().optional(),
  doctor_id: z.string().uuid(),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  is_available: z.boolean()
});

const WorkingHoursBatchSchema = z.array(HourSchema);

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = WorkingHoursBatchSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    const { data: staff } = await supabase
      .from('staff')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .single();

    if (!staff || !['owner', 'receptionist'].includes(staff.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify all doctors belong to this clinic
    const doctorIds = [...new Set(validation.data.map(h => h.doctor_id))];
    const { data: doctors } = await supabase
      .from('doctors')
      .select('id')
      .in('id', doctorIds)
      .eq('clinic_id', staff.clinic_id);

    if (!doctors || doctors.length !== doctorIds.length) {
      return NextResponse.json({ error: 'One or more doctors not found in your clinic' }, { status: 403 });
    }

    const { error: upsertError } = await supabase
      .from('working_hours')
      .upsert(validation.data, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('settings.hours_update.exception', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
