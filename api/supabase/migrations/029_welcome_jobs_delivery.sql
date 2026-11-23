-- After a welcome is accepted by BotSpace, remember its id and check later whether WhatsApp delivered it.
alter table welcome_jobs
  add column if not exists message_id text,
  add column if not exists sent_at timestamptz,
  add column if not exists delivery_status text; -- null until WhatsApp says DELIVERED | READ | REPLIED | FAILED
