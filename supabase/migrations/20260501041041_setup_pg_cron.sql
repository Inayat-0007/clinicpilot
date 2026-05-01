-- Enable the pg_net and pg_cron extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule just in case it exists to avoid duplicates
SELECT cron.unschedule('send-whatsapp-reminders');

-- Schedule the send-reminders Edge Function to run every minute
SELECT cron.schedule(
    'send-whatsapp-reminders',
    '* * * * *',
    $$
    SELECT net.http_post(
        url:='https://hllsqckrriyrvgsepssa.supabase.co/functions/v1/send-reminders',
        headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret', true)
        )
    );
    $$
);
