-- Help page form: guests writing to the team. The team replies by phone or WhatsApp.

create table if not exists help_requests (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  message text not null,
  name text not null,
  phone_e164 text not null,
  created_at timestamptz not null default now()
);
