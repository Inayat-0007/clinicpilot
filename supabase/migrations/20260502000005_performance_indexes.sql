-- Issue 20: Performance indexes
CREATE INDEX IF NOT EXISTS idx_appt_reminder_scan
  ON public.appointments (clinic_id, status, starts_at)
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_appt_today
  ON public.appointments (clinic_id, starts_at, status);

CREATE INDEX IF NOT EXISTS idx_appt_reschedule_token
  ON public.appointments (reschedule_token)
  WHERE reschedule_token IS NOT NULL;
