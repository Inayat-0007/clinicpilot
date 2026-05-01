-- Issue 14: DPDP Act compliance — consent tracking
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_source TEXT DEFAULT 'booking_form';

-- Data deletion request tracking
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_phone_hash TEXT NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed'))
);
