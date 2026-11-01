-- Guest phone login: users, OTPs, sessions

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_phone_e164_idx on users (phone_e164);

create table if not exists auth_otps (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists auth_otps_phone_created_idx
  on auth_otps (phone_e164, created_at desc);

create table if not exists auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists auth_sessions_user_id_idx on auth_sessions (user_id);
create index if not exists auth_sessions_token_hash_idx on auth_sessions (token_hash);
