-- Issue 15: Soft deletes
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE OR REPLACE VIEW public.active_appointments
  WITH (security_invoker = true)
  AS SELECT * FROM public.appointments WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.active_patients
  WITH (security_invoker = true)
  AS SELECT * FROM public.patients WHERE deleted_at IS NULL;
