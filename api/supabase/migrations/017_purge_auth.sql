-- Delete old OTPs and sessions every night so these tables don't grow forever.
-- Needs the pg_cron extension (Supabase dashboard > Database > Extensions).

create extension if not exists pg_cron;

select cron.schedule(
  'purge-auth',
  '17 21 * * *', -- 21:17 UTC = 02:47 IST
  $$
    delete from auth_otps where expires_at < now() - interval '1 day';
    delete from auth_sessions
      where expires_at < now() - interval '1 day'
         or revoked_at < now() - interval '7 days';
  $$
);
