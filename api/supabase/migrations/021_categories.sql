-- Categories: a page layout that listings share. A listing keeps only its own content.
-- Run this before deploying the API that reads categories. Listings without a category are untouched.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  -- { sections: [{ id, show? }], story: [layout block, ...] }; the guest app draws the page from it.
  layout jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table experiences
  add column if not exists category_id uuid references categories(id) on delete restrict;

create index if not exists experiences_category_id_idx on experiences (category_id);
