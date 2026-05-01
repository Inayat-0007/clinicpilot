-- FIX #12: Add unique constraint to prevent duplicate bookings
-- This ensures a patient cannot have two 'confirmed' appointments starting at the exact same time.
-- This handles double-clicks and race conditions in the public booking flow.

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_unique_confirmed_appointment'
    ) THEN
        CREATE UNIQUE INDEX idx_unique_confirmed_appointment 
        ON appointments (patient_id, starts_at) 
        WHERE (status = 'confirmed');
    END IF;
END $$;
