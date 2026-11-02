-- Guest saved experiences (by slug for shareable sync with the PWA)

create table if not exists user_saves (
  user_id uuid not null references users (id) on delete cascade,
  experience_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, experience_slug)
);

create index if not exists user_saves_user_id_idx on user_saves (user_id);
create index if not exists user_saves_slug_idx on user_saves (experience_slug);
