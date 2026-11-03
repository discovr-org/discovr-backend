-- First name from the sign-up sheet. Null until saved; a user without one is asked again on next login.

alter table users add column if not exists name text;
