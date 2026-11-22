-- Queue of welcome WhatsApps: one job per new user, sent a couple of minutes after sign-up.
-- run_at doubles as a lease: a claimed job is pushed 5 min ahead, so a crash just means a retry.

create table if not exists welcome_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users (id) on delete cascade,
  phone_e164 text not null,
  run_at timestamptz not null,
  status text not null default 'pending', -- pending | done | failed
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists welcome_jobs_due_idx on welcome_jobs (run_at) where status = 'pending';
