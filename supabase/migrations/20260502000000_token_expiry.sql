-- Issue 1: Add token expiry column to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reschedule_token_expires_at TIMESTAMPTZ;

-- Add a partial index so token lookups are fast
CREATE INDEX IF NOT EXISTS idx_appt_token 
ON appointments(reschedule_token) 
WHERE reschedule_token IS NOT NULL;
