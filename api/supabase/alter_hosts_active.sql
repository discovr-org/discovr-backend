-- Hosts can be inactive without deleting them.
-- Inactive hosts' listings stay out of the public feed / detail API.
alter table hosts
  add column if not exists active boolean not null default true;
