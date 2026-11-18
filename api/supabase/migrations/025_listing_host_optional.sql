-- A listing can have no host (a public place, a beach). The host link becomes optional.
-- Existing listings keep their host.

alter table experiences alter column host_id drop not null;
