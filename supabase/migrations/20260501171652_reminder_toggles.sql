-- Add reminder toggles to clinics table
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS whatsapp_reminders_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_reminders_enabled BOOLEAN DEFAULT true;
