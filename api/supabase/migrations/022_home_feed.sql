-- Home feed: the sections on the guest home page, set in the admin.
-- One row. [{ id, title, layout: "rail" | "stack", slugs: [listing slug, ...] }, ...]
-- The row is seeded with today's feed, so the guest home looks the same until the admin edits it.

create table if not exists home_feed (
  id int primary key default 1 check (id = 1),
  sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into home_feed (id, sections) values (1, $json$[
 {
  "id": "sundowners",
  "title": "The best sundowners of North Goa",
  "layout": "rail",
  "slugs": [
   "pisco-by-the-beach",
   "bastian-riviera",
   "slow-tide",
   "paloma"
  ]
 },
 {
  "id": "nightlife",
  "title": "Nightlife",
  "layout": "rail",
  "slugs": [
   "juna",
   "raeeth",
   "the-loft-at-anamiva",
   "hideaway"
  ]
 },
 {
  "id": "surfing",
  "title": "Surfing",
  "layout": "stack",
  "slugs": [
   "surf-wala"
  ]
 },
 {
  "id": "local-bars",
  "title": "The OG local bars of Goa",
  "layout": "rail",
  "slugs": [
   "cajy-bar",
   "pablos"
  ]
 },
 {
  "id": "wakeboarding",
  "title": "Wakeboarding",
  "layout": "stack",
  "slugs": [
   "101-wakepark"
  ]
 },
 {
  "id": "padel",
  "title": "Padel",
  "layout": "stack",
  "slugs": [
   "coco-padel"
  ]
 },
 {
  "id": "cocktails",
  "title": "The finest cocktails of Goa",
  "layout": "rail",
  "slugs": [
   "drop-dead-sexy",
   "boilermaker",
   "mtw-bar-and-toasties"
  ]
 },
 {
  "id": "goan-local",
  "title": "Eat and drink like a Goan local",
  "layout": "rail",
  "slugs": [
   "bombil",
   "vinayak-family-restaurant",
   "kokni-kanteen",
   "ritz-classic-panjim"
  ]
 },
 {
  "id": "kayaking",
  "title": "Kayaking",
  "layout": "rail",
  "slugs": [
   "baga-mangrove-kayaking",
   "palolem-beach-kayaking"
  ]
 },
 {
  "id": "pottery",
  "title": "Pottery",
  "layout": "stack",
  "slugs": [
   "mati-earth-studio"
  ]
 },
 {
  "id": "tattoo",
  "title": "Tattoo",
  "layout": "stack",
  "slugs": [
   "angel-tattoo"
  ]
 }
]$json$::jsonb)
on conflict (id) do nothing;
