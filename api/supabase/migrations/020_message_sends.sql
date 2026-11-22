-- Every WhatsApp template message ops send from the admin, so nobody gets the same one twice
-- and ops can see what happened to each message.

create table if not exists message_sends (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null,
  user_id uuid not null references users (id) on delete cascade,
  phone_e164 text not null,
  template_id text not null,
  provider_message_id text,
  status text not null,
  failed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists message_sends_batch_idx on message_sends (batch_id);
create index if not exists message_sends_template_user_idx on message_sends (template_id, user_id);
