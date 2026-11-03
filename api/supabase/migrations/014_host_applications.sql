-- "List with us" form: hosts telling us what they run. The team follows up on WhatsApp.

create table if not exists host_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_e164 text not null,
  city text not null,
  description text not null,
  created_at timestamptz not null default now()
);
