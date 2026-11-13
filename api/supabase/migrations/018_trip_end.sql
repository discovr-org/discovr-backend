-- When a guest leaves Goa, from the "Till when are you in Goa?" sheet.
-- status: date (has a last day), later (staying past what we showed), local (lives here), not_yet (planning).
-- trip_ask_again_on: the day we may ask again. Null means never (locals) or not set.

alter table users add column if not exists trip_status text
  check (trip_status in ('date', 'later', 'local', 'not_yet'));
alter table users add column if not exists trip_last_day date;
alter table users add column if not exists trip_ask_again_on date;
