-- Hybrid content bag + seed four sundowners from the research sheet.
-- Safe to re-run: deletes/reinserts by known slugs.

alter table experiences
  add column if not exists content jsonb not null default '{}'::jsonb;

-- Wipe prior seed for these slugs (children cascade from experiences)
delete from experiences
where slug in ('paloma', 'bastian-riviera', 'pisco-by-the-beach', 'slow-tide');

delete from hosts
where business_name in ('Paloma', 'Bastian Riviera', 'Pisco By The Beach', 'Slow Tide')
  and person_name = 'Reservations team';

-- ---------------------------------------------------------------------------
-- Hosts
-- ---------------------------------------------------------------------------
insert into hosts (id, business_name, person_name, phone_e164, verified, languages)
values
  ('11111111-1111-4111-8111-111111111101', 'Paloma', 'Reservations team', '+919503957036', false, '{}'),
  ('11111111-1111-4111-8111-111111111102', 'Bastian Riviera', 'Reservations team', '+918655854584', false, '{}'),
  ('11111111-1111-4111-8111-111111111103', 'Pisco By The Beach', 'Reservations team', '+919665378055', false, '{}'),
  ('11111111-1111-4111-8111-111111111104', 'Slow Tide', 'Reservations team', '+918055255266', false, '{}');

