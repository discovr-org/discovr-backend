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
  active boolean not null default true,
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
-- Hybrid content bag + seed four sundowners from the research sheet.
-- Safe to re-run: deletes/reinserts by known slugs.

alter table experiences
  add column if not exists content jsonb not null default '{}'::jsonb;

-- Wipe prior seed for these slugs (children cascade from experiences)
delete from feed_section_items
where experience_id in (
  select id from experiences
  where slug in ('paloma', 'bastian-riviera', 'pisco-by-the-beach', 'slow-tide')
);

delete from experiences
where slug in ('paloma', 'bastian-riviera', 'pisco-by-the-beach', 'slow-tide');

delete from hosts
where business_name in ('Paloma', 'Bastian Riviera', 'Pisco By The Beach', 'Slow Tide')
  and person_name = 'Reservations team';

-- ---------------------------------------------------------------------------
-- Hosts
-- ---------------------------------------------------------------------------
insert into hosts (id, business_name, person_name, phone_e164, verified, languages)
values
  ('11111111-1111-4111-8111-111111111101', 'Paloma', 'Reservations team', '+919503957036', false, '{}'),
  ('11111111-1111-4111-8111-111111111102', 'Bastian Riviera', 'Reservations team', '+918655854584', false, '{}'),
  ('11111111-1111-4111-8111-111111111103', 'Pisco By The Beach', 'Reservations team', '+919665378055', false, '{}'),
  ('11111111-1111-4111-8111-111111111104', 'Slow Tide', 'Reservations team', '+918055255266', false, '{}');

