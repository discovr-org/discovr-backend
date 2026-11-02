-- "Planning your Goa trip soon?" footer: WhatsApp numbers that asked to be kept posted.

create table if not exists trip_update_signups (
  phone_e164 text primary key,
  source text,
  created_at timestamptz not null default now()
);
