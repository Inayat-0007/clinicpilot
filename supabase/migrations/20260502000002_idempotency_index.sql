-- Issue 12: Idempotency index to prevent duplicate reminders
CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_appt_type_nonfailed
ON public.reminders (appointment_id, type)
WHERE status != 'failed';
