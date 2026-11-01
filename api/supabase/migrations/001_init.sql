-- discovr-catalog — curated Gen Z experiences (Headout-like shortlist, not a marketplace dump)
-- Apply in the Supabase project named discovr-catalog.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Hosts
-- ---------------------------------------------------------------------------
create table hosts (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  person_name text not null,
  phone_e164 text not null,
  instagram_handle text,
  avatar_url text,
  avatar_alt text,
  verified boolean not null default false,
  languages text[] not null default '{}',
  experience_count int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Experiences (system of record for a listing)
-- ---------------------------------------------------------------------------
create table experiences (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  host_id uuid not null references hosts (id),
  verdict text,
  about text not null default '',
  duration_minutes int not null check (duration_minutes > 0),
  group_size_max int not null check (group_size_max > 0),
  group_size_label text not null,
  place_name text not null,
  place_neighborhood text not null,
  place_lat double precision not null,
  place_lng double precision not null,
  price_from_inr int not null default 0 check (price_from_inr >= 0),
  price_ask boolean not null default false,
  price_paid_to text not null default 'paid to the host',
  schedule jsonb not null default '{}'::jsonb,
  policy jsonb,
  rating_avg numeric(2, 1),
  rating_count int not null default 0 check (rating_count >= 0),
  rating_bucket_5 int not null default 0,
  rating_bucket_4 int not null default 0,
  rating_bucket_3 int not null default 0,
  rating_bucket_2 int not null default 0,
  rating_bucket_1 int not null default 0,
  cover_photo_url text,
  cover_photo_alt text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector,
  constraint experiences_published_needs_verdict check (
    status <> 'published' or (verdict is not null and length(trim(verdict)) > 0)
  ),
  constraint experiences_rating_pair check (
    (rating_count = 0 and rating_avg is null)
    or (rating_count > 0 and rating_avg is not null)
  )
);

create index experiences_status_published_at_idx
  on experiences (status, published_at desc nulls last);

create index experiences_host_id_idx on experiences (host_id);

create index experiences_search_idx on experiences using gin (search_vector);

create or replace function experiences_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(new.place_neighborhood, '')), 'B')
    || setweight(to_tsvector('english', coalesce(new.verdict, '')), 'C');
  new.updated_at := now();
  return new;
end;
$$;

create trigger experiences_search_vector_trg
  before insert or update of title, place_neighborhood, verdict
  on experiences
  for each row execute function experiences_search_vector_update();

-- ---------------------------------------------------------------------------
-- Ordered children
-- ---------------------------------------------------------------------------
create table experience_photos (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences (id) on delete cascade,
  src text not null,
  alt text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false
);

create index experience_photos_experience_id_idx on experience_photos (experience_id, sort_order);

create table experience_inclusions (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences (id) on delete cascade,
  included boolean not null default true,
  title text not null,
  detail text,
  detail_tone text check (detail_tone is null or detail_tone in ('positive')),
  sort_order int not null default 0
);

create index experience_inclusions_experience_id_idx on experience_inclusions (experience_id, sort_order);

create table experience_menu_pages (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences (id) on delete cascade,
  src text not null,
  label text not null,
  alt text not null,
  sort_order int not null default 0
);

create index experience_menu_pages_experience_id_idx on experience_menu_pages (experience_id, sort_order);

create table experience_tags (
  experience_id uuid not null references experiences (id) on delete cascade,
  tag text not null,
  primary key (experience_id, tag)
);

create index experience_tags_tag_idx on experience_tags (tag);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences (id) on delete cascade,
  reviewer_first_name text not null,
  context text not null,
  score smallint not null check (score between 1 and 5),
  body text not null,
  avatar_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index reviews_experience_created_idx
  on reviews (experience_id, created_at desc)
  where published = true;

-- ---------------------------------------------------------------------------
-- Editorial feed (rails), not the inventory itself
-- ---------------------------------------------------------------------------
create table feed_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  density text not null check (density in ('portrait', 'landscape')),
  sort_order int not null default 0,
  active boolean not null default true
);

create table feed_section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references feed_sections (id) on delete cascade,
  experience_id uuid not null references experiences (id) on delete cascade,
  sort_order int not null default 0,
  card_title_override text,
  card_place_override text,
  unique (section_id, experience_id)
);

create index feed_section_items_section_idx on feed_section_items (section_id, sort_order);
