-- One-use codes that move a signed-in browser session into an installed PWA.
-- iOS gives a Home Screen app its own empty storage, so the install address carries a code
-- and the app swaps it for its own session on first launch. Codes are stored hashed.

create table if not exists auth_handoffs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Clear out old rows with the nightly purge (see 017_purge_auth.sql).
select cron.schedule(
  'purge-auth-handoffs',
  '27 21 * * *',
  $$ delete from auth_handoffs where expires_at < now() - interval '1 day'; $$
);
