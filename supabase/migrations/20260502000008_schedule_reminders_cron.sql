-- Enable pg_cron and pg_net extensions (required for scheduled HTTP calls)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Safe unschedule: only if job exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'send-whatsapp-reminders'
  ) THEN
    PERFORM cron.unschedule('send-whatsapp-reminders');
  END IF;
END $$;

-- Schedule the Edge Function to run every hour
-- This calls the send-reminders Edge Function via pg_net HTTP
SELECT cron.schedule(
  'send-whatsapp-reminders',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