-- ---------------------------------------------------------------------------
-- Experiences
-- ---------------------------------------------------------------------------
insert into experiences (
  id, slug, title, status, host_id, verdict, about,
  duration_minutes, group_size_max, group_size_label,
  place_name, place_neighborhood, place_lat, place_lng,
  price_from_inr, price_ask, price_paid_to,
  schedule, policy, content,
  published_at
) values
(
  '22222222-2222-4222-8222-222222222201',
  'paloma',
  'Paloma',
  'published',
  '11111111-1111-4111-8111-111111111101',
  'A rooftop table, a sea breeze, and no rush to leave.',
  'Rooftop dining in Anjuna with sea views, cocktails, and sunset tables. Book ahead if you want a good seat for golden hour.',
  120,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Paloma',
  'Anjuna, North Goa',
  15.5736,
  73.7405,
  2200,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"11:30 AM–midnight","bestTime":"Arrive around 5 PM and settle in before sunset.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Check your booking for any event cover or sunset minimum spend.","booking":["Reserve ahead for a sunset table.","No regular cover charge; event nights may have a cover of ₹1,000–₹1,300 — call ahead."],"cancellation":["Check the cancellation terms on your booking confirmation."]}'::jsonb,
  '{"aka":"Paloma Cafe","priceNarrative":"Approx. ₹2,200","priceUnit":"For two, excluding alcohol and taxes.","meetingPoint":"Paloma, H 727, Prais Waddo, Anjuna, North Goa","faqs":[{"q":"Why go?","a":"Rooftop sea views and sunset cocktails."},{"q":"Should I book?","a":"Reserve ahead for a sunset table."},{"q":"Is there a cover?","a":"Usually no; event nights may be charged."}],"phones":["+91 95039 57036","+91 88568 07036"],"mapsLabel":"Map","bookLabel":"Book","menuLabel":"Menu"}'::jsonb,
  now()
),
(
  '22222222-2222-4222-8222-222222222202',
  'bastian-riviera',
  'Bastian Riviera',
  'published',
  '11111111-1111-4111-8111-111111111102',
  'Start by the backwaters. See where the evening takes you.',
  'Start beside the Morjim backwaters, with cabanas, pyramid-inspired architecture and a pool around you. Bastian Riviera gives you room to settle into a long meal before the music sets the pace for the evening. Pool access is booked and charged separately.',
  180,
  8,
  'Come solo, as a couple, with friends or with family; late-night age rules apply.',
  'Bastian Riviera',
  'Morjim, Parse, North Goa',
  15.6308,
  73.7352,
  3000,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"Noon–12:30 AM","bestTime":"Late afternoon, with time to enjoy the backwaters before evening.","ageGroup":"On weekends, entry after 10 PM is 21+. Children may visit earlier, subject to venue rules.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Pool access and entry rules apply.","booking":["Walk-ins are welcome, but tables can fill up. Book ahead, especially for busy evenings.","Pool access costs extra."],"cancellation":["Cancel at least 24 hours ahead for a full refund.","Between 12 and 24 hours, no refund is offered, but you can move your booking to another date."]}'::jsonb,
  '{"aka":"","priceNarrative":"Weekdays: ₹3,000 per person, all day. Weekends: ₹3,000 per person until 4 PM; ₹5,000 per person from 4 PM onwards.","priceUnit":"Per person","meetingPoint":"Bastian Riviera, Morjim, Parse, North Goa 403512","faqs":[{"q":"Is the pool included?","a":"No, access is charged separately."},{"q":"Can I walk in?","a":"Yes, subject to availability."},{"q":"Late-night entry?","a":"Weekend entry after 10 PM is 21+."}],"phones":["+91 86558 54584"],"termsDetail":"Pool access: ₹1,000 plus tax per person, Tuesday–Sunday, 2–10 PM. Venue dress code and entry rules apply.","whatsappLabel":"WhatsApp","mapsLabel":"Map","bookLabel":"Book","menuLabel":"Menu"}'::jsonb,
  now()
),
(
  '22222222-2222-4222-8222-222222222203',
  'pisco-by-the-beach',
  'Pisco By The Beach',
  'published',
  '11111111-1111-4111-8111-111111111103',
  'Take the hammock seat. Let the waves set the pace.',
  'There’s a hammock seat above the shoreline and a view that makes it easy to lose track of time. At Pisco By The Beach, you can watch the water, order from the daytime or evening menu, and let sunset turn into a music-filled evening.',
  120,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Bastian Riviera',
  'Anjuna, North Goa',
  15.5752,
  73.7421,
  1500,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"12:30 PM–midnight","bestTime":"Arrive around 5 PM for sunset.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Minimum spend depends on seating.","booking":["Hammock seating fits up to three guests.","Expect louder DJ music around sunset.","Book by phone or WhatsApp."],"cancellation":[]}'::jsonb,
  '{"aka":"","priceNarrative":"Minimum spend: ₹1,500–₹2,500 per person, depending on seating.","priceUnit":"Per person; redeemable against your order.","meetingPoint":"Pisco By The Beach, St Michael Vaddo, near Anjuna Flea Market, Anjuna 403509","faqs":[{"q":"Want a hammock?","a":"Ask about availability when booking."},{"q":"How many can share one?","a":"Up to three guests."},{"q":"Is it quiet?","a":"DJ music can be loud around sunset."}],"phones":["+91 96653 78055","+91 91750 57207"],"termsDetail":"Minimum spend per person: hammock ₹2,500; premium sea view ₹2,000; regular sea view ₹1,500. Check your seating category when booking.","whatsappLabel":"wa","mapsLabel":"Map","bookLabel":"Book by phone or WhatsApp","menuLabel":"Menu"}'::jsonb,
  now()
),
(
  '22222222-2222-4222-8222-222222222204',
  'slow-tide',
  'Slow Tide',
  'published',
  '11111111-1111-4111-8111-111111111104',
  'An old Anjuna shack, with a new chapter by the sea.',
  'Slow Tide sits where Anjuna’s old San Francisco shack once stood. Its coastal food, cocktails and sea views carry that beachside chapter into a new space. Book a sea-facing table, arrive before sunset, and leave yourself time to linger over dinner.',
  120,
  8,
  'Come solo, as a couple, with friends or with family.',
  'Slow Tide',
  'Anjuna, North Goa',
  15.5794,
  73.7408,
  2400,
  false,
  'paid to the venue',
  '{"days":"Daily","timeSlot":"11 AM–11:30 PM","bestTime":"Late afternoon, before sunset.","ageGroup":"All ages. Alcohol service is subject to age restrictions.","minPeople":"1 for normal dining"}'::jsonb,
  '{"summary":"Check your booking for the cover charge and any minimum spend.","booking":["Book sea-facing seats early.","The access road is narrow and parking may be a short walk away.","Call the venue about walk-in entry."],"cancellation":[]}'::jsonb,
  '{"aka":"Former site of San Francisco shack","priceNarrative":"Approx. ₹2,400–₹2,500 for two. Online cover: ₹1,000 per person.","priceUnit":"Dining estimate for two, excluding alcohol and taxes. Cover is charged per person.","meetingPoint":"Slow Tide, Dmello Vaddo, Anjuna, North Goa 403509","faqs":[{"q":"Where should I sit?","a":"Ask for a sea-facing table."},{"q":"Can I walk in?","a":"Call ahead about entry."},{"q":"Parking?","a":"Allow time for a short walk."}],"phones":["+91 80552 55266"],"instagramLabel":"Instagram","mapsLabel":"Map","bookLabel":"Book","menuLabel":"Menu"}'::jsonb,
  now()
);

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------
insert into experience_tags (experience_id, tag) values
  ('22222222-2222-4222-8222-222222222201', 'Rooftop'),
  ('22222222-2222-4222-8222-222222222201', 'Sea View'),
  ('22222222-2222-4222-8222-222222222201', 'Sunset'),
  ('22222222-2222-4222-8222-222222222201', 'Cocktails'),
  ('22222222-2222-4222-8222-222222222201', 'Date Night'),
  ('22222222-2222-4222-8222-222222222202', 'Luxury'),
  ('22222222-2222-4222-8222-222222222202', 'Waterfront'),
  ('22222222-2222-4222-8222-222222222202', 'Sundowner'),
  ('22222222-2222-4222-8222-222222222202', 'Pool'),
  ('22222222-2222-4222-8222-222222222202', 'Cocktails'),
  ('22222222-2222-4222-8222-222222222202', 'Music'),
  ('22222222-2222-4222-8222-222222222203', 'Beachfront'),
  ('22222222-2222-4222-8222-222222222203', 'Hammock Seating'),
  ('22222222-2222-4222-8222-222222222203', 'Sunset'),
  ('22222222-2222-4222-8222-222222222203', 'Cocktails'),
  ('22222222-2222-4222-8222-222222222203', 'Music'),
  ('22222222-2222-4222-8222-222222222204', 'Beachfront'),
  ('22222222-2222-4222-8222-222222222204', 'Coastal Cuisine'),
  ('22222222-2222-4222-8222-222222222204', 'Cocktails'),
  ('22222222-2222-4222-8222-222222222204', 'Heritage'),
  ('22222222-2222-4222-8222-222222222204', 'Sunset');

