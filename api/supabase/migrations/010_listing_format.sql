-- Listing format drives the detail page: venues get the place page, the rest the experience page.
-- Only fills listings that don't have a format yet.
update experiences
set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('format', 'venue')
where coalesce(content ->> 'format', '') = ''
  and slug in (
    'paloma', 'bastian-riviera', 'pisco-by-the-beach', 'slow-tide',
    'raeeth', 'the-loft-at-anamiva', 'juna', 'hideaway', 'boilermaker',
    'cajy-bar', 'pablos',
    'drop-dead-sexy', 'mtw-bar-and-toasties',
    'bombil', 'vinayak-family-restaurant', 'kokni-kanteen', 'ritz-classic-panjim'
  );

update experiences
set content = coalesce(content, '{}'::jsonb) || jsonb_build_object('format', 'trip')
where coalesce(content ->> 'format', '') = '';
