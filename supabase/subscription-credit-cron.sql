-- Enable pg_cron in Supabase Dashboard first (Database > Extensions).
-- This runs the daily subscription release job every day at 00:05 UTC.

select cron.schedule(
  'subscription-daily-credit-release',
  '5 0 * * *',
  $$select public.release_subscription_daily_credits();$$
);

-- Optional: remove old job (run manually when needed)
-- select cron.unschedule('subscription-daily-credit-release');