-- ---------------------------------------------------------------------------
-- Experiences
-- ---------------------------------------------------------------------------
insert into experiences (
  id, slug, title, status, host_id, verdict, about,
  duration_minutes, group_size_max, group_size_label,
  place_name, place_neighborhood, place_lat, place_lng,
  price_from_inr, price_ask, price_paid_to,
  schedule, policy, content,
  published_at
) values
(
  '22222222-2222-4222-8222-222222222201',
  'paloma',
  'Paloma',
  'published',
  '11111111-1111-4111-8111-111111111101',
  'A rooftop table, a sea breeze, and no rush to leave.',
  'Rooftop dining in Anjuna with sea views, cocktails, and sunset tables. Book ahead if you want a good seat for golden hour.',
  120,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Paloma',
  'Anjuna, North Goa',
  15.5736,
  73.7405,
  2200,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"11:30 AM–midnight","bestTime":"Arrive around 5 PM and settle in before sunset.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Check your booking for any event cover or sunset minimum spend.","booking":["Reserve ahead for a sunset table.","No regular cover charge; event nights may have a cover of ₹1,000–₹1,300 — call ahead."],"cancellation":["Check the cancellation terms on your booking confirmation."]}'::jsonb,
  '{"aka":"Paloma Cafe","priceNarrative":"Approx. ₹2,200","priceUnit":"For two, excluding alcohol and taxes.","meetingPoint":"Paloma, H 727, Prais Waddo, Anjuna, North Goa","durationLabel":"Allow 1.5–2.5 hours.","additionalInfo":"No regular cover charge. Event nights may have a cover of ₹1,000–₹1,300, so call ahead if you’re coming for an event.","termsDetail":"Check your booking for any event cover or sunset minimum spend.","faqs":[{"q":"Why go?","a":"Rooftop sea views and sunset cocktails."},{"q":"Should I book?","a":"Reserve ahead for a sunset table."},{"q":"Is there a cover?","a":"Usually no; event nights may be charged."}],"phones":["+91 95039 57036","+91 88568 07036"],"tagsOnDisplay":["Rooftop","Sea View","Sunset","Cocktails","Date Night"],"links":{"maps":{"label":"Map","url":"https://www.google.com/maps/search/?api=1&query=Paloma%20H%20727%2C%20Prais%20Waddo%2C%20Anjuna%2C%20North%20Goa%20Goa"},"book":{"label":"Book","url":"https://www.district.in/dining/goa/paloma-anjuna"},"menu":{"label":"Menu","url":"https://www.district.in/dining/goa/paloma-anjuna"}}}'::jsonb,
  now()
),
(
  '22222222-2222-4222-8222-222222222202',
  'bastian-riviera',
  'Bastian Riviera',
  'published',
  '11111111-1111-4111-8111-111111111102',
  'Start by the backwaters. See where the evening takes you.',
  'Start beside the Morjim backwaters, with cabanas, pyramid-inspired architecture and a pool around you. Bastian Riviera gives you room to settle into a long meal before the music sets the pace for the evening. Pool access is booked and charged separately.',
  180,
  8,
  'Come solo, as a couple, with friends or with family; late-night age rules apply.',
  'Bastian Riviera',
  'Morjim, Parse, North Goa',
  15.6308,
  73.7352,
  3000,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"Noon–12:30 AM","bestTime":"Late afternoon, with time to enjoy the backwaters before evening.","ageGroup":"On weekends, entry after 10 PM is 21+. Children may visit earlier, subject to venue rules.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Pool access and entry rules apply.","booking":["Walk-ins are welcome, but tables can fill up. Book ahead, especially for busy evenings.","Pool access costs extra."],"cancellation":["Cancel at least 24 hours ahead for a full refund.","Between 12 and 24 hours, no refund is offered, but you can move your booking to another date."]}'::jsonb,
  '{"aka":"","priceNarrative":"Weekdays: ₹3,000 per person, all day. Weekends: ₹3,000 per person until 4 PM; ₹5,000 per person from 4 PM onwards.","priceUnit":"Per person","meetingPoint":"Bastian Riviera, Morjim, Parse, North Goa 403512","durationLabel":"Allow 2–4 hours, subject to your booking.","additionalInfo":"Walk-ins are welcome, but tables can fill up. Book ahead, especially for busy evenings. Pool access costs extra.","termsDetail":"Pool access: ₹1,000 plus tax per person, Tuesday–Sunday, 2–10 PM. Venue dress code and entry rules apply.","faqs":[{"q":"Is the pool included?","a":"No, access is charged separately."},{"q":"Can I walk in?","a":"Yes, subject to availability."},{"q":"Late-night entry?","a":"Weekend entry after 10 PM is 21+."}],"phones":["+91 86558 54584"],"tagsOnDisplay":["Luxury","Waterfront","Sundowner","Pool","Cocktails","Music"],"links":{"maps":{"label":"Map","url":"https://www.google.com/maps/search/?api=1&query=Bastian%20Riviera%20Morjim%2C%20Parse%2C%20North%20Goa%20403512%20Goa"},"book":{"label":"Book","url":"https://www.bastianhospitality.com/riviera"},"whatsapp":{"label":"WhatsApp","url":"https://wa.me/918655854583"},"menu":{"label":"Menu","url":"https://www.bastianhospitality.com/riviera"}}}'::jsonb,
  now()
),
(
  '22222222-2222-4222-8222-222222222203',
  'pisco-by-the-beach',
  'Pisco By The Beach',
  'published',
  '11111111-1111-4111-8111-111111111103',
  'Take the hammock seat. Let the waves set the pace.',
  'There’s a hammock seat above the shoreline and a view that makes it easy to lose track of time. At Pisco By The Beach, you can watch the water, order from the daytime or evening menu, and let sunset turn into a music-filled evening.',
  120,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Bastian Riviera',
  'Anjuna, North Goa',
  15.5752,
  73.7421,
  1500,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"12:30 PM–midnight","bestTime":"Arrive around 5 PM for sunset.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Minimum spend depends on seating.","booking":["Hammock seating fits up to three guests.","Expect louder DJ music around sunset.","Book by phone or WhatsApp."],"cancellation":[]}'::jsonb,
  '{"aka":"","priceNarrative":"Minimum spend: ₹1,500–₹2,500 per person, depending on seating.","priceUnit":"Per person; redeemable against your order.","meetingPoint":"Pisco By The Beach, St Michael Vaddo, near Anjuna Flea Market, Anjuna 403509","durationLabel":"Allow 1.5–2.5 hours.","additionalInfo":"Hammock seating fits up to three guests. Expect louder DJ music around sunset.","termsDetail":"Minimum spend per person: hammock ₹2,500; premium sea view ₹2,000; regular sea view ₹1,500. Check your seating category when booking.","faqs":[{"q":"Want a hammock?","a":"Ask about availability when booking."},{"q":"How many can share one?","a":"Up to three guests."},{"q":"Is it quiet?","a":"DJ music can be loud around sunset."}],"phones":["+91 96653 78055","+91 91750 57207"],"tagsOnDisplay":["Beachfront","Hammock Seating","Sunset","Cocktails","Music"],"links":{"maps":{"label":"Map","url":"https://www.google.com/maps/search/?api=1&query=Pisco%20By%20The%20Beach%20St%20Michael%20Vaddo%2C%20near%20Anjuna%20Flea%20Market%2C%20Anjuna%20403509%20Goa"},"book":{"label":"Book by phone or WhatsApp","url":"https://api.whatsapp.com/send/?phone=919665378055&text&type=phone_number&app_absent=0"},"whatsapp":{"label":"wa","url":"https://api.whatsapp.com/send/?phone=919665378055&text&type=phone_number&app_absent=0"},"menu":{"label":"Menu","url":"https://piscobythebeach.com/"}}}'::jsonb,
  now()
),
(
  '22222222-2222-4222-8222-222222222204',
  'slow-tide',
  'Slow Tide',
  'published',
  '11111111-1111-4111-8111-111111111104',
  'An old Anjuna shack, with a new chapter by the sea.',
  'Slow Tide sits where Anjuna’s old San Francisco shack once stood. Its coastal food, cocktails and sea views carry that beachside chapter into a new space. Book a sea-facing table, arrive before sunset, and leave yourself time to linger over dinner.',
  120,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Slow Tide',
  'Anjuna, North Goa',
  15.5794,
  73.7408,
  2400,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"11 AM–11:30 PM","bestTime":"Late afternoon, before sunset.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Check your booking for the cover charge and any minimum spend.","booking":["Book sea-facing seats early.","The access road is narrow and parking may be a short walk away.","Call the venue about walk-in entry."],"cancellation":[]}'::jsonb,
  '{"aka":"Former site of San Francisco shack","priceNarrative":"Approx. ₹2,400–₹2,500 for two. Online cover: ₹1,000 per person.","priceUnit":"Dining estimate for two, excluding alcohol and taxes. Cover is charged per person.","meetingPoint":"Slow Tide, Dmello Vaddo, Anjuna, North Goa 403509","durationLabel":"Allow 1.5–2.5 hours.","additionalInfo":"Book sea-facing seats early. The access road is narrow and parking may be a short walk away. Call the venue about walk-in entry.","termsDetail":"Check your booking for the cover charge and any minimum spend.","faqs":[{"q":"Where should I sit?","a":"Ask for a sea-facing table."},{"q":"Can I walk in?","a":"Call ahead about entry."},{"q":"Parking?","a":"Allow time for a short walk."}],"phones":["+91 80552 55266"],"tagsOnDisplay":["Beachfront","Coastal Cuisine","Cocktails","Heritage","Sunset"],"links":{"maps":{"label":"Map","url":"https://www.google.com/maps/search/?api=1&query=Slow%20Tide%20Dmello%20Vaddo%2C%20Anjuna%2C%20North%20Goa%20403509%20Goa"},"book":{"label":"Book","url":"http://bookings.airmenus.in/"},"instagram":{"label":"Instagram","url":"https://www.instagram.com/slowtidegoa/"},"menu":{"label":"Menu","url":"https://www.zomato.com/goa/slow-tide-anjuna/menu"}}}'::jsonb,
  now()
);

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------
insert into experience_tags (experience_id, tag) values
  ('22222222-2222-4222-8222-222222222201', 'Rooftop'),
  ('22222222-2222-4222-8222-222222222201', 'Sea View'),
  ('22222222-2222-4222-8222-222222222201', 'Sunset'),
  ('22222222-2222-4222-8222-222222222201', 'Cocktails'),
  ('22222222-2222-4222-8222-222222222201', 'Date Night'),
  ('22222222-2222-4222-8222-222222222202', 'Luxury'),
  ('22222222-2222-4222-8222-222222222202', 'Waterfront'),
  ('22222222-2222-4222-8222-222222222202', 'Sundowner'),
  ('22222222-2222-4222-8222-222222222202', 'Pool'),
  ('22222222-2222-4222-8222-222222222202', 'Cocktails'),
  ('22222222-2222-4222-8222-222222222202', 'Music'),
  ('22222222-2222-4222-8222-222222222203', 'Beachfront'),
  ('22222222-2222-4222-8222-222222222203', 'Hammock Seating'),
  ('22222222-2222-4222-8222-222222222203', 'Sunset'),
  ('22222222-2222-4222-8222-222222222203', 'Cocktails'),
  ('22222222-2222-4222-8222-222222222203', 'Music'),
  ('22222222-2222-4222-8222-222222222204', 'Beachfront'),
  ('22222222-2222-4222-8222-222222222204', 'Coastal Cuisine'),
  ('22222222-2222-4222-8222-222222222204', 'Cocktails'),
  ('22222222-2222-4222-8222-222222222204', 'Heritage'),
  ('22222222-2222-4222-8222-222222222204', 'Sunset');

-- ---------------------------------------------------------------------------
-- Feed rail
-- ---------------------------------------------------------------------------
insert into feed_sections (id, slug, title, density, sort_order, active)
values (
  '33333333-3333-4333-8333-333333333301',
  'sundowners',
  'Find your table for sunset',
  'landscape',
  10,
  true
)
on conflict (slug) do update
set title = excluded.title,
    active = true;

delete from feed_section_items
where section_id = '33333333-3333-4333-8333-333333333301';

insert into feed_section_items (section_id, experience_id, sort_order) values
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222201', 0),
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222202', 1),
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222203', 2),
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222204', 3);
