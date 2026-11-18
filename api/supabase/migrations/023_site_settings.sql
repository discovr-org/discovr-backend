-- Site settings: words and links the guest app shows everywhere, set in the admin.
-- One row. Seeded with today's text, so the guest app looks the same until the admin edits it.
-- Colours and fonts are not here on purpose: they stay brand tokens in code.

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into site_settings (id, settings) values (1, $json$
{
 "tagline": "Goa, from people who know where to go",
 "searchPlaceholder": "Search Goa",
 "footerPromise": "discovr the best of what Goa has to offer",
 "footerLinks": [
  { "label": "Saved", "href": "/saved" },
  { "label": "Things to do in Goa", "href": "/goa-for-you" },
  { "label": "About us", "href": "/about" },
  { "label": "How we pick", "href": "/how-we-pick" },
  { "label": "List with us", "href": "/list-with-us" },
  { "label": "Help", "href": "/help" }
 ]
}
$json$::jsonb)
on conflict (id) do nothing;
