-- Category weight: decides the order of rows on the guest home page. Higher weight = higher up.
-- 1 to 1000, default 1, so every existing category keeps the order it has today until the admin sets weights.

alter table categories
  add column if not exists weight integer not null default 1;

alter table categories
  drop constraint if exists categories_weight_range;
alter table categories
  add constraint categories_weight_range check (weight between 1 and 1000);
