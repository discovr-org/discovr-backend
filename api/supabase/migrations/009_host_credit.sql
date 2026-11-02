-- How the guest app credits this host: Hosted by / Run by / Owned by

alter table hosts
  add column if not exists credit text not null default 'hosted'
  check (credit in ('hosted', 'run', 'owned'));
