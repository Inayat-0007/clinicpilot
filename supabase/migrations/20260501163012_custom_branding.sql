-- Add custom branding columns to clinics table
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS brand_color text DEFAULT '#2563eb';
