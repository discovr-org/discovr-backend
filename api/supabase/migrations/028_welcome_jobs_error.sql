-- Why the last try failed, so a "failed" job explains itself.
alter table welcome_jobs add column if not exists last_error text;
